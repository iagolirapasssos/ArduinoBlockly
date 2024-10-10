const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; // Use a versão promise do fs
const { exec } = require('child_process');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sanitize = require('sanitize-filename');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/static', express.static('static'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', async (req, res) => {
    const { port, board, code } = req.body;

    const sketchName = sanitize(`temporary_sketch_${uuidv4()}`);
    const sketchDir = path.join(__dirname, 'sketches', sketchName);
    const sketchPath = path.join(sketchDir, `${sketchName}.ino`);

    try {
        await fs.mkdir(sketchDir, { recursive: true });
        await fs.writeFile(sketchPath, code);

        try {
            await fs.access(sketchPath);
        } catch (err) {
            return res.status(500).json({ error: 'Failed to create sketch file' });
        }

        const command = `arduino-cli compile -b ${board} ${sketchDir} && arduino-cli upload -p ${port} -b ${board} ${sketchDir}`;
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
