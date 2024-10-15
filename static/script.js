// static/script.js
// Função melhorada para solicitar acesso à porta serial
async function requestPort() {
    try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        console.log('Porta serial aberta com sucesso');
        return port;
    } catch (err) {
        if (err.name === 'SecurityError') {
            console.error('Permissão negada para acessar a porta serial');
            alert('Permissão para acessar a porta serial foi negada. Por favor, conceda permissão quando solicitado.');
        } else if (err.name === 'NotFoundError') {
            console.error('Nenhuma porta serial selecionada');
            alert('Nenhuma porta serial foi selecionada. Por favor, selecione uma porta.');
        } else {
            console.error('Erro ao solicitar porta:', err);
            alert('Ocorreu um erro ao tentar acessar a porta serial. Verifique se o Arduino está conectado corretamente.');
        }
        return null;
    }
}

// Função para obter a lista de portas disponíveis
async function getPorts() {
    try {
        const response = await fetch('/ports');
        if (!response.ok) {
            throw new Error('Failed to fetch ports');
        }
        const ports = await response.json();
        return ports;
    } catch (err) {
        console.error('Error fetching ports:', err);
        return [];
    }
}

// Função para atualizar a lista de portas no dropdown
async function updatePortList() {
    const selectPort = document.getElementById('serial-port');
    selectPort.innerHTML = '<option value="">Selecione uma porta</option>';
    
    try {
        const ports = await getPorts();
        for (let port of ports) {
            const option = document.createElement('option');
            option.value = port.path;
            option.textContent = `${port.path} - ${port.manufacturer || 'Unknown'}`;
            selectPort.appendChild(option);
        }
        
        if (ports.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'Nenhuma porta detectada';
            option.disabled = true;
            selectPort.appendChild(option);
        }
    } catch (err) {
        console.error('Erro ao obter portas:', err);
        const option = document.createElement('option');
        option.textContent = 'Erro ao listar portas';
        option.disabled = true;
        selectPort.appendChild(option);
    }
}


async function startSerialMonitor(port) {
    const terminal = document.getElementById('serialMonitor');
    terminal.innerHTML = ''; // Clear the terminal

    const reader = port.readable.getReader();
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const readerStream = textDecoder.readable.getReader();

    try {
        while (true) {
            const { value, done } = await readerStream.read();
            if (done) break;
            const newLine = document.createElement('div');
            newLine.textContent = value;
            terminal.appendChild(newLine);
            terminal.scrollTop = terminal.scrollHeight; // Auto-scroll
        }
    } catch (err) {
        console.error('Error reading data:', err);
    } finally {
        reader.releaseLock();
    }
}

async function writeSerialData(port, data) {
    const writer = port.writable.getWriter();
    const textEncoder = new TextEncoder();
    const encodedData = textEncoder.encode(data);
    await writer.write(encodedData);
    writer.releaseLock();
}

let selectedPortPath = ''; // Variável para armazenar a porta selecionada
let selectedBoard = '';

