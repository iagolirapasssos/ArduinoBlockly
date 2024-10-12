const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sanitize = require('sanitize-filename');
const https = require('https');
const selfsigned = require('selfsigned');
const SerialPort = require('serialport');
const session = require('express-session');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/static', express.static('static'));
app.use(session({
    secret: 'arduino-blockly-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/ports', async (req, res) => {
    try {
        const ports = await SerialPort.list();
        res.json(ports);
    } catch (err) {
        console.error('Error listing ports:', err);
        res.status(500).json({ error: 'Failed to list ports' });
    }
});

app.post('/connect', async (req, res) => {
    const { portPath } = req.body;
    if (!portPath) {
        return res.status(400).json({ error: 'Port path is required' });
    }

    try {
        const port = new SerialPort(portPath, { baudRate: 9600 });
        req.session.portPath = portPath;
        res.json({ message: 'Connected successfully' });
    } catch (err) {
        console.error('Error connecting to port:', err);
        res.status(500).json({ error: 'Failed to connect to port' });
    }
});

app.post('/upload', async (req, res) => {
    const { board, code, portPath } = req.body;
    if (!portPath) {
        return res.status(400).json({ error: 'Port path is required' });
    }

    const sketchName = sanitize(`temporary_sketch_${uuidv4()}`);
    const sketchDir = path.join(__dirname, 'sketches', sketchName);
    const sketchPath = path.join(sketchDir, `${sketchName}.ino`);

    try {
        await fs.mkdir(sketchDir, { recursive: true });
        await fs.writeFile(sketchPath, code);

        const command = `arduino-cli compile -b ${board} ${sketchDir} && arduino-cli upload -p ${portPath} -b ${board} ${sketchDir}`;
        exec(command, { cwd: sketchDir }, async (error, stdout, stderr) => {
            await deleteDirectoryRecursive(sketchDir);
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).json({ error: error.message });
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return res.status(500).json({ error: stderr });
            }
            console.log(`Stdout: ${stdout}`);
            res.json({ message: 'Upload successful', output: stdout });
        });
    } catch (err) {
        console.error(`Error: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
});

async function deleteDirectoryRecursive(directoryPath) {
    try {
        const files = await fs.readdir(directoryPath);
        await Promise.all(files.map(async (file) => {
            const curPath = path.join(directoryPath, file);
            const stat = await fs.lstat(curPath);
            if (stat.isDirectory()) {
                await deleteDirectoryRecursive(curPath);
            } else {
                await fs.unlink(curPath);
            }
        }));
        await fs.rmdir(directoryPath);
    } catch (err) {
        console.error(`Error deleting directory ${directoryPath}:`, err);
    }
}

async function generateCertificate() {
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, { days: 365 });
    await fs.writeFile('server.key', pems.private);
    await fs.writeFile('server.crt', pems.cert);
    return { key: pems.private, cert: pems.cert };
}

async function startServer() {
    const { key, cert } = await generateCertificate();
    const httpsServer = https.createServer({ key, cert }, app);
    httpsServer.listen(port, () => {
        console.log(`Server running at https://localhost:${port}`);
    });
}

startServer().catch(console.error);