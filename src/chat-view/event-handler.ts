import { aiSvg, checkSvg, clipboardSvg } from './icons';
import { VSCodeAPI } from './types';
import TurndownService from 'turndown';

interface QuestionData {
  prompt: string;
  language: string;
  isCode: boolean;
  value: string;
  html: string;
  command: string;
}

export const setupEventListeners = (vscode: VSCodeAPI): void => {
  const questionInput = document.getElementById(
    'question-input'
  ) as HTMLInputElement;
  questionInput.addEventListener('keydown', function (event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      addFreeTextQuestion(vscode);
    }
  });

  document.addEventListener('click', (e: MouseEvent) => {
    const targetButton = (e.target as HTMLElement).closest('button');
    if (!targetButton) {
      return;
    }

    if (targetButton.id === 'ask-button') {
      e.preventDefault();
      addFreeTextQuestion(vscode);
      return;
    }
    if (targetButton.id === 'clear-button') {
      e.preventDefault();
      clearConversation(vscode);
      return;
    }
    if (targetButton.id === 'export-button') {
      e.preventDefault();
      exportConversation(vscode);
      return;
    }
    if (targetButton.classList.contains('code-element-gnc')) {
      e.preventDefault();
      const codeContent =
        targetButton.parentElement?.parentElement?.lastChild?.textContent || '';
      navigator.clipboard.writeText(codeContent).then(() => {
        targetButton.innerHTML = checkSvg;
        setTimeout(() => {
          targetButton.innerHTML = clipboardSvg;
        }, 1500);
      });
      return;
    }
    if (targetButton.classList.contains('edit-element-gnc')) {
      e.preventDefault();
      vscode.postMessage({
        type: 'editCode',
        value:
          targetButton.parentElement?.parentElement?.lastChild?.textContent ||
          '',
      });
      return;
    }
    if (targetButton.classList.contains('resend-element-gnc')) {
      e.preventDefault();
      handleResend(targetButton, vscode);
      return;
    }
    if (targetButton.classList.contains('retry-element-gnc')) {
      e.preventDefault();
      handleRetry(targetButton, vscode);
      return;
    }
    if (targetButton.classList.contains('send-element-gnc')) {
      e.preventDefault();
      handleSend(targetButton, vscode);
      return;
    }
    if (targetButton.classList.contains('cancel-element-gnc')) {
      e.preventDefault();
      handleCancel(targetButton);
      return;
    }
    if (targetButton.classList.contains('new-code-element-gnc')) {
      e.preventDefault();
      vscode.postMessage({
        type: 'openNew',
        value:
          targetButton.parentElement?.parentElement?.lastChild?.textContent ||
          '',
      });
      return;
    }
  });
};

const addFreeTextQuestion = (vscode: VSCodeAPI): void => {
  const input = document.getElementById('question-input') as HTMLInputElement;
  if (input.value?.length > 0) {
    vscode.postMessage({
      type: 'addFreeTextQuestion',
      value: input.value,
    });
    input.value = '';
  }
};

export const clearConversation = (vscode: VSCodeAPI): void => {
  const qaList = document.getElementById('qa-list');
  const introduction = document.getElementById('introduction');
  const chatButtonWrapper = document.getElementById('chat-button-wrapper');

  if (qaList) {
    qaList.innerHTML = '';
  }
  introduction?.classList?.remove('hidden');
  chatButtonWrapper?.classList?.add('hidden');

  vscode.postMessage({
    type: 'clearConversation',
  });
};

export const exportConversation = (vscode: VSCodeAPI): void => {
  const turndownService = new TurndownService();

  turndownService.remove((node) => {
    return node.className === 'no-export';
  });

  const qaList = document.getElementById('qa-list');
  if (!qaList) {
    return;
  }

  const markdown = turndownService.turndown(qaList);
  vscode.postMessage({
    type: 'openNew',
    value: markdown,
    language: 'markdown',
  });
};

