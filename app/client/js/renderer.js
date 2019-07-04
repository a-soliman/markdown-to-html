const { remote, ipcRenderer } = require('electron');
const path = require('path');
const mainProcess = remote.require('./main');
const marked = require('marked');
const ui = require('./ui');

class App {
  constructor(ui, ipcRenderer) {
    this.ui = ui;
    this.ipcRenderer = ipcRenderer;
    this.filePath = null;
    this.originalContent = '';

    this.init();
  }

  init() {
    this.initEventListeners();
    this.initIpcRendererListeners();
  }

  initEventListeners() {
    const selectors = this.ui.selectors;
    selectors.markdownView.addEventListener('keyup', this.renderHtml);
    selectors.openFileBtn.addEventListener('click', this.getFileFromUser);
    selectors.newFileBtn.addEventListener('click', this.launchNewWindow);
  }

  initIpcRendererListeners() {
    this.ipcRenderer.on('file-opened', (evt, file, content) => {
      this.filePath = file;
      this.originalContent = content;

      this.ui.markdown = content;
      this.renderHtml();
      this.updateUserInterface();
    });
  }

  markdownToHtml = markdown => {
    return marked(markdown, { senitize: true });
  };

  renderHtml() {
    const markdown = this.ui.markdown;
    const html = this.markdownToHtml(markdown);
    return this.ui.renderHtml(html);
  }

  getFileFromUser() {
    const currentWindow = remote.getCurrentWindow();
    mainProcess.getFileFromUser(currentWindow);
  }

  launchNewWindow() {
    return mainProcess.createWindow();
  }

  updateUserInterface() {
    const title = this.filePath
      ? `${path.basename(this.filePath)} - Fire Sale`
      : 'Fire Sale';
    const currentWindow = remote.getCurrentWindow();
    currentWindow.setTitle(title);
  }
}

const app = new App(ui, ipcRenderer);
