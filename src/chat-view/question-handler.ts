import { userSvg, pencilSvg, retrySvg, sendSvg, cancelSvg } from './icons';

const trimNewLine = (str) => {
  return str.replace(/^\s+|\s+$/g, '');
};

const getHtml = (data, marked) => {
  const html = data.isCode
    ? marked.parse('\r\n```\n' + data.value + '\n```')
    : data.value;
  return html;
};

export const addQuestion = (message, list, marked) => {
  const html = getHtml(message, marked);

  list.innerHTML += `<div class="p-4 pb-0 self-end mt-4 question-element-gnc relative" style="background: var(--vscode-input-background)">
    <h2 class="font-bold mb-5 flex">${userSvg}You</h2>
    <input type="hidden" id="command" value="${message.command || ''}">
    <input type="hidden" id="language"  value="${message.language || ''}">
    <pre id="value" style="display:none;">${message.value || ''}</pre>
    <pre id="html" style="display:none;">${html}</pre>
    <input type="hidden" id="isCode"  value="${message.isCode}">

    <no-export class="mb-2 flex items-center">
        <div class="resend-actions items-center rounded-lg absolute right-6 code-actions-wrapper flex">
            <button title="Edit and resend this prompt" class="resend-element-gnc p-2 flex items-center rounded-lg">${pencilSvg}</button>
            <button title="Resend this prompt" class="retry-element-gnc p-2 flex items-center rounded-lg">${retrySvg}</button>
        </div>
        <div class="hidden send-cancel-elements-gnc flex gap-2">
            <button title="Send this prompt" class="send-element-gnc p-1 pr-2 flex items-center">${sendSvg}Send</button>
            <button title="Cancel" class="cancel-element-gnc p-1 pr-2 flex items-center">${cancelSvg}Cancel</button>
        </div>
    </no-export>
    <div id="edit-inputs">
        <div class="overflow-y-auto mb-1" id="input-prompt" style="white-space: break-spaces;">${
          message.prompt || ''
        }</div>
        <div class="overflow-y-auto" id="input-html" style="white-space: break-spaces;">${trimNewLine(
          html
        )}</div>
    <div>
</div>`;

  // Handle UI updates
  document.getElementById('in-progress')?.classList?.remove('hidden');
  document.getElementById('chat-button-wrapper')?.classList?.add('hidden');
  document.getElementById('introduction')?.classList?.add('hidden');

  // Scroll to the new question
  list.lastChild?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
    inline: 'nearest',
  });
};
