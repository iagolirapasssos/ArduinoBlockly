// static/script.js

let workspace = null;

function resizeBlocklyWorkspace() {
    if (workspace) {
        // Obtenha a largura atual do toolbox
        var toolbox = document.getElementsByClassName('blocklyToolboxDiv')[0];
        var toolboxWidth = toolbox.offsetWidth;

        // Ajuste o tamanho do workspace
        var workspaceDiv = document.getElementById('blocklyDiv');
        var workspaceWidth = workspaceDiv.offsetWidth - toolboxWidth;
        
        workspace.setWidth(workspaceWidth);
        workspace.resize();
    }
}

function initBlockly() {
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox'),
        scrollbars: true,
        horizontalLayout: false,
        toolboxPosition: 'start',
    });

    workspace.addChangeListener(updateCode);
    
    // Adicione um pequeno atraso para garantir que o toolbox seja renderizado completamente
    setTimeout(resizeBlocklyWorkspace, 100);
}

function updateCode(event) {
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    document.getElementById('code-output').textContent = code;
    hljs.highlightElement(document.getElementById('code-output'));
}

window.addEventListener('resize', resizeBlocklyWorkspace);

document.addEventListener('DOMContentLoaded', function() {

    // Código para redimensionamento
    const container = document.querySelector('.main-content');
    const outputContainer = document.getElementById('output-container');
    const resizeHandle = document.querySelector('.resize-handle');
    let isResizing = false;

    resizeHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResize);
    });

    function handleMouseMove(e) {
        if (!isResizing) return;
        const containerRect = container.getBoundingClientRect();
        const newWidth = containerRect.right - e.clientX;
        outputContainer.style.width = `${newWidth}px`;
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResize);
    }

});