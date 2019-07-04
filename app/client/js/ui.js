class UI {
  constructor() {
    this.selectors = {
      controlsSection: document.querySelector('.controls'),
      openFileBtn: document.querySelector('#open_file'),
      newFileBtn: document.querySelector('#new_file'),
      saveMarkdownBtn: document.querySelector('#save_markdown'),
      revertBtn: document.querySelector('#revert'),
      saveHTMLBtn: document.querySelector('#save_html'),
      showFileBtn: document.querySelector('#show_file'),
      openInDefaultBtn: document.querySelector('#open_in_default'),
      contentSection: document.querySelector('.content'),
      markdownView: document.querySelector('#markdown'),
      htmlView: document.querySelector('#html')
    };
  }

  get markdown() {
    return this.selectors.markdownView.value;
  }

  set markdown(val) {
    this.selectors.markdownView.value = val;
  }

  renderHtml = html => {
    this.selectors.htmlView.innerHTML = html;
  };
}

const ui = new UI();
module.exports = ui;
