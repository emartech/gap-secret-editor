import { ipcRenderer } from 'electron';

export const listenForUpdates = () => {
  ipcRenderer.on('confirm-update', async (event, updateInfo) => {
    const confirmed = await confirm(updateInfo);
    event.sender.send('confirm-update-response', confirmed);
  });
};

const confirm = async updateInfo => {
  return new Promise(resolve => {
    window.e.utils.openConsequentialConfirmationDialog({
      headline: `New version available - v${updateInfo.version}`,
      content: `<div class="release-notes">${updateInfo.releaseNotes}</div>
                <div>Do you want to download and install it now?</div>`,
      confirm: {
        label: 'Install Now',
        callback() {
          resolve(true);
        }
      },
      cancel: {
        label: 'Later',
        callback() {
          resolve(false);
        }
      }
    });
  });
};

