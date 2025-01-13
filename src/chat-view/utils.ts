const createCodeActionsMarkup = (node) => {
  node.parentElement.classList.add('pre-code-element', 'relative');
  node.classList.add('block', 'whitespace-pre-wrap', 'break-words');

  // Remove existing button wrapper if it exists
  const existingWrapper = node.parentElement.querySelector(
    '.code-actions-wrapper'
  );
  if (existingWrapper) {
    existingWrapper.remove();
  }

  const buttonWrapper = document.createElement('div');
  buttonWrapper.classList.add(
    'code-actions-wrapper',
    'flex',
    'gap-4',
    'flex-wrap',
    'items-center',
    'right-2',
    'top-1',
    'absolute'
  );

  // Create copy to clipboard button
  const copyButton = document.createElement('button');
  copyButton.title = 'Copy to clipboard';
  copyButton.innerHTML = clipboardSvg;
  copyButton.classList.add(
    'code-element-gnc',
    'p-1.5',
    'flex',
    'items-center',
    'rounded-lg'
  );

  const insert = document.createElement('button');
  insert.title = 'Insert the below code to the current file';
  insert.innerHTML = insertSvg;
  insert.classList.add(
    'edit-element-gnc',
    'p-1.5',
    'flex',
    'items-center',
    'rounded-lg'
  );

  const newTab = document.createElement('button');
  newTab.title = 'Create a new file with the below code';
  newTab.innerHTML = plusSvg;
  newTab.classList.add(
    'new-code-element-gnc',
    'p-1.5',
    'flex',
    'items-center',
    'rounded-lg'
  );

  buttonWrapper.append(copyButton, insert, newTab);
  node.parentElement.prepend(buttonWrapper);
};

export const processResponse = (message) => {
  const value = message.isCode
    ? '\r\n```\n' + message.value + '\n```'
    : `<div class="text-wrapper"><div class="text-content">${message.value}</div></div>`;

  const markedResponse = new DOMParser().parseFromString(
    marked.parse(value),
    'text/html'
  );

  const nodeList = message.isCode
    ? markedResponse.querySelectorAll('pre > code')
    : markedResponse.querySelectorAll('.text-content');

  nodeList.forEach((node, index) => {
    if (index !== nodeList.length - 1) {
      node.parentElement.classList.add('mb-8');
    }
    createCodeActionsMarkup(node);
  });

  return markedResponse;
};
