import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { webScraperService } from "./services/webscraper";
import { whatsappService, type WhatsAppWebhookPayload } from "./services/whatsapp";
import { vectorStoreService } from "./services/vectorstore";
import { openaiService } from "./services/openai";
import { insertWebsiteSchema, insertTemplateSchema, insertCampaignSchema, insertConversationSchema } from "@shared/schema";
import { logger } from './logger';
import { ConversationHistoryItem } from "./services/orchestrator/types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      logger.info(`GET /api/stats for userId ${userId}`);
      const stats = await storage.getStatsForUser(userId);
      res.json(stats);
    } catch (error) {
      logger.error("Failed to fetch stats", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Website management
  app.get("/api/websites", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      logger.info(`GET /api/websites for userId ${userId}`);
      const websites = await storage.getWebsitesByUserId(userId);
      res.json(websites);
    } catch (error) {
      logger.error("Failed to fetch websites", error);
      res.status(500).json({ error: "Failed to fetch websites" });
    }
  });

  app.post("/api/websites", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      logger.info(`POST /api/websites for userId ${userId}`, req.body);
      const websiteData = insertWebsiteSchema.parse({ ...req.body, userId });
      const website = await storage.createWebsite(websiteData);
      // Start crawling in background
      webScraperService.crawlWebsite(website.id, website.url, website.crawlDepth)
        .catch(error => logger.error("Crawling error:", error));
      res.json(website);
    } catch (error) {
      logger.error("Invalid website data", error);
      res.status(400).json({ error: "Invalid website data" });
    }
  });

  app.delete("/api/websites/:id", async (req, res) => {
    try {
      const websiteId = parseInt(req.params.id);
      logger.info(`DELETE /api/websites/${websiteId}`);
      await storage.deleteWebsite(websiteId);
      res.json({ success: true });
    } catch (error) {
      logger.error("Failed to delete website", error);
      res.status(500).json({ error: "Failed to delete website" });
    }
  });

  // Template management
  app.get("/api/templates", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      logger.info(`GET /api/templates for userId ${userId}`);
      const templates = await storage.getTemplatesByUserId(userId);
      res.json(templates);
    } catch (error) {
      logger.error("Failed to fetch templates", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      logger.info(`POST /api/templates for userId ${userId}`, req.body);
      const templateData = insertTemplateSchema.parse({ ...req.body, userId });
      const template = await storage.createTemplate(templateData);
      res.json(template);
    } catch (error) {
      logger.error("Invalid template data", error);
      res.status(400).json({ error: "Invalid template data" });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      logger.info(`PUT /api/templates/${templateId}`, req.body);
      const updates = req.body;
      const template = await storage.updateTemplate(templateId, updates);
      res.json(template);
    } catch (error) {
      logger.error("Failed to update template", error);
      res.status(400).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      logger.info(`DELETE /api/templates/${templateId}`);
      await storage.deleteTemplate(templateId);
      res.json({ success: true });
    } catch (error) {
      logger.error("Failed to delete template", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // Campaign management
  app.get("/api/campaigns", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      logger.info(`GET /api/campaigns for userId ${userId}`);
      const campaigns = await storage.getCampaignsByUserId(userId);
      res.json(campaigns);
    } catch (error) {
      logger.error("Failed to fetch campaigns", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      logger.info(`POST /api/campaigns for userId ${userId}`, req.body);
      const campaignData = insertCampaignSchema.parse({ ...req.body, userId });
      const campaign = await storage.createCampaign(campaignData);
      res.json(campaign);
    } catch (error) {
      logger.error("Invalid campaign data", error);
      res.status(400).json({ error: "Invalid campaign data" });
    }
  });

  app.post("/api/campaigns/:id/send", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      logger.info(`POST /api/campaigns/${campaignId}/send`);
      await whatsappService.sendBulkMessages(campaignId);
      res.json({ success: true });
    } catch (error) {
      logger.error("Failed to send campaign messages", error);
      res.status(500).json({ error: "Failed to send campaign messages" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      logger.info(`PUT /api/campaigns/${campaignId}`, req.body);
      const updates = req.body;
      const campaign = await storage.updateCampaign(campaignId, updates);
      res.json(campaign);
    } catch (error) {
      logger.error("Failed to update campaign", error);
      res.status(400).json({ error: "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      logger.info(`DELETE /api/campaigns/${campaignId}`);
      await storage.deleteCampaign(campaignId);
      res.json({ success: true });
    } catch (error) {
      logger.error("Failed to delete campaign", error);
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  // Conversation management
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      logger.info(`GET /api/conversations for userId ${userId}`);
      const conversations = await storage.getConversationsByUserId(userId);
      res.json(conversations);
    } catch (error) {
      logger.error("Failed to fetch conversations", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      logger.info(`POST /api/conversations for userId ${userId}`, req.body);
      const conversationData = insertConversationSchema.parse({ ...req.body, userId });
      const conversation = await storage.createConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      logger.error("Invalid conversation data", error);
      res.status(400).json({ error: "Invalid conversation data" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      logger.info(`GET /api/conversations/${conversationId}/messages`);
      const messages = await storage.getMessagesByConversationId(conversationId);
      res.json(messages);
    } catch (error) {
      logger.error("Failed to fetch messages", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      logger.info(`POST /api/conversations/${conversationId}/messages`, req.body);
      const { content } = req.body;
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        logger.warn(`Conversation not found for id ${conversationId}`);
        return res.status(404).json({ error: "Conversation not found" });
      }
      // Store the message
      const message = await storage.createMessage({
        conversationId,
        content,
        sender: "user",
        messageType: "text",
      });
      // Send via WhatsApp
      await whatsappService.sendMessage(conversation.phoneNumber, content);
      res.json(message);
    } catch (error) {
      logger.error("Failed to send message", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.put("/api/conversations/:id", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      logger.info(`PUT /api/conversations/${conversationId}`, req.body);
      const updates = req.body;
      const conversation = await storage.updateConversation(conversationId, updates);
      res.json(conversation);
    } catch (error) {
      logger.error("Failed to update conversation", error);
      res.status(400).json({ error: "Failed to update conversation" });
    }
  });

  // WhatsApp webhook verification
  app.get("/api/whatsapp/webhook", (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    logger.info(`GET /api/whatsapp/webhook mode=${mode} token=${token}`);
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    if (mode === 'subscribe' && token === verifyToken) {
      logger.info('WhatsApp webhook verified');
      res.status(200).send(challenge);
    } else {
      logger.warn('WhatsApp webhook verification failed');
      res.status(403).send('Forbidden');
    }
  });

  // WhatsApp webhook
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      logger.info('POST /api/whatsapp/webhook', req.body);
      // Transform incoming WhatsApp Cloud API payload to WhatsAppWebhookPayload
      const entry = req.body.entry?.[0];
      const value = entry?.changes?.[0]?.value;
      const payload: WhatsAppWebhookPayload = {
        messages: value?.messages?.map((msg: any) => ({
          id: msg.id,
          from: msg.from,
          text: msg.text?.body || "",
          timestamp: Number(msg.timestamp),
        })),
      };
      logger.info('Received WhatsApp webhook payload', payload);
      await whatsappService.handleWebhook(payload);
      res.json({ success: true });
    } catch (error) {
      logger.error("Failed to process webhook", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Search functionality
  app.get("/api/search", async (req, res) => {
    try {
      const { query } = req.query;
      const userId = 1; // Demo user ID
      logger.info(`GET /api/search for userId ${userId} query='${query}'`);
      if (!query || typeof query !== 'string') {
        logger.warn('Search query parameter missing or invalid');
        return res.status(400).json({ error: "Query parameter is required" });
      }
      const results = await vectorStoreService.searchSimilarContent(userId, query, 5);
      res.json(results);
    } catch (error) {
      logger.error("Failed to search content", error);
      res.status(500).json({ error: "Failed to search content" });
    }
  });

  // Test AI response
  // In-memory chat history per user (for demo/testing only)
  const chatHistories: Record<string, ConversationHistoryItem[]> = {};

  app.post("/api/test-ai", async (req, res) => {
    try {
      const { query } = req.body;
      const userId = 1; // Demo user ID
      logger.info(`POST /api/test-ai for userId ${userId} query='${query}'`);
      if (!query) {
        logger.warn('AI test query missing');
        return res.status(400).json({ error: "Query is required" });
      }
      // Initialize or get chat history for user
      if (!chatHistories[userId]) chatHistories[userId] = [];
      // Add user message
      chatHistories[userId].push({ role: 'user', content: query });
      // Keep only last 10 messages
      chatHistories[userId] = chatHistories[userId].slice(-10);
      // Get context from vector search
      const searchResults = await vectorStoreService.searchSimilarContent(userId, query, 3);
      const context = searchResults.map(result => result.content);
      // Add context as assistant messages (optional, or just use chat history)
      const history: ConversationHistoryItem[] = [
        ...chatHistories[userId],
        ...context.map(content => ({ role: 'assistant' as const, content }))
      ].slice(-10);
      const aiResponse = await openaiService.chat(history);
      // Add AI response to history
  chatHistories[userId].push({ role: 'assistant', content: aiResponse.content });
      chatHistories[userId] = chatHistories[userId].slice(-10);
      res.json({
        response: aiResponse,
        context: searchResults,
        history: chatHistories[userId],
      });
    } catch (error) {
      logger.error("Failed to generate AI response", error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
