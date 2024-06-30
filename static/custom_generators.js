// static/custom_generators.js

Blockly.Msg.LOGIC_HUE = '210'; // Ajuste a cor conforme necessário
Blockly.Msg.LOOPS_HUE = '120'; // Ajuste a cor conforme necessário
Blockly.Msg.MATH_HUE = '230'; // Ajuste a cor conforme necessário
Blockly.Msg.TEXTS_HUE = '160'; // Ajuste a cor conforme necessário
Blockly.Msg.LISTS_HUE = '260'; // Ajuste a cor conforme necessário
Blockly.Msg.COLOUR_HUE = '20'; // Ajuste a cor conforme necessário
Blockly.Msg.VARIABLES_HUE = '330'; // Ajuste a cor conforme necessário
Blockly.Msg.PROCEDURES_HUE = '290'; // Ajuste a cor conforme necessário

Blockly.BlockSvg.START_HAT = true;
Blockly.BlockSvg.prototype.updateColour = function() {
  var colourHex = this.getColour();
  this.svgPath_.setAttribute('fill', colourHex);
  this.svgPath_.setAttribute('stroke', Blockly.utils.colour.darken(colourHex, 0.2));
  var inputList = this.inputList;
  for (var i = 0, input; input = inputList[i]; i++) {
    var fieldList = input.fieldRow;
    for (var j = 0, field; field = fieldList[j]; j++) {
      if (field instanceof Blockly.FieldLabel) {
        field.setText(field.getText());
      }
    }
  }
};

Blockly.FieldLabel.prototype.setText = function(text) {
  if (this.textElement_) {
    this.text_ = text;
    this.textElement_.textContent = text;
    this.textElement_.style.fontWeight = 'bold';
    this.textElement_.style.fill = '#FFFFFF';
  }
};