document.addEventListener('DOMContentLoaded', function () {
    const selectPort = document.getElementById('serial-port');
    const connectButton = document.getElementById('connect-button');
    const uploadButton = document.getElementById('upload-button');
    
    if (connectButton) {
        connectButton.addEventListener('click', connectToArduino);
    }

    selectPort.addEventListener('change', function() {
        selectedPortPath = selectPort.value;
        console.log('Porta selecionada:', selectedPortPath);
        // Habilitar o botão de upload quando uma porta é selecionada
        uploadButton.disabled = !selectedPortPath;
    });


    selectPort.addEventListener('click', async function() {
        if (!('serial' in navigator)) {
            alert('Seu navegador não suporta a Web Serial API. Por favor, use um navegador compatível, como Chrome ou Edge.');
            return;
        }

        try {
            await updatePortList();
            
            if (selectPort.options.length <= 1) {
                alert('Nenhuma porta serial detectada. Verifique se o Arduino está conectado e tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao atualizar lista de portas:', error);
            alert('Ocorreu um erro ao tentar listar as portas seriais. Por favor, tente novamente.');
        }
    });

    uploadButton.addEventListener('click', async function () {
        if (!selectedPortPath) {
            alert('Por favor, selecione uma porta antes de fazer o upload.');
            return;
        }

        const selectBoard = document.getElementById('board');
        const selectedBoard = selectBoard.value;

        if (!selectedBoard) {
            alert('Por favor, selecione uma placa Arduino antes de fazer o upload.');
            return;
        }

        const code = Blockly.Arduino.workspaceToCode(Blockly.getMainWorkspace());

        try {
            await uploadCode(code, selectedBoard);
        } catch (error) {
            console.error('Error uploading to Arduino:', error);
            alert('Upload failed: ' + error.message);
        }
    });

    // Atualizar a lista de portas assim que a página carregar
    updatePortList().catch(error => {
        console.error('Erro ao carregar lista de portas inicial:', error);
    });

    document.getElementById('upload-button').addEventListener('click', async function () {
        let selectPort = selectedPortPath;
        let selectBoard = selectedBoard;
        
        let = selectedPort = '';

        if (!selectPort) selectedPort = document.getElementById('serial-port').value;
        if (!selectBoard) selectedBoard = document.getElementById('board').value;

        console.log(`selectedPort: ${selectedPort} e selectedBoard: ${selectedBoard}`);
        if (!selectedPort || !selectedBoard) {
            console.error('No port or board selected');
            return;
        }

        const code = Blockly.Arduino.workspaceToCode(Blockly.getMainWorkspace());

        try {
            const port = await requestPort();
            await writeSerialData(port, code);
            alert('Code uploaded successfully!');
            startSerialMonitor(port);
        } catch (error) {
            console.error('Error uploading to Arduino:', error);
            alert('Upload failed');
        }
    });

    if (typeof Blockly === 'undefined') {
        console.error('Blockly is not defined.');
        return;
    }

    // Após carregar todos os blocos
    setTimeout(() => {
        if (Blockly.Blocks['math_change']) {
            delete Blockly.Blocks['math_change'];
        }
    }, 1000); // Ajuste o tempo conforme necessário
    
    Blockly.Themes.blackbg = Blockly.Theme.defineTheme('blackbg', {
        'base': Blockly.Themes.Classic,
        'componentStyles': {
            'workspaceBackgroundColour': '#1e1e1e',
            'toolboxBackgroundColour': 'blackBackground',
            'toolboxForegroundColour': '#fff',
            'flyoutBackgroundColour': '#252526',
            'flyoutForegroundColour': '#ccc',
            'flyoutOpacity': 1,
            'scrollbarColour': '#797979',
            'insertionMarkerColour': '#fff',
            'insertionMarkerOpacity': 0.3,
            'scrollbarOpacity': 0.4,
            'cursorColour': '#d0d0d0',
            'blackBackground': '#333',
        }
    });

    const workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox'),
        theme: Blockly.Themes.blackbg,
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
        },
        grid: {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true
        },
        trashcan: true,
    });

    // Definindo Blockly.Arduino caso não esteja definido
    if (typeof Blockly.Arduino === 'undefined') {
        Blockly.Arduino = new Blockly.Generator('Arduino');
        Blockly.Arduino.addReservedWords('code');
        Blockly.Arduino.ORDER_ATOMIC = 0;
        Blockly.Arduino.ORDER_NONE = 99;
    }

    Blockly.Variables.createVariableButtonHandler = function(workspace, opt_callback, opt_types) {
        Blockly.prompt('Enter a name for your variable:', '', function(text) {
            if (text) {
                const variableTypes = opt_types || [''];
                Blockly.Variables.getOrCreateVariablePackage(workspace, null, text, variableTypes[0]);
                if (opt_callback) {
                    opt_callback(text);
                }
                workspace.updateToolbox(document.getElementById('toolbox'));
            }
        });
    };

    // Adicionando o callback para o botão de criação de variável
    workspace.registerButtonCallback('createVariable', function(button) {
        Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace())
            .then(() => workspace.updateToolbox(document.getElementById('toolbox')));
    });

    workspace.registerButtonCallback('createTypedVariable', function(button) {
        Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), null, ['Number', 'String', 'Boolean']);
        workspace.updateToolbox(document.getElementById('toolbox'));
    });

    let language = 'arduino';

    window.updateLanguage = function () {
        language = 'arduino';
        Blockly.Arduino = new Blockly.Generator('Arduino');
        Blockly.Arduino.addReservedWords('code');
        Blockly.Arduino.nameDB_ = new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
        Blockly.Arduino.nameDB_.populateVariables(Blockly.Variables.allUsedVarModels(workspace));
        Blockly.Arduino.nameDB_.populateProcedures(Blockly.Procedures.allProcedures(workspace));
        updateCode();
    };

    //To generators
    Blockly.Arduino.valueToCode = function(block, name, outerOrder) {
        if (isNaN(outerOrder)) {
            throw Error('Expecting valid order from block: ' + block);
        }
        var targetBlock = block.getInputTargetBlock(name);
        if (!targetBlock) {
            return ['', Blockly.Arduino.ORDER_ATOMIC];
        }

        var tuple = Blockly.Arduino.blockToCode(targetBlock);
        if (!Array.isArray(tuple)) {
            tuple = [tuple, Blockly.Arduino.ORDER_ATOMIC];
        }
        var code = tuple[0];
        var innerOrder = tuple[1];
        if (isNaN(innerOrder)) {
            throw Error('Expecting valid order from value block: ' + targetBlock.type);
        }
        if (code && outerOrder <= innerOrder) {
            code = '(' + code + ')';
        }

        return [code, innerOrder];
    };

    Blockly.Arduino.statementToCode = function(block, name) {
      var targetBlock = block.getInputTargetBlock(name);
      if (!targetBlock) {
        return ''; // Se não há bloco conectado, retorna string vazia
      }
      var code = Blockly.Arduino.blockToCode(targetBlock);
      if (Array.isArray(code)) {
        code = code[0]; // Usa o primeiro elemento do array se for um array
      }
      return code;
    };

    Blockly.Arduino.blockToCode = function(block) {
        if (!block) {
            return '';
        }

        if (block.isEnabled() && !block.hasDisabledReason()) {
            var func = this[block.type];
            if (typeof func !== 'function') {
                throw Error('Language "Arduino" does not know how to generate code for block type "' + block.type + '".');
            }
            var code = func.call(this, block);

            // Se code não for um array, transforma em uma tupla
            if (!Array.isArray(code)) {
                code = [code, Blockly.Arduino.ORDER_ATOMIC];
            }

            // Adiciona o código dos blocos conectados abaixo
            var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
            var nextCode = this.blockToCode(nextBlock);

            if (Array.isArray(nextBlock)) {
                nextBlock = nextBlock[0];
            }
            if (Array.isArray(nextCode)) {
                nextCode = nextCode[0];
            }

            return [code[0] + nextCode, code[1]];
        } else {
            return this.scrub_(block, '');
        }
    };

    Blockly.Arduino.scrub_ = function(block, code) {
        const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
        const nextCode = Blockly.Arduino.blockToCode(nextBlock);
        return code + nextCode;
    };

    Blockly.Arduino.workspaceToCode = function(workspace) {
      if (!workspace) {
        console.warn('Blockly.Generator.workspaceToCode was called with an invalid workspace.');
        return '';
      }
      var code = [];
      this.init(workspace);
      var blocks = workspace.getTopBlocks(true);
      for (var i = 0, block; block = blocks[i]; i++) {
        var line = this.blockToCode(block);
        if (line) {
          if (Array.isArray(line)) {
            line = line[0];
          }
          code.push(line);
        }
      }
      code = code.join('\n');
      code = this.finish(code);
      return code;
    };

    function updateCode() {
      Blockly.Arduino.init(Blockly.getMainWorkspace());
      var code;
      let languageClass;
      let generator;
      try {
        switch (language) {
          case 'arduino':
            generator = Blockly.Arduino;
            languageClass = 'language-cpp';
            break;
          default:
            generator = Blockly.Arduino;
            languageClass = 'language-cpp';
            break;
        }

        generator.init(workspace);
        code = generator.workspaceToCode(Blockly.getMainWorkspace());

      } catch (error) {
        code = "// Error generating code: " + error.message;
        languageClass = 'language-cpp';
        console.error('Error generating code:', error);
      }

      const output = document.getElementById('code-output');
      output.textContent = code;
      output.className = 'hljs ' + languageClass;
      hljs.highlightElement(output);
    }

    document.getElementById('executeBtn').addEventListener('click', async () => {
        const code = Blockly.Arduino.workspaceToCode(workspace);
        const selectPort = document.getElementById('serial-port');
        const selectBoard = document.getElementById('board');
        const port = selectPort.value;
        const board = selectBoard.value;

        if (!port) {
            alert('Please select a serial port');
            return;
        }

        try {
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });

            const writer = port.writable.getWriter();
            const encoder = new TextEncoder();
            const encodedCode = encoder.encode(code);
            await writer.write(encodedCode);
            writer.releaseLock();

            startSerialMonitor(port);
        } catch (error) {
            console.error('Error uploading to Arduino:', error);
        }
    });

    document.getElementById('saveBtn').addEventListener('click', function () {
        const xml = Blockly.Xml.workspaceToDom(workspace);
        const xmlText = Blockly.Xml.domToPrettyText(xml);
        const blob = new Blob([xmlText], {type: 'text/xml'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'blockly_blocks.xml';
        a.click();
    });

    document.getElementById('openBtn').addEventListener('click', function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xml';
        input.onchange = function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const xmlText = e.target.result;
                    const xml = Blockly.utils.xml.textToDom(xmlText);
                    Blockly.Xml.domToWorkspace(xml, workspace);
                    refreshVariables(workspace);
                };
                reader.readAsText(file);
            }
        };
        input.click();
    });

    const extensionInput = document.getElementById('extensionInput');

    Blockly.getMainWorkspace().registerButtonCallback('sendExtension', function() {
        extensionInput.click();
    });

    function getBlocksFromScript(scriptContent) {
        const blockTypes = [];
        const blockDefRegex = /Blockly\.Blocks\['(.*?)'\]/g;
        let match;
        while ((match = blockDefRegex.exec(scriptContent)) !== null) {
            blockTypes.push(match[1]);
        }
        return blockTypes;
    }

    function registerExtension(scriptContent) {
        const extensionRegex = /Blockly\.Extensions\.register\('(.*?)',\s*function\s*\(\)\s*{([\s\S]*?)}\);/g;
        let match;
        while ((match = extensionRegex.exec(scriptContent)) !== null) {
            const extensionName = match[1];
            const extensionCode = match[2];
            try {
                eval(`Blockly.Extensions.register('${extensionName}', function() {${extensionCode}});`);
            } catch (error) {
                console.error(`Error registering extension ${extensionName}:`, error);
            }
        }
    }

    function registerGenerators(scriptContent) {
        function createAndRegisterGenerator(language, blockType, generatorCode) {
            if (!Blockly[language]) {
                Blockly[language] = {};
            }
            try {
                eval(`Blockly.${language}['${blockType}'] = function(block) {${generatorCode}};`);
            } catch (error) {
                console.error(`Error registering ${language} generator for block: ${blockType}`, error);
            }
        }

        const generatorRegex = /Blockly\.(\w+)\['(.*?)'\]\s*=\*\s*function\s*\(block\)\s*{([\s\S]*?)};/g;
        let match;
        while ((match = generatorRegex.exec(scriptContent)) !== null) {
            const language = match[1];
            createAndRegisterGenerator(language, match[2], match[3]);
        }

        const languages = ['Arduino'];
        languages.forEach(language => {
            const generatorRegex = new RegExp(`Blockly\\.${language}\\['(.*?)'\\]\\s*=\\s*function\\s*\\(block\\)\\s*{([\\s\\S]*?)};`, 'g');
            let match;
            while ((match = generatorRegex.exec(scriptContent)) !== null) {
                createAndRegisterGenerator(language, match[1], match[2]);
            }
        });
    }

    extensionInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const scriptContent = e.target.result;
                
                try {
                    (new Function(scriptContent))();

                    registerExtension(scriptContent);
                    registerGenerators(scriptContent);

                    const scriptName = file.name.split('.')[0];
                    const newCategory = document.createElement('category');
                    newCategory.setAttribute('name', scriptName);
                    newCategory.setAttribute('colour', '160');

                    const blocks = getBlocksFromScript(scriptContent);
                    blocks.forEach(block => {
                        const blockNode = document.createElement('block');
                        blockNode.setAttribute('type', block);
                        newCategory.appendChild(blockNode);
                    });

                    const extensionsCategory = document.getElementById('extensionsCategory');
                    const sendExtensionButton = extensionsCategory.querySelector('button');
                    extensionsCategory.insertBefore(newCategory, sendExtensionButton.nextSibling);

                    workspace.updateToolbox(document.getElementById('toolbox'));

                    alert("Extension loaded and registered successfully!");
                } catch (error) {
                    console.error("Error loading extension:", error);
                    alert("Error loading extension:", error);
                }
            };
            reader.readAsText(file);
        }
    });

        function refreshVariables(workspace) {
        const variables = Blockly.Variables.allUsedVarModels(workspace);
        variables.sort((a, b) => a.name.localeCompare(b.name)); // Ordenar as variáveis alfabeticamente

        workspace.getAllBlocks().forEach(block => {
            if (typeof block.updateVariableFieldDropdown === 'function') {
                block.updateVariableFieldDropdown();
            }
        });

        if (workspace.toolbox_) {
            workspace.toolbox_.refreshSelection();
        }
    }

    workspace.addChangeListener(function(event) {
        if (event.type === Blockly.Events.BLOCK_CREATE || 
            event.type === Blockly.Events.BLOCK_DELETE || 
            event.type === Blockly.Events.BLOCK_CHANGE || 
            event.type === Blockly.Events.VAR_CREATE || 
            event.type === Blockly.Events.VAR_DELETE || 
            event.type === Blockly.Events.VAR_RENAME) {
            refreshVariables(workspace);
        }
        updateCode();
    });

    workspace.addChangeListener(updateCode);
});

