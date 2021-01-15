import { BrowserWindow, ipcMain, powerMonitor } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { findLast } from 'lodash';
import schedule from 'node-schedule';

const logger = log.scope('auto-updater');

export const startWatchingForUpdates = () => {
  autoUpdater.autoDownload = false;
  initializeUpdateEventListeners();

  checkForUpdates();
  scheduleDailyUpdateCheck();
};

const initializeUpdateEventListeners = () => {
  autoUpdater.on('error', error => {
    logger.warn('auto-update-error', error);
  });

  autoUpdater.on('update-available', (updateInfo) => {
    logger.info('update-available', updateInfo);
    const mainWindow = findLast(BrowserWindow.getAllWindows());
    mainWindow.webContents.send('confirm-update', updateInfo);
  });

  ipcMain.on('confirm-update-response', (event, isConfirmed) => {
    logger.info('confirm-update-response', { isConfirmed });
    if (isConfirmed) {
      autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on('update-downloaded', () => {
    logger.info('update-downloaded');
    autoUpdater.quitAndInstall();
  });
};

const checkForUpdates = () => {
  logger.info('check-for-updates');
  autoUpdater.checkForUpdates();
};

const scheduleDailyUpdateCheck = () => {
  logger.info('schedule-daily-update-check');
  const schedulingParameter = { hour: 10, minute: 0 };

  let job = schedule.scheduleJob(schedulingParameter, checkForUpdates);

  powerMonitor.on('resume', () => {
    logger.info('power-monitor-resume');
    checkForUpdates();
    job.cancel();
    job = schedule.scheduleJob(schedulingParameter, checkForUpdates);
  });
};
