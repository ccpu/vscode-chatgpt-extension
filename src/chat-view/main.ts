import { handleMessage } from './message-handler';
import { setupEventListeners } from './event-handler';
import hljs from 'highlight.js';

(function () {
  const vscode = acquireVsCodeApi();
  let currentLanguage = '';
  marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code, _lang) {
      if (currentLanguage) {
        return hljs.highlight(code, { language: 'javascript' }).value;
      }
      return code;
    },
    langPrefix: 'hljs language-',
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartypants: false,
    xhtml: false,
  });

  window.addEventListener('message', (event) =>
    handleMessage(event, currentLanguage, marked, vscode)
  );

  setupEventListeners(vscode);
})();
