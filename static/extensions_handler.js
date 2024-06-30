document.addEventListener("DOMContentLoaded", function() {
  const toolbox = document.getElementById("toolbox");
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolbox,
    scrollbars: true,
    trashcan: true
  });

  // Definindo Blockly.Arduino caso não esteja definido
  if (typeof Blockly.Arduino === 'undefined') {
    Blockly.Arduino = new Blockly.Generator('Arduino');
    Blockly.Arduino.addReservedWords('code');
    Blockly.Arduino.ORDER_ATOMIC = 0;
    Blockly.Arduino.ORDER_NONE = 99;
  }

  function updateCode(event) {
    const code = Blockly.Arduino.workspaceToCode(workspace);
    document.getElementById('generatedCode').textContent = code;
    hljs.highlightElement(document.getElementById('generatedCode'));

    // Atualizando a saída de tradução
    document.getElementById('translationOutput').textContent = code;
    hljs.highlightElement(document.getElementById('translationOutput'));
  }

  workspace.addChangeListener(updateCode);

  document.getElementById('saveBtn').addEventListener('click', function() {
    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToPrettyText(xml);
    const blob = new Blob([xmlText], {type: 'text/xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blockly_workspace.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  document.getElementById('openBtn').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    input.onchange = function(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = function() {
        const xmlText = reader.result;
        const xml = Blockly.Xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(xml, workspace);
      };
      reader.readAsText(file);
    };
    input.click();
  });

  document.getElementById('executeBtn').addEventListener('click', function() {
    const code = Blockly.Arduino.workspaceToCode(workspace);
    console.log(code);
    alert('Generated code:\n' + code);
  });
});
