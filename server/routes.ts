import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { webScraperService } from "./services/webscraper";
import { whatsappService } from "./services/whatsapp";
import { vectorStoreService } from "./services/vectorstore";
import { openaiService } from "./services/openai";
import { insertWebsiteSchema, insertTemplateSchema, insertCampaignSchema, insertConversationSchema } from "@shared/schema";
import { logger } from './logger';

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const stats = await storage.getStatsForUser(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Website management
  app.get("/api/websites", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const websites = await storage.getWebsitesByUserId(userId);
      res.json(websites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch websites" });
    }
  });

  app.post("/api/websites", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const websiteData = insertWebsiteSchema.parse({ ...req.body, userId });
      const website = await storage.createWebsite(websiteData);
      
      // Start crawling in background
      webScraperService.crawlWebsite(website.id, website.url, website.crawlDepth)
        .catch(error => console.error("Crawling error:", error));
      
      res.json(website);
    } catch (error) {
      res.status(400).json({ error: "Invalid website data" });
    }
  });

  app.delete("/api/websites/:id", async (req, res) => {
    try {
      const websiteId = parseInt(req.params.id);
      await storage.deleteWebsite(websiteId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete website" });
    }
  });

  // Template management
  app.get("/api/templates", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const templates = await storage.getTemplatesByUserId(userId);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const templateData = insertTemplateSchema.parse({ ...req.body, userId });
      const template = await storage.createTemplate(templateData);
      res.json(template);
    } catch (error) {
      res.status(400).json({ error: "Invalid template data" });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const updates = req.body;
      const template = await storage.updateTemplate(templateId, updates);
      res.json(template);
    } catch (error) {
      res.status(400).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      await storage.deleteTemplate(templateId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // Campaign management
  app.get("/api/campaigns", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const campaigns = await storage.getCampaignsByUserId(userId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const campaignData = insertCampaignSchema.parse({ ...req.body, userId });
      const campaign = await storage.createCampaign(campaignData);
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ error: "Invalid campaign data" });
    }
  });

  app.post("/api/campaigns/:id/send", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      await whatsappService.sendBulkMessages(campaignId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send campaign messages" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const updates = req.body;
      const campaign = await storage.updateCampaign(campaignId, updates);
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ error: "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      await storage.deleteCampaign(campaignId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  // Conversation management
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const conversations = await storage.getConversationsByUserId(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const userId = 1; // Demo user ID
      const conversationData = insertConversationSchema.parse({ ...req.body, userId });
      const conversation = await storage.createConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ error: "Invalid conversation data" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getMessagesByConversationId(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
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
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.put("/api/conversations/:id", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const updates = req.body;
      const conversation = await storage.updateConversation(conversationId, updates);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ error: "Failed to update conversation" });
    }
  });

  // WhatsApp webhook verification
  app.get("/api/whatsapp/webhook", (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    
    if (mode === 'subscribe' && token === verifyToken) {
      logger.info('WhatsApp webhook verified');
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  });

  // WhatsApp webhook
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      logger.info('Received WhatsApp webhook payload:' );
      await whatsappService.handleWebhook(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Search functionality
  app.get("/api/search", async (req, res) => {
    try {
      const { query } = req.query;
      const userId = 1; // Demo user ID
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const results = await vectorStoreService.searchSimilarContent(userId, query, 5);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to search content" });
    }
  });

  // Test AI response
  app.post("/api/test-ai", async (req, res) => {
    try {
      const { query } = req.body;
      const userId = 1; // Demo user ID
      
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const searchResults = await vectorStoreService.searchSimilarContent(userId, query, 3);
      const context = searchResults.map(result => result.content);
      
      const aiResponse = await openaiService.generateResponse(query, context);
      
      res.json({
        response: aiResponse,
        context: searchResults,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
