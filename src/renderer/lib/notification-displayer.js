const placement = 'bottom-right';

export default {
  saveSuccess: () => {
    window.e.utils.openNotification({
      title: 'Secret saved',
      content: 'Secret saved successfully.',
      placement,
      type: 'success',
      autoClose: true
    });
  },
  saveFailedDueToModifiedSecret: () => {
    window.e.utils.openNotification({
      title: 'Save failed',
      content: 'Secret has been modified since it was loaded. Reload it and apply your changes again.',
      placement,
      type: 'danger',
      autoClose: true
    });
  },
  saveFailed: (reason) => {
    window.e.utils.openNotification({
      title: 'Save failed',
      content: reason,
      placement,
      type: 'danger'
    });
  },
  serviceRestartSuccess: () => {
    window.e.utils.openNotification({
      title: 'Service restarted',
      content: 'Service using the secret was restarted successfully.',
      placement,
      type: 'success',
      autoClose: true
    });
  },
  serviceRestartFailed: (reason) => {
    window.e.utils.openNotification({
      title: 'Restart failed',
      content: reason,
      placement,
      type: 'danger'
    });
  },
  loadFailed: (reason) => {
    window.e.utils.openNotification({
      title: 'Load failed',
      content: reason,
      placement,
      type: 'danger'
    });
  },
  loadFailedDueToUnauthorizedAccess: () => {
    window.e.utils.openNotification({
      title: 'Load failed',
      content: 'You do not have enough permission to edit secrets in the selected namespace. Select another namespace.',
      placement,
      type: 'danger',
      autoClose: true
    });
  },
  backupSuccess: () => {
    window.e.utils.openNotification({
      title: 'Backup loaded',
      content: 'Backup loaded to the editor. You can make changes, then click Save to restore it.',
      placement,
      type: 'success',
      autoClose: true
    });
  },
  feedbackFailed: () => {
    window.e.utils.openNotification({
      title: 'Send feedback failed',
      content: 'Failed to send feedback. Try again later.',
      placement,
      type: 'danger',
      autoClose: true
    });
  },
  shouldChangesBeDiscarded: () => {
    return new Promise(resolve => {
      window.e.utils.openDestructiveConfirmationDialog({
        headline: 'Discard changes?',
        content: 'By loading a secret, all your unsaved changes will be lost.',
        confirm: {
          label: 'Discard & Load',
          callback: () => resolve(true)
        },
        cancel: {
          label: 'Cancel',
          callback: () => resolve(false)
        }
      });
    });
  }
};
