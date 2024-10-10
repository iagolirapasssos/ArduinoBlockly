const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const serialport = require('serialport');
const fs = require('fs').promises;

const app = express();
const port = 4000; // Porta do cliente

app.use(bodyParser.json());

// Rota para detectar portas seriais onde as placas Arduino estão conectadas
app.get('/detect', async (req, res) => {
    try {
        const ports = await serialport.list();
        const boards = ports.map(port => ({
            path: port.path,
            manufacturer: port.manufacturer
        }));
        res.json(boards);
    } catch (err) {
        console.error('Erro ao detectar portas seriais:', err);
        res.status(500).send('Erro ao detectar portas seriais');
    }
});

// Rota para fazer upload de código para a placa Arduino
app.post('/upload', (req, res) => {
    const { board, port, code } = req.body;

    // Criar sketch temporário
    const sketchName = 'temporary_sketch';
    const sketchDir = `/tmp/sketches/${sketchName}`;
    const sketchPath = `${sketchDir}/${sketchName}.ino`;

    fs.mkdir(sketchDir, { recursive: true })
        .then(() => fs.writeFile(sketchPath, code))
        .then(() => {
            const command = `arduino-cli compile -b ${board} ${sketchDir} && arduino-cli upload -p ${port} -b ${board} ${sketchDir}`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro: ${error.message}`);
                    return res.status(500).send(`Erro: ${error.message}`);
                }
                if (stderr) {
                    console.error(`Erro: ${stderr}`);
                    return res.status(500).send(`Erro: ${stderr}`);
                }
                res.send(`Upload bem-sucedido: ${stdout}`);
            });
        })
        .catch((err) => {
            console.error(`Erro ao criar sketch: ${err.message}`);
            res.status(500).send(`Erro ao criar sketch: ${err.message}`);
        });
});

app.listen(port, () => {
    console.log(`Cliente rodando em http://localhost:${port}`);
});
