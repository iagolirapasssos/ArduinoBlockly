# Arduino Blockly IDE with Node.js: A Comprehensive Tutorial

## Introduction

This tutorial will guide you through setting up and using the Arduino Blockly IDE with Node.js. Arduino Blockly IDE is a web-based visual programming environment that allows users to create Arduino code using Blockly, a visual programming language.

### Prerequisites

Before we begin, ensure you have the following installed on your system:
- Node.js
- npm (Node Package Manager)
- Arduino CLI

## Installing Node.js and Arduino CLI

### Windows

1. **Node.js**:
   - Download the latest Node.js installer from [nodejs.org](https://nodejs.org/).
   - Run the installer and follow the prompts. Make sure to check the option to install npm.

2. **Arduino CLI**:
   - Download the latest `arduino-cli` from the [Arduino CLI releases page](https://github.com/arduino/arduino-cli/releases).
   - Extract the ZIP file and (optional) add the folder to your system PATH for easy access.

### macOS

1. **Node.js**:
   - You can install Node.js using Homebrew:
     ```bash
     brew install node
     ```

2. **Arduino CLI**:
   - Download the latest `arduino-cli` from the [Arduino CLI releases page](https://github.com/arduino/arduino-cli/releases).
   - Extract the ZIP file and move the `arduino-cli` binary to `/usr/local/bin`:
     ```bash
     mv path/to/arduino-cli /usr/local/bin/
     ```

### Linux

1. **Node.js**:
   - Install Node.js using your package manager. For example, on Ubuntu:
     ```bash
     sudo apt update
     sudo apt install nodejs npm
     ```

2. **Arduino CLI**:
   - Download the latest `arduino-cli` from the [Arduino CLI releases page](https://github.com/arduino/arduino-cli/releases).
   - Extract the ZIP file and move the `arduino-cli` binary to `/usr/local/bin`:
     ```bash
     sudo mv path/to/arduino-cli /usr/local/bin/
     ```

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
│   ├── arduino_generator.js  # Arduino code generator
│   ├── custom_generators.js  # Custom code generators
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

Feel free to adjust any details as needed!
