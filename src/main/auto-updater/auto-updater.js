import { BrowserWindow, powerMonitor } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import schedule from 'node-schedule';

const logger = log.scope('auto-updater');

let alreadyWatchingForUpdates = false;

export const startWatchingForUpdates = () => {
  if (alreadyWatchingForUpdates) return;

  autoUpdater.autoDownload = false;
  initializeUpdateEventListeners();

  checkForUpdates();
  scheduleDailyUpdateCheck();

  alreadyWatchingForUpdates = true;
};

const initializeUpdateEventListeners = () => {
  autoUpdater.on('error', error => {
    logger.warn('auto-update-error', error);
  });

  autoUpdater.on('update-available', (updateInfo) => {
    logger.info('update-available', updateInfo);
    BrowserWindow.getAllWindows().forEach(window =>
      window.webContents.send('confirm-update', updateInfo)
    );
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
