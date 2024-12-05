import axios from 'axios';
import { postFeedbackToGoogleForm } from './feedback';

describe('feedback', () => {
  describe('#postFeedbackToGoogleForm', () => {
    it.skip('should post encoded feedback to a google form', async () => {
      sinon.stub(axios, 'post').resolves();

      await postFeedbackToGoogleForm('This is awesome!');

      expect(axios.post).to.have.been.calledWith(
        sinon.match('docs.google.com/forms'),
        sinon.match('This%20is%20awesome!')
      );
    });
  });
});
