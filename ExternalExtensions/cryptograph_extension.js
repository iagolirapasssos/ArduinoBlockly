// Blocks
Blockly.Blocks['caesar_encrypt_procedure'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Encrypt text");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip("Encrypt text using Caesar Cipher");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['caesar_decrypt_procedure'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Decrypt text");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip("Decrypt text using Caesar Cipher");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['call_caesar_encrypt'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Call encrypt function");
        this.appendValueInput("TEXT")
            .setCheck("String")
            .appendField("text");
        this.appendValueInput("SHIFT")
            .setCheck("Number")
            .appendField("shift");
        this.setOutput(true, "String");
        this.setColour(160);
        this.setTooltip("Call Caesar Encrypt function");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['call_caesar_decrypt'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Call decrypt function");
        this.appendValueInput("TEXT")
            .setCheck("String")
            .appendField("text");
        this.appendValueInput("SHIFT")
            .setCheck("Number")
            .appendField("shift");
        this.setOutput(true, "String");
        this.setColour(160);
        this.setTooltip("Call Caesar Decrypt function");
        this.setHelpUrl("");
    }
};

//Generators
Blockly.Arduino['caesar_encrypt_procedure'] = function(block) {
    var code = `
String caesarEncrypt(String text, int shift) {
    String result = "";
    shift = shift % 26;

    for (int i = 0; i < text.length(); i++) {
        char c = text[i];

        if (isUpperCase(c)) {
            result += char(int(c + shift - 65) % 26 + 65);
        } else if (isLowerCase(c)) {
            result += char(int(c + shift - 97) % 26 + 97);
        } else {
            result += c;
        }
    }

    return result;
}

bool isUpperCase(char c) {
    return c >= 'A' && c <= 'Z';
}

bool isLowerCase(char c) {
    return c >= 'a' && c <= 'z';
}
`;
    return code;
};

Blockly.Arduino['caesar_decrypt_procedure'] = function(block) {
    var code = `
String caesarDecrypt(String text, int shift) {
    return caesarEncrypt(text, 26 - shift);
}
`;

    return code;
};

Blockly.Arduino['call_caesar_encrypt'] = function(block) {
    var text = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_ATOMIC);
    var shift = Blockly.Arduino.valueToCode(block, 'SHIFT', Blockly.Arduino.ORDER_ATOMIC);

    if (Array.isArray(text)) {
      text = text[0];
    }
    if (Array.isArray(shift)) {
      shift = shift[0];
    }
    
    //Check if the characters '(' and ')' are present. If they are, we will convert the string to a list and then get the first index.

    text = cleanAndStoreText(text, 2, -2);
    shift = cleanAndStoreText(shift, 1, -1);

    var code = 'caesarEncrypt(' + text + ', ' + shift + ')';
    return [code, Blockly.Arduino.ORDER_NONE];
};

Blockly.Arduino['call_caesar_decrypt'] = function(block) {
    var text = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_ATOMIC);
    var shift = Blockly.Arduino.valueToCode(block, 'SHIFT', Blockly.Arduino.ORDER_ATOMIC);
    
    console.log("shift: ", shift );
    if (Array.isArray(text)) {
      text = text[0];
    }
    if (Array.isArray(shift)) {
      shift = shift[0];
    }

    //Check if the characters '(' and ')' are present. If they are, we will convert the string to a list and then get the first index.
    text = cleanAndStoreText(text, 2, -2);
    shift = cleanAndStoreText(shift, 1, -1);   

    var code = 'caesarDecrypt(' + text + ', ' + shift + ')';
    return [code, Blockly.Arduino.ORDER_NONE];
};

function cleanAndStoreText(text, startIndex, endIndex) {
    let cleanedString = text.slice(startIndex, endIndex);
    let resultList = [cleanedString];
    return resultList[0];
}