const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; // Usando promises para operações de E/S
const { exec } = require('child_process');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/static', express.static('static'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/ports', (req, res) => {
    exec('arduino-cli board list', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }

        const ports = stdout.split('\n')
            .filter(line => line.includes('/dev/tty'))
            .map(line => {
                const [port, , board, , , name] = line.split(/\s+/);
                return { path: port, board: name || 'Unknown Board' };
            });

        res.json(ports);
    });
});

function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

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

app.post('/upload', async (req, res) => {
    const { port, board, code } = req.body;

    // Generate a unique sketch name using UUID
    const sketchName = sanitizeFilename(`temporary_sketch_${uuidv4()}`);
    const sketchDir = path.join(__dirname, 'sketches', sketchName);
    const sketchPath = path.join(sketchDir, `${sketchName}.ino`);

    try {
        // Create the sketches directory and the temporary directory if they don't exist
        await fs.mkdir(sketchDir, { recursive: true });

        // Create the temporary sketch file
        await fs.writeFile(sketchPath, code);

        // Verify the file was created correctly
        try {
            await fs.access(sketchPath);
        } catch (err) {
            return res.status(500).json({ error: 'Failed to create sketch file' });
        }

        // Command to compile and upload the code to the Arduino
        const command = `arduino-cli compile -b ${board} ${sketchDir} && arduino-cli upload -p ${port} -b ${board} ${sketchDir}`;
        exec(command, { cwd: sketchDir }, async (error, stdout, stderr) => {
            // Delete the temporary directory and files
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

app.get('/serial', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const port = new SerialPort(req.query.port, { baudRate: 9600 });
    const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

    parser.on('data', data => {
        res.write(`data: ${data}\n\n`);
    });

    port.on('error', err => {
        console.error('Error: ', err.message);
        res.write(`event: error\ndata: ${err.message}\n\n`);
        res.end();
    });

    req.on('close', () => {
        port.close();
        res.end();
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
