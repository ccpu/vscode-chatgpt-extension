import { addQuestion } from './question-handler';
import { processResponse } from './code-processing';
import { aiSvg } from './icons';
import { clearConversation, exportConversation } from './event-handler';
import { MessageType, VSCodeAPI } from './types';
import hljs from 'highlight.js';

interface MessageEvent {
  data: MessageType;
}

export const handleMessage = (
  event: MessageEvent,
  currentLanguage: string,
  marked: any,
  vscode: VSCodeAPI
): void => {
  const message: MessageType = event.data;
  const list: HTMLElement | null = document.getElementById('qa-list');

  if (!list) {
    return;
  }

  currentLanguage = message.language ?? currentLanguage;

  switch (message.type) {
    case 'addQuestion':
      addQuestion(message, list, marked);
      break;
    case 'addResponse': {
      document.getElementById('in-progress')?.classList?.add('hidden');
      document
        .getElementById('chat-button-wrapper')
        ?.classList?.remove('hidden');

      const markedResponse = processResponse(message);
      list.innerHTML += `<div class="p-4 self-end mt-2 pb-1 answer-element-gnc">
          <h2 class="font-bold mb-5 flex">${aiSvg}ChatGPT</h2>
          <div>${markedResponse.documentElement.innerHTML}</div>
        </div>`;

      list.lastElementChild?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
      break;
    }
    case 'updateResponse': {
      const lastResponse = list.querySelector('.answer-element-gnc:last-child');
      if (lastResponse) {
        const markedResponse = processResponse(message);
        const responseContent = lastResponse.querySelector('div:last-child');
        if (responseContent) {
          responseContent.innerHTML = markedResponse.documentElement.innerHTML;
          responseContent.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
          });
        }
      }
      break;
    }
    case 'clearConversation':
      clearConversation(vscode);
      break;
    case 'exportConversation':
      exportConversation(vscode);
      break;
    default:
      break;
  }
};
