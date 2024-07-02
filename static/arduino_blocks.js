// static/arduino_blocks.js
Blockly.Blocks['text_print'] = {
    init: function() {
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.appendValueInput("TEXT")
            .setCheck(null)
            .appendField(new Blockly.FieldDropdown([["println", "PRINTLN"], ["print", "PRINT"]]), "MODE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Prints text to the serial monitor.");
        this.setHelpUrl("");
    }
};


Blockly.Blocks['arduino_setup'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Setup");
        this.appendStatementInput("SETUP")
            .setCheck(null);
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['serial_begin'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Serial.begin")
            .appendField(new Blockly.FieldDropdown([
                ["9600", "9600"], 
                ["19200", "19200"], 
                ["38400", "38400"], 
                ["57600", "57600"], 
                ["115200", "115200"]
            ]), "BAUD_RATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Initialize the serial communication with the specified baud rate.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['analog_read'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("analogRead")
            .appendField(new Blockly.FieldDropdown([
                ["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]
            ]), "PIN");
        this.setOutput(true, "Number");
        this.setColour(160);
        this.setTooltip("Read the value from the specified analog pin.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['digital_read'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("digitalRead")
            .appendField(new Blockly.FieldDropdown([
                ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]
            ]), "PIN");
        this.setOutput(true, "Boolean");
        this.setColour(160);
        this.setTooltip("Read the value from the specified digital pin.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['digital_write'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("digitalWrite")
            .appendField(new Blockly.FieldDropdown([
                ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]
            ]), "PIN")
            .appendField(new Blockly.FieldDropdown([
                ["HIGH", "HIGH"], ["LOW", "LOW"]
            ]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Write the specified value to the specified digital pin.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['pin_mode'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("pinMode")
            .appendField(new Blockly.FieldDropdown([
                ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]
            ]), "PIN")
            .appendField(new Blockly.FieldDropdown([
                ["INPUT", "INPUT"], ["OUTPUT", "OUTPUT"], ["INPUT_PULLUP", "INPUT_PULLUP"]
            ]), "MODE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Set the mode of the specified pin.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['analog_write'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("analogWrite")
            .appendField(new Blockly.FieldDropdown([
                ["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]
            ]), "PIN")
            .appendField(new Blockly.FieldNumber(0, 0, 255), "VALUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Write an analog value (PWM) to the specified pin.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['analog_reference'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("analogReference")
            .appendField(new Blockly.FieldDropdown([
                ["DEFAULT", "DEFAULT"], ["INTERNAL", "INTERNAL"], ["INTERNAL1V1", "INTERNAL1V1"], ["INTERNAL2V56", "INTERNAL2V56"], ["EXTERNAL", "EXTERNAL"]
            ]), "TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Configures the reference voltage used for analog input.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['delay'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("delay")
            .appendField(new Blockly.FieldNumber(0), "TIME");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Pauses the program for the amount of time (in milliseconds) specified as parameter.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['delay_microseconds'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("delayMicroseconds")
            .appendField(new Blockly.FieldNumber(0), "TIME");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Pauses the program for the amount of time (in microseconds) specified as parameter.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['micros'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("micros");
        this.setOutput(true, "Number");
        this.setColour(160);
        this.setTooltip("Returns the number of microseconds since the Arduino board began running the current program.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['millis'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("millis");
        this.setOutput(true, "Number");
        this.setColour(160);
        this.setTooltip("Returns the number of milliseconds since the Arduino board began running the current program.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['no_tone'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("noTone")
            .appendField(new Blockly.FieldDropdown([
                ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]
            ]), "PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Stops the generation of a square wave triggered by tone().");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['tone'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("tone")
            .appendField(new Blockly.FieldDropdown([
                ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]
            ]), "PIN")
            .appendField(new Blockly.FieldNumber(0, 0), "FREQUENCY")
            .appendField("Hz")
            .appendField("for")
            .appendField(new Blockly.FieldNumber(0, 0), "DURATION")
            .appendField("ms");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Generates a square wave of the specified frequency (and 50% duty cycle) on a pin. Optionally, a duration can be specified.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['pulse_in'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("pulseIn")
            .appendField(new Blockly.FieldDropdown([
                ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]
            ]), "PIN")
            .appendField(new Blockly.FieldDropdown([
                ["HIGH", "HIGH"], ["LOW", "LOW"]
            ]), "STATE");
        this.setOutput(true, "Number");
        this.setColour(160);
        this.setTooltip("Reads a pulse (either HIGH or LOW) on a pin.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['pulse_in_long'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("pulseInLong")
            .appendField(new Blockly.FieldDropdown([
                ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]
            ]), "PIN")
            .appendField(new Blockly.FieldDropdown([
                ["HIGH", "HIGH"], ["LOW", "LOW"]
            ]), "STATE");
        this.setOutput(true, "Number");
        this.setColour(160);
        this.setTooltip("Reads a pulse (either HIGH or LOW) on a pin. For long pulse widths.");
        this.setHelpUrl("");
    }
};


//END ARDUINO

Blockly.Blocks['arduino_loop'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Loop");
        this.appendStatementInput("LOOP")
            .setCheck(null);
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['arduino_digital_write'] = {
    init: function() {
        this.appendValueInput("PIN")
            .setCheck("Number")
            .appendField("Digital Write PIN#");
        this.appendValueInput("STATE")
            .setCheck("Boolean")
            .appendField("State");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['arduino_digital_read'] = {
    init: function() {
        this.appendValueInput("PIN")
            .setCheck("Number")
            .appendField("Digital Read PIN#");
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['math_number'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(0), "NUM");
    this.setOutput(true, "Number");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

//Math
//Declare
// Variable Declaration Blocks
Blockly.Blocks['variables_declare_number'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Declare number")
            .appendField(new Blockly.FieldTextInput("myVarNumber"), "VAR_NAME")
            .appendField(new Blockly.FieldDropdown([
                ["byte", "byte"],
                ["int", "int"],
                ["float", "float"],
                ["long", "long"],
                ["double", "double"]
            ]), "TYPE");
        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("value");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("Declare a number variable");
        this.setHelpUrl("");
    },
    onchange: function(event) {
        if (event.type === Blockly.Events.BLOCK_CREATE || 
            event.type === Blockly.Events.BLOCK_CHANGE || 
            event.type === Blockly.Events.BLOCK_MOVE) {
            const varName = this.getFieldValue('VAR_NAME');
            const varType = 'NUMBER';
            const workspace = this.workspace;
            let variable = workspace.getVariable(varName, varType);
            if (!variable) {
                workspace.createVariable(varName, varType);
            } else if (variable.type !== varType) {
                workspace.deleteVariableById(variable.getId());
                workspace.createVariable(varName, varType);
            }
        }
    }
};

Blockly.Blocks['variables_declare_text'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Declare text")
            .appendField(new Blockly.FieldTextInput("myVarText"), "VAR_NAME")
            .appendField(new Blockly.FieldDropdown([
                ["char", "char"],
                ["String", "String"]
            ]), "TYPE");
        this.appendValueInput("VALUE")
            .setCheck("String")
            .appendField("value");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Declare a text variable");
        this.setHelpUrl("");
    },
    onchange: function(event) {
        if (event.type === Blockly.Events.BLOCK_CREATE || 
            event.type === Blockly.Events.BLOCK_CHANGE || 
            event.type === Blockly.Events.BLOCK_MOVE) {
            const varName = this.getFieldValue('VAR_NAME');
            const varType = 'TEXT';
            const workspace = this.workspace;
            let variable = workspace.getVariable(varName, varType);
            if (!variable) {
                workspace.createVariable(varName, varType);
            } else if (variable.type !== varType) {
                workspace.deleteVariableById(variable.getId());
                workspace.createVariable(varName, varType);
            }
        }
    }
};

Blockly.Blocks['variables_declare_boolean'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Declare boolean")
            .appendField(new Blockly.FieldTextInput("myVarBool"), "VAR_NAME")
            .appendField(new Blockly.FieldDropdown([
                ["true", "true"],
                ["false", "false"]
            ]), "TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Declare a boolean variable");
        this.setHelpUrl("");
    },
    onchange: function(event) {
        if (event.type === Blockly.Events.BLOCK_CREATE || 
            event.type === Blockly.Events.BLOCK_CHANGE || 
            event.type === Blockly.Events.BLOCK_MOVE) {
            const varName = this.getFieldValue('VAR_NAME');
            const varType = 'BOOLEAN';
            const workspace = this.workspace;
            let variable = workspace.getVariable(varName, varType);
            if (!variable) {
                workspace.createVariable(varName, varType);
            } else if (variable.type !== varType) {
                workspace.deleteVariableById(variable.getId());
                workspace.createVariable(varName, varType);
            }
        }
    }
};

//Get
// Obtenção de Variáveis
// Get Number Variable
// Get Number Variable
Blockly.Blocks['variables_get_number'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Get number")
            .appendField(new Blockly.FieldVariable(
                "myVarText",
                null,
                ['NUMBER'],
                'NUMBER'
            ), "VAR");
        this.setOutput(true, "Number");
        this.setColour(330);
        this.setTooltip("Get the value of a number variable");
        this.setHelpUrl("");
    }
};

// Get Text Variable
Blockly.Blocks['variables_get_text'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Get text")
            .appendField(new Blockly.FieldVariable(
                "myVarText",
                null,
                ['TEXT'],
                'TEXT'
            ), "VAR");
        this.setOutput(true, "String");
        this.setColour(230);
        this.setTooltip("Get the value of a text variable");
        this.setHelpUrl("");
    }
};

// Get Boolean Variable
Blockly.Blocks['variables_get_boolean'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Get boolean")
            .appendField(new Blockly.FieldVariable(
                "myVarBool",
                null,
                ['BOOLEAN'],
                'BOOLEAN'
            ), "VAR");
        this.setOutput(true, "Boolean");
        this.setColour(160);
        this.setTooltip("Get the value of a boolean variable");
        this.setHelpUrl("");
    }
};
//END MATH