// Função melhorada para conectar ao Arduino
async function connectToArduino() {
    const selectPort = document.getElementById('serial-port');
    const selectedPortPath = selectPort.value;
    
    if (!selectedPortPath) {
        alert('Por favor, selecione uma porta antes de conectar.');
        return;
    }
    
    try {
        const response = await fetch('/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ portPath: selectedPortPath }),
        });

        if (!response.ok) {
            throw new Error('Failed to connect to port');
        }

        const result = await response.json();
        console.log('Conectado com sucesso à porta:', selectedPortPath);
        alert('Conectado com sucesso ao Arduino!');
        // Aqui você pode adicionar lógica adicional após a conexão bem-sucedida
    } catch (err) {
        console.error('Erro ao conectar à porta:', err);
        alert('Erro ao conectar à porta selecionada. Verifique a conexão e tente novamente.');
    }
}

// Atualize esta função para usar a nova rota de upload
async function connectToArduino() {
    if (!selectedPortPath) {
        alert('Por favor, selecione uma porta antes de conectar.');
        return;
    }
    
    try {
        const response = await fetch('/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ portPath: selectedPortPath }),
        });

        if (!response.ok) {
            throw new Error('Failed to connect to port');
        }

        const result = await response.json();
        console.log('Conectado com sucesso à porta:', selectedPortPath);
        alert('Conectado com sucesso ao Arduino!');
        // Aqui você pode adicionar lógica adicional após a conexão bem-sucedida
    } catch (err) {
        console.error('Erro ao conectar à porta:', err);
        alert('Erro ao conectar à porta selecionada. Verifique a conexão e tente novamente.');
    }
}

async function uploadCode(code, board) {
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ board, code, portPath: selectedPortPath }),
        });

        if (!response.ok) {
            throw new Error('Failed to upload code');
        }

        const result = await response.json();
        alert('Code uploaded successfully!');
        // Implemente a lógica para iniciar o monitor serial, se necessário
    } catch (error) {
        console.error('Error uploading to Arduino:', error);
        throw error;
    }
}

// Atualizar a lista de portas assim que a página carregar
updatePortList().catch(error => {
    console.error('Erro ao carregar lista de portas inicial:', error);
});