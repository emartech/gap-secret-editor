import { app, BrowserWindow, ipcMain, Menu, MenuItem } from 'electron';
import log from 'electron-log';
import path from 'path';
import { startWatchingForUpdates } from './auto-updater/auto-updater';
import { postFeedbackToGoogleForm } from './feedback/feedback';

const logger = log.scope('main');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\');
}

const getUrl = page =>
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/${page}`
    : `file://${__dirname}/${page}`;

const createWindow = async () => {
  const width = 1024;
  const height = Math.floor(1080 * width) / 1920; // video resolution: 1920*1080

  const splashWindow = new BrowserWindow({ width, height, useContentSize: true, backgroundColor: '#E3E9F0' });
  splashWindow.loadURL(getUrl('static/splash-screen.html'));

  const mainWindow = new BrowserWindow({
    width,
    height,
    useContentSize: true,
    webPreferences: {
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webviewTag: true
    },
    show: false
  });

  await mainWindow.loadURL(getUrl('index.html'));
  showMainWindowInPlaceOfSplashWindow(splashWindow, mainWindow);

  logger.info('window-opened');
};

const showMainWindowInPlaceOfSplashWindow = (splashWindow, mainWindow) => {
  mainWindow.setBounds(splashWindow.getNormalBounds());
  mainWindow.setFullScreen(splashWindow.isFullScreen());
  if (splashWindow.isMaximized()) {
    mainWindow.maximize();
  }
  if (splashWindow.isMinimized()) {
    mainWindow.minimize();
  }

  splashWindow.destroy();
  mainWindow.show();
};

const addNewWindowCommandToDefaultMenus = () => {
  const newWindowMenuItemDefinition = {
    label: 'New Window',
    accelerator: 'CommandOrControl+N',
    click: () => createWindow()
  };

  const appMenu = Menu.getApplicationMenu();
  const fileMenu = appMenu.items.find(item => item.label === 'File');
  fileMenu.submenu.insert(0, new MenuItem(newWindowMenuItemDefinition));
  Menu.setApplicationMenu(appMenu);

  if (process.platform === 'darwin') {
    const dockMenu = Menu.buildFromTemplate([newWindowMenuItemDefinition]);
    app.dock.setMenu(dockMenu);
  }
};

const addGoogleCloudSdkExecutablesToPATH = () => {
  if (process.platform === 'darwin') {
    const possibleGcloudPaths = [
      path.join(app.getPath('home'), 'google-cloud-sdk', 'bin'),
      path.join('/opt', 'homebrew', 'bin')
    ];
    process.env.PATH = [...possibleGcloudPaths, process.env.PATH].join(path.delimiter);
  }
};

app.on('ready', () => {
  addNewWindowCommandToDefaultMenus();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    logger.info('app-quit');
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('ui-ready', () => {
  logger.info('ui-ready');
  if (process.env.NODE_ENV === 'production') {
    startWatchingForUpdates();
  }
});

ipcMain.handle('send-feedback', async (event, feedback) => {
  await postFeedbackToGoogleForm(feedback);
});

ipcMain.on('restart', () => {
  app.relaunch();
  app.exit();
});

addGoogleCloudSdkExecutablesToPATH();