const handleResend = (
  targetButton: HTMLButtonElement,
  vscode: VSCodeAPI
): void => {
  const question = targetButton.closest('.question-element-gnc');
  if (!question) {
    return;
  }

  const buttons = question.querySelector('.resend-actions');
  const sendActions = question.querySelector('.send-cancel-elements-gnc');
  buttons?.classList.add('hidden');
  sendActions?.classList.remove('hidden');

  const questionData = getQuestionData(question);
  const inpPrompt = question.querySelector('#input-prompt') as HTMLElement;
  const inpHTML = question.querySelector('#input-html') as HTMLElement;

  inpHTML.setAttribute('contenteditable', 'true');
  if (questionData.prompt) {
    inpPrompt.setAttribute('contenteditable', 'true');
    inpPrompt.style.display = 'block';
  } else {
    inpPrompt.style.display = 'none';
  }
  inpHTML.innerHTML = questionData.value;
};

const handleRetry = (
  targetButton: HTMLButtonElement,
  vscode: VSCodeAPI
): void => {
  const question = targetButton.closest('.question-element-gnc');
  if (!question) {
    return;
  }

  const questionData = getQuestionData(question);
  if (question.lastElementChild!.textContent!.length > 0) {
    vscode.postMessage({
      type: 'addFreeTextQuestion',
      ...questionData,
    });
  }
};

const handleSend = (
  targetButton: HTMLButtonElement,
  vscode: VSCodeAPI
): void => {
  const question = targetButton.closest('.question-element-gnc');
  if (!question) {
    return;
  }

  const qusData = getQuestionData(question);
  const elements = targetButton.closest('.send-cancel-elements-gnc');
  const resendElement =
    targetButton.parentElement?.parentElement?.firstElementChild;

  elements?.classList.add('hidden');
  resendElement?.classList.remove('hidden');

  const inpPrompt = question.querySelector('#input-prompt') as HTMLElement;
  const inpHTML = question.querySelector('#input-html') as HTMLElement;

  inpPrompt.setAttribute('contenteditable', 'false');
  inpHTML.setAttribute('contenteditable', 'false');

  const newContent = inpHTML.textContent || '';
  inpHTML.innerHTML = getHtml({
    ...qusData,
    value: newContent || qusData.value,
  });

  if (newContent.length > 0) {
    vscode.postMessage({
      type: 'addFreeTextQuestion',
      ...qusData,
      value: newContent,
    });
  }
};

const handleCancel = (targetButton: HTMLButtonElement): void => {
  const question = targetButton.closest('.question-element-gnc');
  if (!question) {
    return;
  }

  const elements = targetButton.closest('.send-cancel-elements-gnc');
  const resendElement =
    targetButton.parentElement?.parentElement?.firstElementChild;

  elements?.classList.add('hidden');
  resendElement?.classList.remove('hidden');

  const inpPrompt = question.querySelector('#input-prompt') as HTMLElement;
  const inpHTML = question.querySelector('#input-html') as HTMLElement;

  inpPrompt.setAttribute('contenteditable', 'false');
  inpHTML.setAttribute('contenteditable', 'false');

  const questionData = getQuestionData(question);
  inpHTML.innerHTML = questionData.html;
};

const getQuestionData = (question: Element): QuestionData => {
  const prompt =
    (question.querySelector('#input-prompt') as HTMLElement).textContent || '';
  const language = (question.querySelector('#language') as HTMLInputElement)
    .value;
  const isCode = (question.querySelector('#isCode') as HTMLInputElement).value;
  const value = (question.querySelector('#value') as HTMLElement).innerHTML;
  const html = (question.querySelector('#html') as HTMLElement).innerHTML;
  const command = (question.querySelector('#command') as HTMLInputElement)
    .value;

  return {
    prompt,
    language: language === 'undefined' ? '' : language,
    isCode: isCode === 'true',
    value,
    html,
    command,
  };
};

const getHtml = (data: QuestionData): string => {
  const html = data.isCode
    ? marked.parse('\r\n```\n' + data.value + '\n```')
    : data.value;
  return html;
};
