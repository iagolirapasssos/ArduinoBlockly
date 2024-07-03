const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const path = require('path');
const sanitize = require('sanitize-filename');
const rimraf = require('rimraf');

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

app.post('/upload', (req, res) => {
    const { port, board, code } = req.body;

    // Sanitize the sketch name to remove special characters
    const sketchName = sanitize(`temporary_sketch_${Date.now()}`);
    const sketchDir = path.join(__dirname, 'sketches', sketchName);
    const sketchPath = path.join(sketchDir, `${sketchName}.ino`);

    // Create the sketches directory and the temporary directory if they don't exist
    if (!fs.existsSync(sketchDir)) {
        fs.mkdirSync(sketchDir, { recursive: true });
    }

    // Create the temporary sketch file
    fs.writeFileSync(sketchPath, code);

    // Verify the file was created correctly
    if (!fs.existsSync(sketchPath)) {
        return res.status(500).json({ error: 'Failed to create sketch file' });
    }

    // Command to compile and upload the code to the Arduino
    const command = `arduino-cli compile -b ${board} ${sketchDir} && arduino-cli upload -p ${port} -b ${board} ${sketchDir}`;
    exec(command, { cwd: sketchDir }, (error, stdout, stderr) => {
        // Delete the temporary directory and files
        rimraf(sketchDir, (rimrafError) => {
            if (rimrafError) {
                console.error(`Error deleting temporary files: ${rimrafError.message}`);
            }
        });

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
