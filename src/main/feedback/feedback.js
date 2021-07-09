const axios = require('axios');

export const postFeedbackToGoogleForm = async feedback => {
  const formId = '1FAIpQLSd3CH-YJ4MGt5n-zPZ26S_s2a-7zkfr4W5tW84LL5tz7oqBDQ';
  const questionId = 'entry.2060184421';

  const url = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
  const payload = `${questionId}=${encodeURIComponent(feedback)}`;

  await axios.post(url, payload, { headers: { 'content-type': 'application/x-www-form-urlencoded' } });
};
