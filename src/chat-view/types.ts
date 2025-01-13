export type VSCodeAPIMessage = {
  type: string;
  value?: string;
  language?: string;
};

export interface VSCodeAPI {
  postMessage(message: VSCodeAPIMessage): void;
}

export interface MessageType extends VSCodeAPIMessage {
  isCode: boolean;
  type:
    | 'addQuestion'
    | 'addResponse'
    | 'updateResponse'
    | 'clearConversation'
    | 'exportConversation';
  language?: string;
  data?: string;
}
