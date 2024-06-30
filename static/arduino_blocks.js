// static/arduino_blocks.js

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


Blockly.Blocks['variables_global'] = {
  init: function() {
    this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField(new Blockly.FieldVariable("item"), "VAR")
        .appendField("=");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['variables_local'] = {
  init: function() {
    this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField("local")
        .appendField(new Blockly.FieldVariable("item"), "VAR")
        .appendField("=");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.defineBlocksWithJsonArray([ 
  {
    "type": "variables_declare_typed",
    "message0": "Declare %1 %2 variable %3 type %4 as %5",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "SCOPE",
        "options": [
          ["local", "LOCAL"],
          ["global", "GLOBAL"]
        ]
      },
      {
        "type": "field_dropdown",
        "name": "VAR_TYPE",
        "options": [
          ["number", "NUMBER"],
          ["text", "TEXT"],
          ["boolean", "BOOLEAN"]
        ]
      },
      {
        "type": "field_input",
        "name": "VAR_NAME",
        "text": "myVar"
      },
      {
        "type": "field_dropdown",
        "name": "TYPE",
        "options": [
          ["int", "INT"],
          ["float", "FLOAT"],
          ["long", "LONG"],
          ["double", "DOUBLE"]
        ]
      },
      {
        "type": "input_value",
        "name": "VALUE"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 330,
    "tooltip": "Declare a typed variable",
    "helpUrl": ""
  }
]);

Blockly.Blocks['variables_declare_typed'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["local", "LOCAL"],
                ["global", "GLOBAL"]
            ]), "SCOPE")
            .appendField(new Blockly.FieldDropdown([
                ["number", "NUMBER"],
                ["text", "TEXT"],
                ["boolean", "BOOLEAN"]
            ]), "VAR_TYPE")
            .appendField(new Blockly.FieldTextInput("myVar"), "VAR_NAME")
            .appendField(new Blockly.FieldDropdown([
                ["int", "INT"],
                ["float", "FLOAT"],
                ["long", "LONG"],
                ["double", "DOUBLE"]
            ]), "TYPE");
        this.appendValueInput("VALUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("Declare a typed variable");
        this.setHelpUrl("");
    },
    onchange: function(event) {
        if (event.type === Blockly.Events.BLOCK_CREATE || event.type === Blockly.Events.BLOCK_CHANGE) {
            const varName = this.getFieldValue('VAR_NAME');
            const varType = this.getFieldValue('VAR_TYPE');
            const workspace = this.workspace;

            let variable = workspace.getVariable(varName);
            if (!variable) {
                workspace.createVariable(varName, varType);
            } else if (variable.type !== varType) {
                workspace.deleteVariableById(variable.getId());
                workspace.createVariable(varName, varType);
            }
        }
    }
};

Blockly.defineBlocksWithJsonArray([ 
  {
    "type": "variables_get_typed",
    "message0": "Get %1 variable %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "VAR_TYPE",
        "options": [
          ["number", "NUMBER"],
          ["text", "TEXT"],
          ["boolean", "BOOLEAN"]
        ]
      },
      {
        "type": "field_variable",
        "name": "VAR"
      }
    ],
    "output": null,
    "colour": 330,
    "tooltip": "Get the value of a typed variable",
    "helpUrl": ""
  }
]);

Blockly.Blocks['variables_get_typed'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["number", "NUMBER"],
                ["text", "TEXT"],
                ["boolean", "BOOLEAN"]
            ]), "VAR_TYPE")
            .appendField(new Blockly.FieldVariable(), "VAR");
        this.setOutput(true, null);
        this.setColour(230);
        this.setTooltip("Get the value of a typed variable");
        this.setHelpUrl("");
    },
    onchange: function(event) {
        if (event.type === Blockly.Events.BLOCK_CREATE || event.type === Blockly.Events.BLOCK_CHANGE) {
            const varType = this.getFieldValue('VAR_TYPE');
            const variableField = this.getField('VAR');
            const variables = this.workspace.getVariablesOfType(varType);
            const variableNames = variables.map(variable => [variable.name, variable.getId()]);
            variableField.menuGenerator_ = variableNames;
            if (!variables.some(variable => variable.getId() === variableField.getValue())) {
                variableField.setValue(variableNames.length ? variableNames[0][1] : '');
            }
        }
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
