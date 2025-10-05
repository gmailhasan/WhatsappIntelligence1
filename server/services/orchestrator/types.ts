export interface AIResponse {
  content: string;
  confidence: number;
  sources: string[];
}
// types.ts
export type NodeType = 'trigger' | 'prompt' | 'action' | 'exit';

export interface FlowNode {
  type: NodeType;
  match_phrases?: string[];
  text?: string;
  expects?: string;
  function?: string;
  retries?: number;
  next?: {
    success?: string;
    error?: string;
    human?: string;
  } | string;
  reason?: string;
}

export interface FlowDefinition {
  nodes: Record<string, FlowNode>;
}

export interface ConversationHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface SessionState {
  activeFlowName: string | null;
  currentNode: string | null;
  variables: Record<string, string>;
  llmHistory: ConversationHistoryItem[];
  retries: Record<string, number>;
}

export interface LLMClient {
  chat(history: ConversationHistoryItem[]): Promise<AIResponse>;
}
