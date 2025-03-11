import { app, BrowserWindow, Menu, Tray, ipcMain, dialog, shell, globalShortcut, Notification } from 'electron';
import fs, { readFile } from 'fs';
import path from 'path';
import os from 'os';

//This substituts for detault require path variables
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//https://github.com/sindresorhus/wallpaper
//This library has been modified in this project
import { setWallpaper } from 'wallpaper';


//Handle launching the app on start. Honestly I have no clue if this works or not I havnt tested it once.
import AutoLaunch from 'auto-launch';

const appAutoLauncher = new AutoLaunch({
    name: 'sophieware',
    path: process.execPath,
});

ipcMain.handle('enableAutoStarter', () => {
    appAutoLauncher.enable();
    console.log('Auto-launch enabled for the app.');
})

ipcMain.handle('disableAutoStarter', () => {
    appAutoLauncher.disable();
    console.log('Auto-launch disabled for the app.');
})


let mainWindow;
function createMainwindow() {
    mainWindow = new BrowserWindow({
        title: "xys",
        width: 700,
        height: 800,
        resizable: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'renderer/img/icon.ico'),
        devTools: false,

        webPreferences: {
            preload: path.join(__dirname, 'indexPreload.cjs'),

            //WARNING - node integration being enabled is a security concern and allows useres to access node.js APIs
            //I have used it here because this app never touches the internet or connects to other users. Its use here allows fs to be used in "indexPreload.cjs".
            //Please change this if you plan to build onto the app in a way that requires it to connect to anything -CS
            contextIsolation: true,
            nodeIntegration: true 
        },
    });

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

//Invoked from indexPrelaod.cjs | Must be passed back to main.js to use app // used to check if there is already a settings file
ipcMain.handle('getUserDataPath', () => {
    return app.getPath('userData');
});

//Any popup window created is added to this array so it can be cleared all at once in the future by the "Clear screen" tray option
let popupWindows = []

function createImageWindow() {
  const imageWindow = new BrowserWindow({
    width: 500,
    height: 500,
    x: 0,
    y: 0,

    frame: false,
    skipTaskbar: true,
    resizable: false,

    alwaysOnTop: true,
    devTools: false,
  });

  popupWindows.push(imageWindow);
  imageWindow.on("closed", () => {
    popupWindows = popupWindows.filter((win) => win !== imageWindow);
  });

  imageWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); //https://stackoverflow.com/questions/39835282/set-browserwindow-always-on-top-even-other-app-is-in-fullscreen-electron-mac
  imageWindow.setAlwaysOnTop(true, "screen-saver", 1);

  imageWindow.loadFile(path.join(__dirname, "./renderer/imageWindow.html"));
}

function createVideoWindow() {
  const videoWindow = new BrowserWindow({
    width: 500,
    height: 500,
    x: 0,
    y: 0,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    devTools: false,
  });

  popupWindows.push(videoWindow);
  videoWindow.on("closed", () => {
    popupWindows = popupWindows.filter((win) => win !== videoWindow);
  });

  videoWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); //https://stackoverflow.com/questions/39835282/set-browserwindow-always-on-top-even-other-app-is-in-fullscreen-electron-mac
  videoWindow.setAlwaysOnTop(true, "screen-saver", 1);

  videoWindow.loadFile(path.join(__dirname, "./renderer/videoWindow.html"));
}

function createAudioWindow() {
    const audioWindow = new BrowserWindow({
        width: 500,
        height: 500,
        x: 0,
        y: 0,
        frame: false,
        resizable: false,
        skipTaskbar: true,
        show: false,
        devTools: false,
        webPreferences: {
            preload: path.join(__dirname, 'audioPreload.cjs'),
        }
    });

    popupWindows.push(audioWindow)
    audioWindow.on('closed', () => {
        popupWindows = popupWindows.filter(win => win !== audioWindow);
    });
    
    audioWindow.loadFile(path.join(__dirname, './renderer/audioWindow.html'));
}

function createLinesWindow() {
    const linesWindow = new BrowserWindow({
        width: 700,
        height: 800,
        x: 0,
        y: 0,
        resizable: false,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        devTools: false,
        icon: path.join(__dirname, 'renderer/img/icon.ico')
    });
    linesWindow.loadFile(path.join(__dirname, './renderer/lines.html'));
}

