import { ipcRenderer } from 'electron';
import log from 'electron-log';
import notificationDisplayer from '../../lib/notification-displayer';

const logger = log.scope('feedback-dialog');

export default {
  name: 'feedback-dialog',
  template: require('./feedback-dialog.html'),
  data: () => ({
    opened: false,
    feedback: '',
    feedbackSendingInProgress: false,
    placeholder: [
      'Enter a detailed description of your feedback or suggestion',
      'If you want to report a bug, please leave some contact info, so we can reach you in case we have questions'
    ].join('\n\n')
  }),
  methods: {
    open() {
      this.opened = true;
    },
    close() {
      this.opened = false;
    },
    async sendFeedbackAndClose() {
      try {
        this.feedbackSendingInProgress = true;

        await ipcRenderer.invoke('send-feedback', this.feedback);

        this.feedback = '';
        this.close();
        logger.info('feedback-sent');
      } catch (e) {
        notificationDisplayer.feedbackFailed();
        logger.warn('feedback-sending-failed', e);
      } finally {
        this.feedbackSendingInProgress = false;
      }
    }
  }
};
