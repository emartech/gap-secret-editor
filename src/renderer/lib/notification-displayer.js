export default {
  saveSuccess: () => {
    window.e.utils.openNotification({
      title: 'Secret saved',
      content: 'Secret saved successfully.',
      placement: 'top',
      type: 'success',
      autoClose: true
    });
  },
  saveFailedDueToModifiedSecret: () => {
    window.e.utils.openNotification({
      title: 'Save failed',
      content: 'Secret has been modified since it was loaded. Reload it and apply your changes again.',
      placement: 'top',
      type: 'danger',
      autoClose: true
    });
  },
  saveFailed: (reason) => {
    window.e.utils.openNotification({
      title: 'Save failed',
      content: reason,
      placement: 'top',
      type: 'danger'
    });
  },
  loadFailed: (reason) => {
    window.e.utils.openNotification({
      title: 'Load failed',
      content: reason,
      placement: 'top',
      type: 'danger'
    });
  },
  loadFailedDueToUnauthorizedAccess: () => {
    window.e.utils.openNotification({
      title: 'Load failed',
      content: 'You do not have enough permission to edit secrets in the selected namespace. Select another namespace.',
      placement: 'top',
      type: 'danger',
      autoClose: true
    });
  },
  backupSuccess: () => {
    window.e.utils.openNotification({
      title: 'Backup loaded',
      content: 'Backup loaded to the editor. You can make changes, then click Save to restore it.',
      placement: 'top',
      type: 'success',
      autoClose: true
    });
  }
};
