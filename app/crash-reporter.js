const { crashReporter } = require('electron');
const request = require('request');
const host = 'http://localhost:3000';
const manifest = require('../package.json');

const config = {
  productName: 'Fire Sale',
  companyName: 'Electron in Action',
  submitURL: host + '/crashreports',
  uploadToServer: true
};

crashReporter.start(config);

const sendUncaughtException = error => {
  const { productName, companyName } = config;
  request.post(host + '/uncaughtexeptions', {
    form: {
      _productName: productName,
      _companyName: companyName,
      _version: manifest.version,
      platform: process.platform,
      process_type: process.type,
      ver: process.versions.electron,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }
  }).then(() => console.log('Sent Report'));
};

if (process.type === 'browser') {
  process.on('uncaughtException', sendUncaughtException);
} else {
  window.addEventListener('error', sendUncaughtException);
}

console.log('[INFO] Crash reporting started.', crashReporter);

module.exports = crashReporter;
