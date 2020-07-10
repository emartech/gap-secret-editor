const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  if (context.electronPlatformName !== 'darwin') {
    return;
  }

  if (!context.packager.codeSigningInfo.hasValue) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  return await notarize({
    appBundleId: 'com.emarsys.gap-secret-editor',
    appPath: `${context.appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS
  });
};
