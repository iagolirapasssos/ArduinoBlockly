# ArduinoBlockly

# Arduino Blockly IDE with Node.js: Installation and Usage Tutorial

This tutorial will guide you through the process of setting up and using the Arduino Blockly IDE with Node.js. This project allows you to list serial ports and compile Arduino code using Blockly.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/get-npm)

## Project Structure

The project structure should look like this:

```
ArduinoBlockly/
├── app.js
├── package.json
└── public/
    ├── index.html
    ├── script.js
    └── style.css
```

## Step 1: Initialize the Project

1. Create a new directory for your project:

   ```sh
   mkdir ArduinoBlockly
   cd ArduinoBlockly
   ```

2. Create the `package.json` file:

   ```sh
   npm init -y
   ```

3. Replace the contents of `package.json` with the following:

   ```json
   {
     "name": "ArduinoBlockly",
     "version": "1.0.0",
     "description": "Projeto para listar portas seriais e compilar código Arduino usando Blockly",
     "main": "app.js",
     "scripts": {
       "start": "node app.js"
     },
     "dependencies": {
       "@blockly/theme-dark": "^7.0.1",
       "@blockly/workspace-backpack": "^6.0.2",
       "body-parser": "^1.20.2",
       "child_process": "^1.0.2",
       "express": "^4.19.2",
       "jsdom": "^21.1.2",
       "module-alias": "^2.2.3",
       "serialport": "^9.2.8"
     },
     "author": "Francisco Iago Lira Passos",
     "license": "MIT"
   }
   ```

4. Install the dependencies:

   ```sh
   npm install
   ```

## Step 2: Create the Server (app.js)

Create the `app.js` file in the root directory with the following content:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const SerialPort = require('serialport');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Endpoint to list serial ports
app.get('/ports', (req, res) => {
  SerialPort.list()
    .then(ports => {
      res.json(ports);
    })
    .catch(err => {
      res.status(500).send(err.message);
    });
});

// Endpoint to compile and upload Arduino code
app.post('/upload', (req, res) => {
  const { code, port } = req.body;
  // Save the code to a temporary file
  const fs = require('fs');
  fs.writeFileSync('temp.ino', code);
  // Command to compile and upload the code
  const cmd = `arduino-cli compile --fqbn arduino:avr:uno temp.ino && arduino-cli upload -p ${port} --fqbn arduino:avr:uno temp.ino`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(error.message);
      return;
    }
    res.send(stdout || stderr);
  });
});

app.listen(port, () => {
  console.log(`ArduinoBlockly app listening at http://localhost:${port}`);
});
```

## Step 3: Create the Frontend

Create the `public` directory and add the following files:

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arduino Blockly IDE</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://unpkg.com/blockly/blockly.min.js"></script>
  <script src="script.js" defer></script>
</head>
<body>
  <h1>Arduino Blockly IDE</h1>
  <div id="blocklyDiv" style="height: 480px; width: 600px;"></div>
  <button id="compile">Compile & Upload</button>
  <pre id="output"></pre>
</body>
</html>
```

### `script.js`

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const blocklyDiv = document.getElementById('blocklyDiv');
  const workspace = Blockly.inject(blocklyDiv, {
    toolbox: {
      "kind": "flyoutToolbox",
      "contents": [
        {
          "kind": "block",
          "type": "controls_if"
        },
        {
          "kind": "block",
          "type": "logic_compare"
        },
        {
          "kind": "block",
          "type": "math_number"
        },
        {
          "kind": "block",
          "type": "math_arithmetic"
        },
        {
          "kind": "block",
          "type": "text"
        },
        {
          "kind": "block",
          "type": "text_print"
        }
      ]
    },
    theme: Blockly.Themes.Dark
  });

  document.getElementById('compile').addEventListener('click', () => {
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    const port = '/dev/ttyUSB0'; // Change this to your serial port
    fetch('/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, port })
    })
      .then(response => response.text())
      .then(output => {
        document.getElementById('output').textContent = output;
      })
      .catch(error => {
        document.getElementById('output').textContent = error.message;
      });
  });
});
```

### `style.css`

```css
body {
  font-family: Arial, sans-serif;
  background-color: #333;
  color: #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#blocklyDiv {
  margin: 20px;
  border: 1px solid #555;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  margin: 10px;
  cursor: pointer;
}

pre {
  background-color: #222;
  padding: 10px;
  border: 1px solid #555;
  width: 80%;
  overflow-x: auto;
}
```

## Step 4: Run the Application

1. Start the application:

   ```sh
   npm start
   ```

2. Open your web browser and navigate to `http://localhost:3000`.

You should see the Arduino Blockly IDE interface. You can create your Blockly program, and upon clicking "Compile & Upload," the code will be sent to the Arduino board via the specified serial port.

## Conclusion

You've successfully set up and run the Arduino Blockly IDE with Node.js. This project allows you to visually create Arduino programs using Blockly and upload them to your Arduino board. Happy coding!