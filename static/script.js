document.addEventListener('DOMContentLoaded', function () {
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

    document.getElementById('executeBtn').addEventListener('click', function () {
        const workspace = Blockly.getMainWorkspace();
        const codeOutput = Blockly.Arduino.workspaceToCode(workspace);

        const terminal = document.getElementById('terminal');
        terminal.innerHTML = '';

        function terminalLog(msg) {
            const messageElement = document.createElement('div');
            messageElement.textContent = msg;
            terminal.appendChild(messageElement);
        }

        const originalConsoleLog = console.log;
        console.log = function (...args) {
            args.forEach(arg => terminalLog(String(arg)));
            originalConsoleLog.apply(console, args);
        };

        const originalConsoleError = console.error;
        console.error = function (...args) {
            args.forEach(arg => terminalLog('Error: ' + String(arg)));
            originalConsoleError.apply(console, args);
        };

        const originalAlert = window.alert;
        window.alert = function (msg) {
            terminalLog(String(msg));
        };

        try {
            (function() {
                eval(codeOutput);
            })();
        } catch (error) {
            terminalLog('Error executing code: ' + error.message);
            console.error('Error executing code:', error);
        } finally {
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
            window.alert = originalAlert;
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
        console.log("Extracted block types:", blockTypes);
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
                console.log(`Registered extension: ${extensionName}`);
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
                console.log(`Registered ${language} generator for block: ${blockType}`);
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

        languages.forEach(language => {
            console.log(`Registered ${language} generators:`, Object.keys(Blockly[language] || {}));
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

                    console.log("Extension loaded and registered:", scriptName);
                    console.log("Blocks found:", blocks);
                } catch (error) {
                    console.error("Error loading extension:", error);
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
