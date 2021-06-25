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

const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;

const createWindow = () => {
  /**
   * Initial window options
   */
  const window = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1024,
    webPreferences: {
      nodeIntegration: true
    }
  });

  window.loadURL(winURL);
  logger.info('window-opened');
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
