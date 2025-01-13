import * as vscode from 'vscode';

export const getConfig = (confName: string) => {
  const config = vscode.workspace.getConfiguration('chatgptplus');
  return config.get(confName) as string | undefined;
};

export const getConfigs = () => {
  const apiKey = getConfig('apiKey');
  return {
    apiKey,
    maxTokens: getConfig('maxTokens') as unknown as number,
    model: getConfig('model')!,
    apiUrl: getConfig('apiUrl')!,
  };
};

export type Config = ReturnType<typeof getConfigs>;
