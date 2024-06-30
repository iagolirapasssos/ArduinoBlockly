// static/arduino_blocks.js
Blockly.Blocks['caesar_encrypt'] = {
    init: function() {
        this.appendValueInput("TEXT")
            .setCheck("String")
            .appendField("Encrypt text");
        this.appendValueInput("SHIFT")
            .setCheck("Number")
            .appendField("with shift");
        this.setInputsInline(true);
        this.setOutput(true, "String");
        this.setColour(160);
        this.setTooltip("Encrypt text using Caesar Cipher");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['caesar_decrypt'] = {
    init: function() {
        this.appendValueInput("TEXT")
            .setCheck("String")
            .appendField("Decrypt text");
        this.appendValueInput("SHIFT")
            .setCheck("Number")
            .appendField("with shift");
        this.setInputsInline(true);
        this.setOutput(true, "String");
        this.setColour(160);
        this.setTooltip("Decrypt text using Caesar Cipher");
        this.setHelpUrl("");
    }
};


// static/arduino_generator.js

Blockly.Arduino['caesar_encrypt'] = function(block) {
    var text = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_ATOMIC);
    var shift = Blockly.Arduino.valueToCode(block, 'SHIFT', Blockly.Arduino.ORDER_ATOMIC);
    
    var code = 'caesarEncrypt(' + text + ', ' + shift + ')';
    return [code, Blockly.Arduino.ORDER_NONE];
};

Blockly.Arduino['caesar_decrypt'] = function(block) {
    var text = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_ATOMIC);
    var shift = Blockly.Arduino.valueToCode(block, 'SHIFT', Blockly.Arduino.ORDER_ATOMIC);
    
    var code = 'caesarDecrypt(' + text + ', ' + shift + ')';
    return [code, Blockly.Arduino.ORDER_NONE];
};
