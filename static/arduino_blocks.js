// static/arduino_blocks.js
Blockly.Blocks['text_print'] = {
    init: function() {
        this.appendValueInput("TEXT")
            .setCheck(null)
            .appendField(new Blockly.FieldDropdown([["println", "PRINTLN"], ["print", "PRINT"]]), "MODE");
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

// Função para gerar IDs aleatórias
function generateRandomId() {
    return Math.random().toString(36).substring(2, 15);
}

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
                "myVarNumber",
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