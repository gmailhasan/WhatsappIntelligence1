// ChatOrchestrator.ts
import { FlowDefinition, SessionState, LLMClient, FlowNode } from './types';

export class ChatOrchestrator {
  private flowDef: FlowDefinition;
  private llmClient: LLMClient;
  private sessions: Record<string, SessionState> = {};

  constructor(flowDef: FlowDefinition, llmClient: LLMClient) {
    this.flowDef = flowDef;
    this.llmClient = llmClient;
  }

  private detectIntent(text: string): string | null {
    for (const [nodeId, node] of Object.entries(this.flowDef.nodes)) {
      if (
        node.type === 'trigger' &&
        node.match_phrases?.some(p => text.toLowerCase().includes(p))
      ) {
        return nodeId;
      }
    }
    return null;
  }

  public async handleMessage(userId: string, text: string): Promise<string> {
    let session = this.sessions[userId] || {
      activeFlowName: null,
      currentNode: null,
      variables: {},
      llmHistory: [],
      retries: {}
    };

    // If in a flow → route to flow handler
    if (session.activeFlowName) {
      const reply = await this.handleFlowMessage(userId, text);
      this.sessions[userId] = session;
      return reply;
    }

    // No active flow → check intent
    const triggerNodeId = this.detectIntent(text);
    if (triggerNodeId) {
      session.activeFlowName = triggerNodeId;
      const triggerNode = this.flowDef.nodes[triggerNodeId];
      session.currentNode = typeof triggerNode.next === 'string' ? triggerNode.next : null;
      this.sessions[userId] = session;
      return this.runNode(userId);
    }

    // No intent match → normal LLM chat
    session.llmHistory.push({ role: 'user', content: text });
    const llmReply = await this.llmClient.chat(session.llmHistory);
    session.llmHistory.push({ role: 'assistant', content: llmReply });
    this.sessions[userId] = session;
    return llmReply;
  }

  private async handleFlowMessage(userId: string, text: string | null): Promise<string> {
    const session = this.sessions[userId];
    const node = this.flowDef.nodes[session.currentNode as string];

    if (node.expects && text) {
      session.variables[node.expects] = text;
    }

    if (node.type === 'action') {
      const result = await (this as any)[node.function as string](session.variables);

      if (result.escalate) return this.exitFlow(userId, this.flowDef.nodes[(node.next as any).human].reason as string);
      if (result.success) {
        session.currentNode = (node.next as any).success;
      } else {
        session.retries[node.function as string] = (session.retries[node.function as string] || 0) + 1;
        if (session.retries[node.function as string] <= (node.retries || 0)) {
          session.currentNode = (node.next as any).error;
        } else {
          return this.exitFlow(userId, this.flowDef.nodes['error_exit'].reason as string);
        }
      }
      return this.runNode(userId);
    }

    if (node.type === 'prompt') {
      session.currentNode = node.next as string;
      return this.runNode(userId);
    }

    if (node.type === 'exit') {
      return this.exitFlow(userId, node.reason as string);
    }

    return '';
  }

  private runNode(userId: string): string {
    const session = this.sessions[userId];
    const node = this.flowDef.nodes[session.currentNode as string];
    if (node.type === 'prompt') {
      return node.text!.replace(/{{(\w+)}}/g, (_, key) => session.variables[key] || '');
    }
    if (node.type === 'action') {
      // Action nodes are async, so we call handleFlowMessage with null
      throw new Error('Action node should be handled via handleFlowMessage');
    }
    if (node.type === 'exit') {
      return this.exitFlow(userId, node.reason as string);
    }
    return '';
  }

  private exitFlow(userId: string, reason: string): string {
    const session = this.sessions[userId];
    session.activeFlowName = null;
    session.currentNode = null;
    session.variables = {};
    return reason;
  }

  // Example backend action
  public async get_order_status(vars: Record<string, string>): Promise<{ success?: boolean; escalate?: boolean }> {
    if (vars.order_id === 'A123') {
      vars.status = 'Shipped';
      return { success: true };
    }
    if (vars.order_id === 'AGENT') {
      return { escalate: true };
    }
    return { success: false };
  }
}
