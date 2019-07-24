// const { app, autoUpdater, dialog, BrowserWindow } = require('electron');
// const isDevelopment = app.getPath('exe').indexOf('electron') !== -1;
// const baseURL = 'http://firesale-release.glitch.me';

// const platform = process.platform;
// const currentVersersion = app.getVersion();

// const releaseFeed = `${baseURL}/releases/${platform}?currentVersion=${currentVersersion}`;

// if (isDevelopment) {
//   console.info('[AutoUpdater]', 'In development mode. Skipping...');
// } else {
//   console.info('[AutoUpdater]', `Setting release feed to ${releaseFeed}`);
//   autoUpdater.setFeedURL(releaseFeed);
// }

// autoUpdater.addListener('update-available', () => {
//   dialog.showMessageBox({
//     type: 'question',
//     buttons: ['Install & Relaunch', 'Not Now'],
//     defaultId: 0,
//     message: `${app.getName()} has been updated.`,
//     detail: 'An update has been downloaded and can be installed now.'
//   }, (response) => {
//     if (response === 0) {
//       setTimeout(() => {
//         app.removeAllListeners();
//         BrowserWindow.getAllWindows().forEach(win => win.close());
//         autoUpdater.quitAndInstall();
//       }, 0);
//     }
//   });
// });

// module.exports = autoUpdater;