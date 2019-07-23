const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const writeFile = require('write-file');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: false }));

const crashesPath = path.join(__dirname, 'crashes');
const exceptionsPath = path.join(__dirname, 'uncaughtexceptions');

const upload = multer({
  dest: crashesPath
}).single('upload_file_minidump');

app.post('/crashreports', upload, (req, res) => {
  const body = {
    ...req.body,
    filename: req.body.filename,
    date: new Date()
  };
  const filePath = `${req.file.path}.json`;
  const report = JSON.stringify(body);

  writeFile(filePath, report, error => {
    if (error) return console.error('Error Saving', report);
    console.log('Crash Saved', filePath, report);
  });

  res.end();
});

app.post('/uncaughtexeptions', (req, res) => {
  const filePath = path.join(exceptionsPath, `${uuid()}.json`);
  const report = JSON.stringify({
    ...req.body,
    date: new Date()
  });

  writeFile(filePath, report, error => {
    if (error) return console.error('Error Saving', report);
    console.log('Exception Saved', filePath, report);
  });

  res.end();
});

server.listen(3000, () => {
  console.log('Crash report server running on port 3000');
});
