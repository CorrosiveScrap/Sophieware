const {ipcRenderer, shell} = require('electron');
const fs = require('fs');
const path = require('path');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startButton').addEventListener('click', () => {
        ipcRenderer.invoke('startFromRenderer')
    });

    document.getElementById('quitButton').addEventListener('click', () => {
        ipcRenderer.invoke('quitFromRenderer')
    });

    document.getElementById('saveSettings').addEventListener('click', () => {
        saveSettings();
    })

    document.getElementById('socialLink01').addEventListener('click', () => {
        shell.openExternal('https://throne.com/sophiewluv')
    })
    document.getElementById('socialLink02').addEventListener('click', () => {
        shell.openExternal('https://x.com/sophiewluv')
    })
    document.getElementById('socialLink03').addEventListener('click', () => {
        shell.openExternal('https://character.ai/chat/PtHUuT_FRv8YjZYcYymlSQMbmXWu6UmSAUZGhjUHwCU')
    })
    document.getElementById('socialLink04').addEventListener('click', () => {
        shell.openExternal('https://wheelofnames.com/apb-vyb')
    })

    document.getElementById('extraLink01').addEventListener('click', () => {
        ipcRenderer.invoke('openInternalLink')
    })

    loadSettings();

    // ipcRenderer.invoke('testbg').then((data) => {
    //     //console.log(data)
    // })
});

function loadMedia() {
    fs.readdir(path.join(__dirname, 'renderer/popupImages'), (err, files) => {

        const documents = files.filter((file) => {
            return file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.gif') || file.endsWith('.tiff') || file.endsWith('.raw')
        });
        
        localStorage.setItem('sophiewareImages', JSON.stringify(documents))
    });

    fs.readdir(path.join(__dirname, 'renderer/popupVideos'), (err, files) => {

        const documents = files.filter((file) => {
            return file.endsWith('.mp3') || file.endsWith('.mp4') || file.endsWith('.mkv')
        });

        localStorage.setItem('sophiewareVideo', JSON.stringify(documents))
    });

    fs.readdir(path.join(__dirname, 'renderer/popupAudio'), (err, files) => {

        const documents = files.filter((file) => {
            return file.endsWith('.mp3') || file.endsWith('.mp4') || file.endsWith('.mkv')
        });

        localStorage.setItem('sophiewareAudio', JSON.stringify(documents))
    });

    fs.readdir(path.join(__dirname, 'renderer/popupSpirals'), (err, files) => {

        const documents = files.filter((file) => {
            return file.endsWith('.gif')
        });

        localStorage.setItem('sophiewareSpirals', JSON.stringify(documents))
    });
}

loadMedia()


///             \\\
///Save settings\\\
///             \\\

let settingsFile;
ipcRenderer.invoke('getUserDataPath').then(userDataPath => {

    settingsFile = path.join(userDataPath, 'settings.txt');
    const defaultSettingsFilePath = path.join(__dirname, 'settings.txt');

    if (!fs.existsSync(String(settingsFile))) {
        // Copy the default settings file to the userData directory
        fs.copyFileSync(defaultSettingsFilePath, settingsFile);
    }

    
    settingsFile = settingsFile.toString()
})


function saveSettings() {
    fs.readFile(settingsFile, 'utf8', (err, data) => {

        //Split each line from the settings.txt file into an array and trim out white space
        let lines = data.split('\n').map(line => line.trim());


        //Update individual places in that array
        if (document.getElementById('settingCreateImages').checked) { lines[5] = 'true' } else { lines[5] = 'false' }
        if (document.getElementById('settingCreateVideos').checked) { lines[8] = 'true' } else { lines[8] = 'false' }
        if (document.getElementById('settingCreateAudios').checked) { lines[11] = 'true' } else { lines[11] = 'false' }
        if (document.getElementById('settingOpenLinks').checked) { lines[20] = 'true' } else { lines[20] = 'false' }
        if (document.getElementById('settingTextPrompts').checked) { lines[32] = 'true' } else { lines[32] = 'false' }

        const settingsCreateAmountValue = document.getElementById('settingsCreateAmountValue').value
        if (document.getElementById('settingCreateOne').checked) { lines[14] = 'one' } 
        else if (document.getElementById('settingCreateAll').checked) { lines[14] = 'all' }
        else if (document.getElementById('settingCreateAmount').checked) { if (settingsCreateAmountValue) { lines[14] = settingsCreateAmountValue } else { lines[14] = 10} }
        localStorage.setItem('sophiewareCreateAmountValue', settingsCreateAmountValue)

        if (document.getElementById('settingPopupLifetimeToggle').checked) { localStorage.setItem('sophiewarePopupLifetimeToggle', 'true') } else { localStorage.setItem('sophiewarePopupLifetimeToggle', 'false') }
        localStorage.setItem('sophiewarePopupLifetime', document.getElementById('settingPopupLifetime').value)

        if (document.getElementById('settingCreationIntervalToggle').checked) { 
            lines[23] = 'true' 
            lines[26] = document.getElementById('settingRandomCreationIntervalInputOne').value
            lines[29] = document.getElementById('settingRandomCreationIntervalInputTwo').value
        } else { 
            lines[23] = 'false' 
            lines[17] = document.getElementById('settingCreationIntervalInput').value
        }

        if (document.getElementById('settingBlurContent').checked) { localStorage.setItem('sophiewareBlurContent', 'true') } else { localStorage.setItem('sophiewareBlurContent', 'false') }
        if (document.getElementById('settingSpiralContent').checked) { localStorage.setItem('sophiewareSpiralContent', 'true') } else { localStorage.setItem('sophiewareSpiralContent', 'false') }
        if (document.getElementById('settingCaptionContent').checked) { localStorage.setItem('sophiewareCaptionContent', 'true') } else { localStorage.setItem('sophiewareCaptionContent', 'false') }

        //working
        if (document.getElementById('settingVideoLoop').checked) { localStorage.setItem('sophiewareLoopVideos', 'true') } else { localStorage.setItem('sophiewareLoopVideos', 'false') }
        if (document.getElementById('settingVideoUnmute').checked) { localStorage.setItem('sophiewareMuteVideos', 'false') } else { localStorage.setItem('sophiewareMuteVideos', 'true') }
        if (document.getElementById('settingVideoCloseAfterPlay').checked) { localStorage.setItem('sophiewareVideoCloseAfterPlay', 'true') } else { localStorage.setItem('sophiewareVideoCloseAfterPlay', 'false') }
        if (document.getElementById('settingVideoChangeAfterPlay').checked) { localStorage.setItem('sophiewareVideoChangeAfterPlay', 'true') } else { localStorage.setItem('sophiewareVideoChangeAfterPlay', 'false') }
        if (document.getElementById('settingWindowBounce').checked) { localStorage.setItem('sophiewareWindowBounce', 'true') } else { localStorage.setItem("sophiewareWindowBounce", "false"); }

        localStorage.setItem("blurOpacity", document.getElementById("settingBlurOpacity").value);
        localStorage.setItem("spiralOpcatity", document.getElementById("settingSpiralOpacity").value);

        if (document.getElementById('settingLaunchOnStartUp').checked) {
            ipcRenderer.invoke('enableAutoStarter')
            localStorage.setItem('sophiewareLaunchOnStartUp', 'true')
        } else {
            ipcRenderer.invoke('disableAutoStarter')
            localStorage.setItem('sophiewareLaunchOnStartUp', 'false')
        }
        

        
        

        //Merge the array into one big thingy again and write that into the settings.txt file
        fs.writeFile(settingsFile, lines.join('\n'), 'utf8', (err) => {
            if (err) { console.log(err) }
        })

        //Send a message to main.js to read and change things based on the new file configuration
        ipcRenderer.invoke('updateSettings')
    })
}

