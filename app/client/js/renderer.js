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
    const {
      markdownView,
      openFileBtn,
      newFileBtn,
      saveFileBtn,
      saveHTMLBtn,
      revertBtn
    } = this.ui.selectors;

    document.addEventListener('dragstart', evt => evt.preventDefault());
    document.addEventListener('dragover', evt => evt.preventDefault());
    document.addEventListener('dragleave', evt => evt.preventDefault());
    document.addEventListener('drop', evt => evt.preventDefault());

    markdownView.addEventListener('dragover', this.handleOnMarkdownDragover);
    markdownView.addEventListener('dragleave', this.handleOnMarkdownDragLeave);
    markdownView.addEventListener('drop', this.handleOnMarkdownDrop);
    markdownView.addEventListener('keyup', this.handleMarkdownChange);
    openFileBtn.addEventListener('click', this.getFileFromUser);
    newFileBtn.addEventListener('click', this.launchNewWindow);
    saveFileBtn.addEventListener('click', this.handleSaveMarkdown);
    saveHTMLBtn.addEventListener('click', this.handleSaveHtml);
    revertBtn.addEventListener('click', this.handleRevert);
  };

  initIpcRendererListeners() {
    const currentWindow = remote.getCurrentWindow();

    this.ipcRenderer.on('file-opened', (evt, file, content) => {
      if (currentWindow.isDocumentEdited()) {
        const result = remote.dialog.showMessageBox(currentWindow, {
          type: 'warning',
          title: 'Overwrite Current Unsaved Changes?',
          message:
            'Opening a new file in this window will overwrite your unsaved changes, Open file anyway?',
          buttons: ['Yes', 'Cancel'],
          defaultId: 0,
          cancelId: 1
        });

        if (result === 1) return;
      }
      this.filePath = file;
      this.originalContent = content;

      this.ui.markdown = content;
      this.renderHtml();
      this.updateUserInterface();
    });

    this.ipcRenderer.on('file-changed', (evt, file, content) => {
      const result = remote.dialog.showMessageBox(currentWindow, {
        type: 'warning',
        title: 'Overwrite Current Unsaved Changes?',
        message: 'Another application has changed this file, Load changes?',
        buttons: ['Yes', 'Cancel'],
        defaultId: 0,
        cancelId: 1
      });

      this.filePath = file;
      this.originalContent = content;

      this.ui.markdown = content;
      this.renderHtml();
      this.updateUserInterface();
    });
  }

  getDraggedFile = evt => evt.dataTransfer.items[0];

  getDroppedFile = evt => evt.dataTransfer.files[0];

  fileTypeIsSupported = file => {
    return ['text/plain', 'text/markdown'].includes(file.type);
  };

  handleOnMarkdownDragover = evt => {
    const file = this.getDraggedFile(evt);
    const { markdownView } = this.ui.selectors;
    if (this.fileTypeIsSupported(file)) markdownView.classList.add('drag-over');
    else markdownView.classList.add('drag-error');
  };

  handleOnMarkdownDragLeave = evt => {
    const { markdownView } = this.ui.selectors;
    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
  };

  handleOnMarkdownDrop = evt => {
    const file = this.getDroppedFile(evt);
    const currentWindow = remote.getCurrentWindow();
    debugger;
    const { markdownView } = this.ui.selectors;

    if (this.fileTypeIsSupported(file)) {
      console.log(file);
      mainProcess.openFile(currentWindow, file.path);
    } else alert('That file type is not supported.');

    markdownView.classList.remove('drage-over');
    markdownView.classList.remove('drag-error');
  };

  handleSaveMarkdown = () => {
    const currentWindow = remote.getCurrentWindow();
    const markdown = this.ui.markdown;
    const file = this.filePath;
    mainProcess.saveMarkdown(currentWindow, file, markdown);

    this.originalContent = markdown;
    this.edited = false;
    this.updateUserInterface();
  };

  handleSaveHtml = () => {
    const currentWindow = remote.getCurrentWindow();
    const html = this.ui.html;
    mainProcess.saveHtml(currentWindow, html);
  };

  handleRevert = () => {
    this.ui.markdown = this.originalContent;
    this.edited = false;
    this.renderHtml();
    this.updateUserInterface();
  };

  handleMarkdownChange = evt => {
    const edited = this.ui.markdown !== this.originalContent;
    this.renderHtml();
    if (edited !== this.edited) {
      this.edited = edited;
      this.updateUserInterface();
    }
  };

  markdownToHtml(markdown) {
    return marked(markdown, { senitize: true });
  }

  renderHtml() {
    const markdown = this.ui.markdown;
    const html = this.markdownToHtml(markdown);
    return (this.ui.html = html);
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
    this.ui.selectors.saveHTMLBtn.disabled = !this.ui.html.length;
  }

  setTitle = title => remote.getCurrentWindow().setTitle(title);
}

const app = new App(ui, ipcRenderer);