function createLinesPopupWindow() {
    const linesWindow = new BrowserWindow({
        width: 700,
        height: 800,
        x: 0,
        y: 0,
        resizable: false,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        frame: false,
        skipTaskbar: true,
        devTools: false,
    });

    popupWindows.push(linesWindow)
    
    linesWindow.on('closed', () => {
        popupWindows = popupWindows.filter(win => win !== linesWindow);
    });

    linesWindow.loadFile(path.join(__dirname, './renderer/lines2.html'));
}

//Create main window once loaded
app.whenReady().then(async () => {

  //BUILD TRAY
  const tray = new Tray(
    path.join(__dirname, "renderer", "img", "trayIcon.ico")
  );

  tray.setToolTip("Sophieware");
  tray.setContextMenu(Menu.buildFromTemplate(trayTemplate));


  //SET BACKGROUND
  const originalWallpaperPath = path.join(__dirname,"renderer/img/wallpaper.png");
  const userDataPath = path.join(app.getPath("userData"), "wallpaper.png");

  if (app.isPackaged && !fs.existsSync(userDataPath)) {
    fs.copyFileSync(originalWallpaperPath, userDataPath);
  }

  try {
    await setWallpaper(userDataPath);
  } catch (error) {
    return error;
  }



  //GLOBAL HOTKEYS
  const shortcutSplash = globalShortcut.register(
    "CommandOrControl+Shift+s",
    () => {
      createMainwindow();
    }
  );
  const shortcutFreeze = globalShortcut.register(
    "CommandOrControl+Shift+f",
    () => {
      frozen = true;
      clearInterval(running);
    }
  );
  const shortcutResume = globalShortcut.register(
    "CommandOrControl+Shift+r",
    () => {
      frozen = false;
      x();
      if (useRandomCreationInterval == false) {
        running = setInterval(x, creationInterval * 1000);
      } else {
        newXInterval();
      }
    }
  );
  const shortcutClear = globalShortcut.register(
    "CommandOrControl+Shift+c",
    () => {
      popupWindows.forEach((win) => win.close());
      popupWindows = [];
      playingAudio = false;
    }
  );
  const shortcutQuit = globalShortcut.register(
    "CommandOrControl+Shift+q",
    () => {
      app.quit();
    }
  );

  //Open main window
  createMainwindow();
});


function createNotification() {
  new Notification({
    title: "Blah",
    body: "blue",
  }).show();
}

// let dirList = []

// const systemFolders = [
//   "AppData",
//   "Program Files",
//   "Program Files (x86)",
//   "Windows",
//   "System32",
//   "Library",
//   "node_modules",
//   ".config",
//   ".cache",
//   ".local",
// ];

// const appFolders = [
//   "Adobe",
//   "Adobe Creative Cloud",
//   "AIMP",
//   "Audacity",
//   "Autodesk",
//   "Blender Foundation",
//   "BlueStacks",
//   "BraveSoftware",
//   "Camtasia",
//   "CyberLink",
//   "DAEMON Tools",
//   "Epic Games",
//   "FileZilla",
//   "Foxit Software",
//   "GIMP",
//   "HandBrake",
//   "IrfanView",
//   "Kaspersky Lab",
//   "Logitech",
//   "Microsoft",
//   "Microsoft VS Code",
//   "NVIDIA Corporation",
//   "OBS Studio",
//   "Opera Software",
//   "Oracle",
//   "QuickTime",
//   "Razer",
//   "Realtek",
//   "Recuva",
//   "Skype",
//   "Spotify",
//   "TechSmith",
//   "TeamViewer",
//   "VMware",
//   "VLC",
//   "WinRAR",
//   "WinSCP",
//   "Zoom",
//   "Zotero",
//   "sop",
//   "sophieware",

//   "BraveSoftware",
//   "Google",
//   "Mozilla",
//   "Opera Software",
//   "Microsoft Edge",

//   "Battle.net",
//   "Bethesda",
//   "CurseForge",
//   "Discord",
//   "Epic Games",
//   "GOG Galaxy",
//   "NVIDIA GeForce Experience",
//   "Rockstar Games",
//   "Steam",
//   "Twitch",
//   "Ubisoft",
//   "Unity",