function loadSettings() {
    fs.readFile(settingsFile, 'utf8', (err, data) => {
        const lines = data.split('\n').map(line => line.trim());

        if (lines[5] === 'true') { document.getElementById('settingCreateImages').checked = true }
        if (lines[8] === 'true') { document.getElementById('settingCreateVideos').checked = true }
        if (lines[11] === 'true') { document.getElementById('settingCreateAudios').checked = true }
        if (lines[20] === 'true') { document.getElementById('settingOpenLinks').checked = true }
        if (lines[32] === 'true') { document.getElementById('settingTextPrompts').checked = true }

        document.getElementById('settingsCreateAmountValue').value = localStorage.getItem('sophiewareCreateAmountValue');
        switch (lines[14]) {
            case 'one':
                document.getElementById('settingCreateOne').checked = true
            break;
            case 'all':
                document.getElementById('settingCreateAll').checked = true
            break;
            default:
                document.getElementById('settingCreateAmount').checked = true
            break;
        }

        if (localStorage.getItem('sophiewarePopupLifetimeToggle') == 'true') { document.getElementById('settingPopupLifetimeToggle').checked = true }
        document.getElementById('settingPopupLifetime').value = localStorage.getItem('sophiewarePopupLifetime');

        if (lines[23] == 'true') {
            document.getElementById('settingCreationIntervalToggle').checked = true
            document.getElementById('settingCreationIntervalTypeTwo').style.display = 'block'
            document.getElementById('settingCreationIntervalTypeOne').style.display = 'none'
        } else {
            document.getElementById('settingCreationIntervalTypeTwo').style.display = 'none'
            document.getElementById('settingCreationIntervalTypeOne').style.display = 'block'
        }

        document.getElementById('settingCreationIntervalInput').value = lines[17]
        document.getElementById('settingRandomCreationIntervalInputOne').value = lines[26]
        document.getElementById('settingRandomCreationIntervalInputTwo').value = lines[29]

        if (localStorage.getItem('sophiewareBlurContent') == 'true') { document.getElementById('settingBlurContent').checked = true }
        if (localStorage.getItem('sophiewareSpiralContent') == 'true') { document.getElementById('settingSpiralContent').checked = true }
        if (localStorage.getItem('sophiewareCaptionContent') == 'true') { document.getElementById('settingCaptionContent').checked = true }

        if (localStorage.getItem('sophiewareLoopVideos') == 'true') { document.getElementById('settingVideoLoop').checked = true }
        if (localStorage.getItem('sophiewareMuteVideos') == 'false') { document.getElementById('settingVideoUnmute').checked = true }
        if (localStorage.getItem('sophiewareVideoCloseAfterPlay') == 'true') { document.getElementById('settingVideoCloseAfterPlay').checked = true }
        if (localStorage.getItem('sophiewareVideoChangeAfterPlay') == 'true') { document.getElementById('settingVideoChangeAfterPlay').checked = true }

        if (localStorage.getItem('sophiewareWindowBounce') == 'true') { document.getElementById("settingWindowBounce").checked = true; }

        document.getElementById("settingBlurOpacity").value = localStorage.getItem('blurOpacity');
        document.getElementById("settingSpiralOpacity").value = localStorage.getItem('spiralOpcatity');

        document.getElementById("settingBlurOpacityDisplay").innerHTML = `Blur opacity: ${document.getElementById("settingBlurOpacity").value}`
        document.getElementById("settingSpiralOpacityDisplay").innerHTML = `Spiral opacity: ${document.getElementById("settingSpiralOpacity").value}`

        if (localStorage.getItem('sophiewareLaunchOnStartUp') == 'true') { document.getElementById('settingLaunchOnStartUp').checked = true }
    })
}