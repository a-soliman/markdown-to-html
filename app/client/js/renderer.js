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
    this.edited = false;

    this.init();
  }

  init() {
    this.initEventListeners();
    this.initIpcRendererListeners();
  }

  initEventListeners = () => {
    const selectors = this.ui.selectors;
    selectors.markdownView.addEventListener('keyup', this.handleMarkdownChange);
    selectors.openFileBtn.addEventListener('click', this.getFileFromUser);
    selectors.newFileBtn.addEventListener('click', this.launchNewWindow);
  };

  initIpcRendererListeners() {
    this.ipcRenderer.on('file-opened', (evt, file, content) => {
      this.filePath = file;
      this.originalContent = content;

      this.ui.markdown = content;
      this.renderHtml();
      this.updateUserInterface();
    });
  }

  handleMarkdownChange = evt => {
    const edited = this.ui.markdown !== this.originalContent;
    if (edited !== this.edited) {
      this.edited = edited;
      this.updateUserInterface();
    }

    this.renderHtml();
  };

  markdownToHtml(markdown) {
    return marked(markdown, { senitize: true });
  }

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
    let title = 'Fire Sale';
    if (this.filePath) title = `${path.basename(this.filePath)} - ${title}`;
    if (this.edited) title = `${title} (Edited)`;

    this.setTitle(title);
    this.ui.selectors.revertBtn.disabled = !this.edited;
    this.ui.selectors.saveFileBtn.disabled = !this.edited;
  }

  setTitle = title => remote.getCurrentWindow().setTitle(title);
}

const app = new App(ui, ipcRenderer);
