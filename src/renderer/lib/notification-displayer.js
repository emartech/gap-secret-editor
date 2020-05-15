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
  }
};
