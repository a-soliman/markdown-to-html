const { crashReporter } = require('electron');
const host = 'http://localhost:3000';
const config = {
  productName: 'Fire Sale',
  companyName: 'Electron in Action',
  submitURL: host + 'crashreports',
  uploadToServer: true
};

crashReporter.start(config);
console.log('[INFO] Crash reporting started.', crashReporter);

module.exports = crashReporter;
