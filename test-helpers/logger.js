import log from 'electron-log';

export const usesFakeLogger = testMethod => async () => {
  const loggedMessages = [];
  log.hooks.push(message => {
    loggedMessages.push({ level: message.level, data: message.data });
  });

  await testMethod(() => loggedMessages);

  log.hooks.pop();
};