//   "Android",
//   "Android Studio",
//   "Git",
//   "GitHub",
//   "JetBrains",
//   "Node.js",
//   "Postman",
//   "Python",
//   "Ruby",
//   "Unity",
//   "Unreal Engine",
//   "Visual Studio",
//   "VS Code",
//   "XAMPP",
//   "opencv",

//   "7-Zip",
//   "AnyDesk",
//   "AOMEI",
//   "AVG",
//   "Avira",
//   "CCleaner",
//   "Driver Booster",
//   "EaseUS",
//   "IObit",
//   "Kaspersky",
//   "Macrium Reflect",
//   "MiniTool",
//   "Revo Uninstaller",
//   "Rufus",
//   "Speccy",
//   "TeamViewer",
//   "VirtualBox",
//   "VMware",
//   "WinRAR",
//   "Zotero",
// ];


// const homeDirectory = os.homedir();
// scrawldir(homeDirectory);

// function scrawldir(dirName) {
//     const folderBaseName = path.basename(dirName);
//     if (systemFolders.includes(folderBaseName)) return false;
//     if (appFolders.includes(folderBaseName)) return false;

//       try {
//         const files = fs.readdirSync(dirName, { withFileTypes: true });

//         files.forEach((file) => {
//           if (file.isDirectory()) {
//             dirList.push(file.parentPath + "\\" + file.name);
//             scrawldir(file.parentPath + "\\" + file.name);
//           } else {
//             console.log(file.parentPath + "\\" + file.name + " *");
//           }
//         });
//       } catch (err) {
//         console.log(err);
//       }
// }

// fs.writeFile("renderer/dirResults.txt", dirList.toString(), function(err) {
//     if(err) throw err
// });

// let imageCounter = 0

// setInterval(() => {
//     try {
//         fs.copyFile(dirList[Math.floor(Math.random() * dirList.length)], `Submit ${imageCounter}`, (err) => {
//         console.log('Copied')
//         if (err) throw err
//     })
//     } catch (err) {
//         console.log(err);
//     }
    
// }, 500)

//TODO || Put this into app.whenReady
// ipcMain.handle('testbg', async () => {
//     const originalWallpaperPath = path.join(__dirname, 'renderer/img/wallpaper.png');
//     const userDataPath = path.join(app.getPath('userData'), 'wallpaper.png');

//     if (app.isPackaged && !fs.existsSync(userDataPath)) {
//         fs.copyFileSync(originalWallpaperPath, userDataPath);
//     }

//     //I'm keeping this in a try catch block because I had many problems with it crashing the app when if failed // should be fixed but still
//     try {
//         await setWallpaper(userDataPath);
//     } catch (error) {
//         return (error)
//     }
// })

ipcMain.handle('openInternalLink', () => {
    createLinesWindow()
})

//Without specifying to do nothing when all windows are closed electrons default dehaviour will close the app
app.on("window-all-closed", () => {});

//Tray template
let trayTemplate = [
    {
        label: 'Splash screen',
        click: () => {
            createMainwindow()
        }
    },
    {
        label: 'Freeze',
        click: () => {
            frozen = true
            clearInterval(running)
        }
    },
    {
        label: 'Resume',
        click: () => {
            frozen = false
            x()
            if (useRandomCreationInterval == false) {
                running = setInterval(x, creationInterval * 1000)
            } else {
                newXInterval()
            }
        }
    },
    {
        label: 'Clear screen',
        click: () => {
            popupWindows.forEach(win => win.close());
            popupWindows = []
            playingAudio = false;
        }
    },
    // {
    //     label: 'TEST',
    //     click: () => {
    //         createLinesPopupWindow()
    //     }
    // },
    {
        label: 'Quit',
        click: () => {
            app.quit();
        }
    }
];



ipcMain.handle('quitFromRenderer', () => {
    app.quit();
});

ipcMain.handle('updateSettings', () => {
    updateSettings()
});

ipcMain.handle('startFromRenderer', () => {
    mainWindow.close()
    x()
    if (useRandomCreationInterval == false) {
        running = setInterval(x, creationInterval * 1000)
    } else {
        newXInterval()
    }
});

let frozen = false

let chosenMediaTypes = [];
let createImages;
let createVideos;
let createAudio;
let createLinks;
let createPrompts;
let useRandomCreationInterval;
let creationInterval;
let creationInterval2;

let playingAudio = false;
ipcMain.handle('audioFinished', () => {
    playingAudio = false;
});

