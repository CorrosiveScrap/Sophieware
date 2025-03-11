const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('background').addEventListener('ended', () => {
        ipcRenderer.invoke('audioFinished')
        window.close()
    });

});