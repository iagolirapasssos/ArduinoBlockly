# Arduino Blockly IDE with Node.js: A Comprehensive Tutorial

## Introduction

This tutorial will guide you through setting up and using the Arduino Blockly IDE with Node.js. Arduino Blockly IDE is a web-based visual programming environment that allows users to create Arduino code using Blockly, a visual programming language.

### Prerequisites

Before we begin, ensure you have the following installed on your system:
- Node.js
- npm (Node Package Manager)

## Step 1: Setting Up the Project

### 1.1 Clone the Repository

First, clone the Arduino Blockly IDE repository to your local machine:

```sh
git clone https://github.com/iagolirapasssos/ArduinoBlockly.git
cd ArduinoBlockly
```

### 1.2 Install Dependencies

Navigate to the project directory and install the necessary dependencies using npm:

```sh
npm install
```

## Step 2: Understanding the Project Structure

Here's a brief overview of the project structure:

```
ArduinoBlockly:
├── app.js                   # Main server file
├── Blocks Examples
│   └── HelloWorld.xml       # Example Blockly XML file
├── ExternalExtensions
│   └── cryptograph_extension.js  # Example extension
├── Figures
│   ├── IDE01.png            # Screenshot of the IDE
│   └── IDE02.png            # Screenshot of the IDE
├── index.html               # Main HTML file
├── LICENSE
├── output.txt               # Example output file
├── package.json             # npm configuration file
├── package-lock.json        # npm lock file
├── README.md
├── sketches
│   ├── sketches.ino         # Example Arduino sketch
│   └── temporary_sketch
│       └── temporary_sketch.ino  # Temporary Arduino sketch
├── static                   # Static files directory
│   ├── arduino_blocks.js    # Custom Blockly blocks
│   ├── arduino_generator.js # Arduino code generator
│   ├── custom_generators.js # Custom code generators
│   ├── favicon.ico          # Favicon
│   ├── script.js            # Custom scripts
│   └── style.css            # Custom styles
```

## Step 3: Running the Application

### 3.1 Start the Server

To run the application, execute the following command in the project directory:

```sh
npm start
```

By default, the server will start on port 3000. Open your web browser and navigate to `http://localhost:3000` to access the Arduino Blockly IDE.

## Step 4: Using the Arduino Blockly IDE

### 4.1 Creating a New Project

1. Open the Arduino Blockly IDE in your web browser.
2. You will see a blank workspace where you can start dragging and dropping Blockly blocks to create your Arduino code.

### 4.2 Loading Example Blocks

1. Click on the "Load Blocks" button.
2. Select the `HelloWorld.xml` file from the `Blocks Examples` folder to load a simple example project.

### 4.3 Generating Arduino Code

1. Once you have created your block diagram, click the "Generate Code" button.
2. The generated Arduino code will appear in the code editor panel.

### 4.4 Saving and Uploading Your Code

1. To save your generated code, click on the "Save Code" button.
2. Save the file in the `sketches` folder or any desired location.
3. Open the Arduino IDE and load the saved `.ino` file.
4. Connect your Arduino board and upload the code.

## Step 5: Adding Custom Blocks and Extensions

### 5.1 Creating Custom Blocks

To create custom blocks, edit the `static/arduino_blocks.js` file. Define your custom blocks using the Blockly API.

```js
Blockly.Blocks['custom_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("custom block");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
```

### 5.2 Generating Code for Custom Blocks

Add code generation logic for your custom blocks in the `static/custom_generators.js` file.

```js
Blockly.Arduino['custom_block'] = function(block) {
  var code = 'custom code;\n';
  return code;
};
```

### 5.3 Adding External Extensions

To include external extensions, place your JavaScript files in the `ExternalExtensions` folder and reference them in `index.html`.

```html
<script src="ExternalExtensions/cryptograph_extension.js"></script>
```

## Conclusion

