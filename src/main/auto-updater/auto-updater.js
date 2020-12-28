import { BrowserWindow, ipcMain } from 'electron';
import { findLast } from 'lodash';
import { autoUpdater } from 'electron-updater';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const startWatchingForUpdates = () => {
  autoUpdater.autoDownload = false;
  initializeEventListeners();

  autoUpdater.checkForUpdates();
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, DAY_IN_MS);
};

const initializeEventListeners = () => {
  autoUpdater.on('update-available', (updateInfo) => {
    const mainWindow = findLast(BrowserWindow.getAllWindows());
    mainWindow.webContents.send('confirm-update', updateInfo);
  });

  ipcMain.on('confirm-update-response', (event, isConfirmed) => {
    if (isConfirmed) {
      autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  });
};
