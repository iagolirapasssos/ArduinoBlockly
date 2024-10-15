// Block definition
Blockly.Blocks['multiline_code'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Multiline Code");
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("// Enter your code here\\n// Use \\n for new lines"), "CODE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Insert multiple lines of custom Arduino code. Use \\n for new lines.");
    this.setHelpUrl("");
  }
};

// Arduino code generator
Blockly.Arduino['multiline_code'] = function(block) {
  var code = block.getFieldValue('CODE');
  // Replace \n with actual newlines
  code = code.replace(/\\n/g, '\n');
  // Ensure the code ends with a newline
  if (!code.endsWith('\n')) {
    code += '\n';
  }
  return code;
};
