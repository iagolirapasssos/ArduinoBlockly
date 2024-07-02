const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/static', express.static('static'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/ports', (req, res) => {
    SerialPort.list().then(ports => {
        res.json(ports);
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
});

app.post('/upload', (req, res) => {
    const { port, board, code } = req.body;

    // Nome do diretório e arquivo temporário
    const sketchName = 'temporary_sketch';
    const sketchDir = path.join(__dirname, 'sketches', sketchName);
    const sketchPath = path.join(sketchDir, `${sketchName}.ino`);

    // Cria o diretório sketches e o diretório temporário se não existirem
    if (!fs.existsSync(sketchDir)) {
        fs.mkdirSync(sketchDir, { recursive: true });
    }

    // Cria o arquivo de sketch temporário
    fs.writeFileSync(sketchPath, code);

    // Verifique se o arquivo foi criado corretamente
    if (!fs.existsSync(sketchPath)) {
        return res.status(500).json({ error: 'Failed to create sketch file' });
    }

    // Comando para compilar e fazer upload do código para o Arduino
    const command = `arduino-cli compile -b ${board} ${sketchDir} && arduino-cli upload -p ${port} -b ${board} ${sketchDir}`;
    exec(command, { cwd: sketchDir }, (error, stdout, stderr) => {
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
    const port = new SerialPort(req.query.port, { baudRate: 9600 });
    const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

    parser.on('data', data => {
        res.write(data + '\n');
    });

    port.on('error', err => {
        console.error('Error: ', err.message);
        res.status(500).json({ error: err.message });
    });

    req.on('close', () => {
        port.close();
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