Congratulations! You have successfully set up and started using the Arduino Blockly IDE with Node.js. This environment allows you to create Arduino projects visually using Blockly, making it easier for beginners and experienced developers alike.

For more information and advanced customization, refer to the official Blockly and Arduino documentation. Happy coding!

---

## Creating a Private Network Using Your Notebook's IP Address

To create a private network accessible only by devices connected to your Wi-Fi and run your Node.js application on this network, follow these steps:

### 1. Connect All Devices to the Same Wi-Fi Network

Ensure all devices (your notebook and other devices) are connected to the same Wi-Fi network.

### 2. Find Your Notebook's IP Address

- On Windows, open Command Prompt and type:
  ```cmd
  ipconfig
  ```
  Look for the IPv4 address of the Wi-Fi interface.

- On macOS or Linux, open Terminal and type:
  ```bash
  ifconfig
  ```
  Look for the IPv4 address of the Wi-Fi interface (usually something like `192.168.x.x`).

### 3. Configure Your Node.js Application to Listen on All Network Interfaces

Ensure your Node.js application is configured to listen on all network interfaces. Modify the `app.js` file to use the address `0.0.0.0`:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Add this line to use UUIDs

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
            console.log(`Std

out: ${stdout}`);
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

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
});
```

### 4. Start the Node.js Server

```bash
node app.js
```

### 5. Access the Server from Other Devices

- In your web browser, access `http://<YOUR_NOTEBOOK_IP>:3000`, where `<YOUR_NOTEBOOK_IP>` is the IP address you found in step 2.

This should allow all devices connected to the same Wi-Fi network to access your Node.js server using your notebook's IP address. Ensure your firewall settings allow traffic on port 3000.


## To resolve the issue of not finding the Arduino board on Windows, follow these steps:

### 1. Install Arduino Drivers
Ensure that the Arduino drivers are correctly installed on the Windows PC. You can download the latest drivers from the official Arduino website:
- [Arduino Drivers](https://www.arduino.cc/en/Guide/DriverInstallation)

### 2. Check the COM Port in Device Manager
1. Connect your Arduino to the Windows PC via USB.
2. Open **Device Manager**:
   - Right-click on the **Start** icon and select **Device Manager**.
3. Expand the **Ports (COM & LPT)** section.
4. Check if the Arduino is listed as **Arduino Uno (COMx)**, where **x** is the COM port number assigned.

### 3. Update the Drivers
1. In Device Manager, right-click on the Arduino device and select **Update Driver**.
2. Select **Browse my computer for drivers** and then **Let me pick from a list of available drivers on my computer**.
3. Select **Arduino Uno** (or the appropriate model) and follow the instructions to complete the driver update.

### 4. Check the Physical Connection and USB Cable
- Ensure that the USB cable is working correctly. Test with another USB cable to make sure the issue is not the cable.
- Try connecting the Arduino to different USB ports on the PC.

### 5. Test the Connection with the Arduino IDE
1. Open the **Arduino IDE**.
2. Go to **Tools** > **Port** and select the COM port to which the Arduino is connected.
3. Try uploading a basic sketch, such as **Blink**, to check if the connection is working.

### 6. Update the Script for Board Detection on Windows
Modify the Node.js script to include specific support for COM ports on Windows:

```javascript
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
            .filter(line => line.includes('/dev/tty') || line.includes('COM'))
            .map(line => {
                const [port, , board, , , name] = line.split(/\s+/);
                return { path: port, board: name || 'Unknown Board' };
            });

        res.json(ports);
    });
});
```

### 7. Reinstall or Update the Arduino CLI
Ensure that the Arduino CLI is up-to-date and properly installed. This can help in detecting Arduino boards on different systems:
```sh
arduino-cli version
arduino-cli upgrade
```

By following these steps, you should be able to connect and detect the Arduino board on the Windows PC. If the issue persists, it may be necessary to check specific operating system configurations or consult the Arduino documentation and support forums.