let creationAmount;

let running;
function x() {
    switch (creationAmount) {
        case 'one':
            let temp = Math.floor(Math.random() * chosenMediaTypes.length)
            
            switch (chosenMediaTypes[temp]) {
                case 'image':
                    createImageWindow()
                break;
                case 'video':
                    createVideoWindow()
                break;
                case 'audio':
                    if (playingAudio == false) {
                        playingAudio = true
                        createAudioWindow()
                    }
                break
                case 'link':
                    createLink()
                break
                case 'prompt':
                    createLinesPopupWindow()
                break;
            }
        break;
        case 'all':
            if (createImages == true) { createImageWindow() }
            if (createVideos == true) { createVideoWindow() }
            if (createAudio == true && playingAudio == false) { createAudioWindow(); playingAudio = true }
            if (createLinks == true) { createLink() }
            if (createPrompts == true) { createLinesPopupWindow()}
        break
        default:
            for (let i = 0; i < creationAmount; i++) {
                let temp = Math.floor(Math.random() * chosenMediaTypes.length)

                switch (chosenMediaTypes[temp]) {
                    case 'image':
                        createImageWindow()
                        break;
                    case 'video':
                        createVideoWindow()
                        break;
                    case 'audio':
                        if (playingAudio == false) {
                            playingAudio = true
                            createAudioWindow()
                        }
                    break
                    case 'link':
                        createLink()
                    break
                    case 'prompt':
                        createLinesPopupWindow()
                    break;
                }
            }
        break;
    }

    if (useRandomCreationInterval == true) {
        newXInterval()
    }
}

function newXInterval() {
    if (frozen) {return}
    clearInterval(running)
    let maxamount = creationInterval2 - creationInterval
    console.log(maxamount);
    let temp = Math.floor(Math.random() *( maxamount + 1)) + Number(creationInterval)
    running = setInterval(x, temp * 1000)
}

const links = [
  "https://x.com/sophiewluv",
  "https://x.com/sophietakesmore",
  "https://throne.com/sophiewluv",
  "https://x.com/sophiewluv/status/1827731294194970917",
  `https://throne.com/sophiewluv/item/b95ee037-69d2-4dcf-91f8-ade87af1cd44`,
  `https://throne.com/sophiewluv/item/c855a522-f02e-481c-ae2a-016b47e36501`,
  `https://throne.com/sophiewluv/item/54f2d4a0-6455-48df-ac75-c356c646eaad`,
  `https://throne.com/sophiewluv/item/946ba123-3d79-4e87-b785-794d5812e460`,
  `https://throne.com/sophiewluv/item/50b6865b-84ae-4182-b689-a54db1e8bba3`,
  `https://throne.com/sophiewluv/item/2f11df9f-88fb-4352-86d2-596694e5a444`,
  `https://throne.com/sophiewluv/item/f566d45c-0a9c-4371-829e-91d5b1059b14`,
  `https://throne.com/sophiewluv/item/e6d92c84-d96e-42a4-b08a-c2e43aeb38e4`,
  `https://throne.com/sophiewluv/item/5d40d5d4-c480-4453-b1f8-6dbd6d069648`,
];

function createLink() {
    shell.openExternal(links[Math.floor(Math.random() * links.length)])
}


//settings 

function updateSettings() {
    fs.readFile(path.join(app.getPath('userData'), 'settings.txt'), 'utf8', (err, data) => {
        const lines = data.split('\n').map(line => line.trim());

        chosenMediaTypes = [];
        if (lines[5] === 'true') { createImages = true; chosenMediaTypes.push('image')} else { createImages = false }
        if (lines[8] === 'true') { createVideos = true; chosenMediaTypes.push('video') } else { createVideos = false }
        if (lines[11] === 'true') { createAudio = true; chosenMediaTypes.push('audio') } else { createAudio = false }
        if (lines[20] === 'true') { createLinks = true; chosenMediaTypes.push('link') } else { createLinks = false }
        if (lines[32] === 'true') { createPrompts = true; chosenMediaTypes.push('prompt') } else { createPrompts = false }

        if (lines[23] === 'true') { useRandomCreationInterval = true; creationInterval = lines[26]; creationInterval2 = lines[29]; } else { useRandomCreationInterval = false; creationInterval = lines[17]; }

        creationAmount = lines[14]
    })
}

updateSettings()