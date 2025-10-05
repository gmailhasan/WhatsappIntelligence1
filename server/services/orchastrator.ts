class ChatOrchestrator {
  constructor(flowDef, llmClient) {
    this.flowDef = flowDef;
    this.llmClient = llmClient; // e.g., OpenAI, Azure OpenAI, etc.
    // sessions: userId → { activeFlows: { flowName: { currentNode, variables, retries } }, llmHistory }
    this.sessions = {};
  }

  detectIntent(text) {
    for (const [nodeId, node] of Object.entries(this.flowDef.nodes)) {
      if (node.type === 'trigger' && node.match_phrases.some(p => text.toLowerCase().includes(p))) {
        return nodeId;
      }
    }
    return null;
  }

  async handleMessage(userId, text) {
    let session = this.sessions[userId] || { activeFlows: {}, llmHistory: [] };

    // Check if any active flow expects input
    for (const [flowName, flowState] of Object.entries(session.activeFlows)) {
      const currentNode = this.flowDef.nodes[flowState.currentNode];
      if (currentNode && (currentNode.type === 'prompt' || currentNode.type === 'action')) {
        // Route message to this flow
        const reply = await this.handleFlowMessage(userId, flowName, text);
        this.sessions[userId] = session;
        return reply;
      }
    }

    // No active flow expecting input → check intent
    const triggerNodeId = this.detectIntent(text);
    if (triggerNodeId) {
      // Start a new flow instance
      session.activeFlows[triggerNodeId] = {
        currentNode: this.flowDef.nodes[triggerNodeId].next,
        variables: {},
        retries: {}
      };
      this.sessions[userId] = session;
      return this.runNode(userId, triggerNodeId);
    }

    // No intent match → normal LLM chat
    session.llmHistory.push({ role: 'user', content: text });
    const llmReply = await this.llmClient.chat(session.llmHistory);
    session.llmHistory.push({ role: 'assistant', content: llmReply });
    this.sessions[userId] = session;
    return llmReply;
  }

  async handleFlowMessage(userId, flowName, text) {
    const session = this.sessions[userId];
    const flowState = session.activeFlows[flowName];
    const node = this.flowDef.nodes[flowState.currentNode];

    if (node.expects) {
      flowState.variables[node.expects] = text;
    }

    if (node.type === 'action') {
      const result = await this[node.function](flowState.variables);

      if (result.escalate) return this.exitFlow(userId, flowName, this.flowDef.nodes[node.next.human].reason);
      if (result.success) {
        flowState.currentNode = node.next.success;
      } else {
        flowState.retries[node.function] = (flowState.retries[node.function] || 0) + 1;
        if (flowState.retries[node.function] <= (node.retries || 0)) {
          flowState.currentNode = node.next.error;
        } else {
          return this.exitFlow(userId, flowName, this.flowDef.nodes['error_exit'].reason);
        }
      }
      return this.runNode(userId, flowName);
    }

    if (node.type === 'prompt') {
      flowState.currentNode = node.next;
      return this.runNode(userId, flowName);
    }

    if (node.type === 'exit') {
      return this.exitFlow(userId, flowName, node.reason);
    }
  }

  runNode(userId, flowName) {
    const session = this.sessions[userId];
    const flowState = session.activeFlows[flowName];
    const node = this.flowDef.nodes[flowState.currentNode];
    if (node.type === 'prompt') {
      return node.text.replace(/{{(\w+)}}/g, (_, key) => flowState.variables[key] || '');
    }
    if (node.type === 'action') {
      return this.handleFlowMessage(userId, flowName, null);
    }
    if (node.type === 'exit') {
      return this.exitFlow(userId, flowName, node.reason);
    }
  }

  exitFlow(userId, flowName, reason) {
    const session = this.sessions[userId];
    delete session.activeFlows[flowName];
    return reason;
  }

  // Example backend action
  async get_order_status(vars) {
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