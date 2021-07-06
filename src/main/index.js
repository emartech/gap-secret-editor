import { app, BrowserWindow, ipcMain, Menu, MenuItem } from 'electron';
import log from 'electron-log';
import { startWatchingForUpdates } from './auto-updater/auto-updater';

const logger = log.scope('main');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
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
      nodeIntegration: true
    },
    show: false
  });

  await Promise.all([
    mainWindow.loadURL(getUrl('index.html')),
    waitForSplashAnimationToFinish()
  ]);

  splashWindow.destroy();
  mainWindow.show();
  logger.info('window-opened');
};

const waitForSplashAnimationToFinish = () => {
  const isFirstWindowOpening = BrowserWindow.getAllWindows().length === 2;
  return isFirstWindowOpening
    ? new Promise(resolve => setTimeout(resolve, 4500))
    : Promise.resolve();
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

  const dockMenu = Menu.buildFromTemplate([newWindowMenuItemDefinition]);
  app.dock.setMenu(dockMenu);
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
