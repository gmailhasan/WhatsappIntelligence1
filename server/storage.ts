import { logger } from './logger';
import { 
  users, websites, websiteContent, templates, campaigns, conversations, messages,
  type User, type InsertUser, type Website, type InsertWebsite, type WebsiteContent,
  type Template, type InsertTemplate, type Campaign, type InsertCampaign,
  type Conversation, type InsertConversation, type Message, type InsertMessage
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Website methods
  getWebsitesByUserId(userId: number): Promise<Website[]>;
  getWebsite(id: number): Promise<Website | undefined>;
  createWebsite(website: InsertWebsite): Promise<Website>;
  updateWebsite(id: number, updates: Partial<Website>): Promise<Website>;
  deleteWebsite(id: number): Promise<void>;

  // Website content methods
  getWebsiteContent(websiteId: number): Promise<WebsiteContent[]>;
  createWebsiteContent(content: Omit<WebsiteContent, 'id' | 'createdAt'>): Promise<WebsiteContent>;
  searchWebsiteContent(userId: number, query: string): Promise<WebsiteContent[]>;

  // Template methods
  getTemplatesByUserId(userId: number): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, updates: Partial<Template>): Promise<Template>;
  deleteTemplate(id: number): Promise<void>;

  // Campaign methods
  getCampaignsByUserId(userId: number): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;

  // Conversation methods
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation>;
  getConversationByPhoneNumber(phoneNumber: string): Promise<Conversation | undefined>;

  // Message methods
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, updates: Partial<Message>): Promise<Message>;

  // Analytics methods
  getStatsForUser(userId: number): Promise<{
    totalMessages: number;
    activeCampaigns: number;
    aiResponses: number;
    responseRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private websites: Map<number, Website> = new Map();
  private websiteContent: Map<number, WebsiteContent> = new Map();
  private templates: Map<number, Template> = new Map();
  private campaigns: Map<number, Campaign> = new Map();
  private conversations: Map<number, Conversation> = new Map();
  private messages: Map<number, Message> = new Map();
  
  private currentUserId = 1;
  private currentWebsiteId = 1;
  private currentWebsiteContentId = 1;
  private currentTemplateId = 1;
  private currentCampaignId = 1;
  private currentConversationId = 1;
  private currentMessageId = 1;

  constructor() {
    // Initialize with a demo user
    logger.info('Initializing MemStorage with demo user');
    this.createUser({
      username: "demo",
      password: "demo123",
      email: "demo@example.com",
      name: "Demo User"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    logger.info(`Creating user: ${insertUser.username}`);
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getWebsitesByUserId(userId: number): Promise<Website[]> {
    return Array.from(this.websites.values()).filter(website => website.userId === userId);
  }

  async getWebsite(id: number): Promise<Website | undefined> {
    return this.websites.get(id);
  }

  async createWebsite(insertWebsite: InsertWebsite): Promise<Website> {
    const id = this.currentWebsiteId++;
    const website: Website = {
      ...insertWebsite,
      id,
      status: "pending",
      pagesIndexed: 0,
      crawlDepth: insertWebsite.crawlDepth || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.websites.set(id, website);
    return website;
  }

  async updateWebsite(id: number, updates: Partial<Website>): Promise<Website> {
    const website = this.websites.get(id);
    if (!website) throw new Error("Website not found");
    
    const updatedWebsite = { ...website, ...updates, updatedAt: new Date() };
    this.websites.set(id, updatedWebsite);
    return updatedWebsite;
  }

  async deleteWebsite(id: number): Promise<void> {
    this.websites.delete(id);
    // Also delete associated content
    Array.from(this.websiteContent.entries()).forEach(([contentId, content]) => {
      if (content.websiteId === id) {
        this.websiteContent.delete(contentId);
      }
    });
  }

  async getWebsiteContent(websiteId: number): Promise<WebsiteContent[]> {
    return Array.from(this.websiteContent.values()).filter(content => content.websiteId === websiteId);
  }

  async createWebsiteContent(content: Omit<WebsiteContent, 'id' | 'createdAt'>): Promise<WebsiteContent> {
    const id = this.currentWebsiteContentId++;
    const websiteContent: WebsiteContent = {
      ...content,
      id,
      createdAt: new Date(),
    };
    this.websiteContent.set(id, websiteContent);
    return websiteContent;
  }

  async searchWebsiteContent(userId: number, query: string): Promise<WebsiteContent[]> {
    const userWebsites = await this.getWebsitesByUserId(userId);
    const websiteIds = userWebsites.map(w => w.id);
    
    return Array.from(this.websiteContent.values())
      .filter(content => 
        websiteIds.includes(content.websiteId) &&
        (content.content.toLowerCase().includes(query.toLowerCase()) ||
         content.title?.toLowerCase().includes(query.toLowerCase()))
      );
  }

  async getTemplatesByUserId(userId: number): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(template => template.userId === userId);
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.currentTemplateId++;
    const template: Template = {
      ...insertTemplate,
      id,
      createdAt: new Date(),
      variables: insertTemplate.variables || {},
      enableAI: insertTemplate.enableAI || false,
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: number, updates: Partial<Template>): Promise<Template> {
    const template = this.templates.get(id);
    if (!template) throw new Error("Template not found");
    
    const updatedTemplate = { ...template, ...updates };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: number): Promise<void> {
    this.templates.delete(id);
  }

  async getCampaignsByUserId(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(campaign => campaign.userId === userId);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentCampaignId++;
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      status: "draft",
      messagesSent: 0,
      responsesReceived: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      phoneNumbers: insertCampaign.phoneNumbers || [],
      scheduledFor: insertCampaign.scheduledFor || null,
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign> {
    logger.info(`Updating campaign ${id}`);
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error("Campaign not found");
    
    const updatedCampaign = { ...campaign, ...updates, updatedAt: new Date() };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    this.campaigns.delete(id);
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(conversation => conversation.userId === userId);
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = {
      ...insertConversation,
      id,
      status: "active",
      lastMessageAt: new Date(),
      createdAt: new Date(),
      campaignId: insertConversation.campaignId || null,
      customerName: insertConversation.customerName || null,
      aiEnabled: insertConversation.aiEnabled || false,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation> {
    logger.info(`Updating conversation ${id}`);
    const conversation = this.conversations.get(id);
    if (!conversation) throw new Error("Conversation not found");
    
    const updatedConversation = { ...conversation, ...updates };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  async getConversationByPhoneNumber(phoneNumber: string): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(conv => conv.phoneNumber === phoneNumber);
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    logger.info(`Creating message for conversation ${insertMessage.conversationId}`);
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      status: "sent",
      createdAt: new Date(),
      messageType: insertMessage.messageType || "text",
      whatsappMessageId: insertMessage.whatsappMessageId || null,
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessage(id: number, updates: Partial<Message>): Promise<Message> {
    const message = this.messages.get(id);
    if (!message) throw new Error("Message not found");
    
    const updatedMessage = { ...message, ...updates };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async getStatsForUser(userId: number): Promise<{
    totalMessages: number;
    activeCampaigns: number;
    aiResponses: number;
    responseRate: number;
  }> {
    const userCampaigns = await this.getCampaignsByUserId(userId);
    const userConversations = await this.getConversationsByUserId(userId);
    
    const totalMessages = userCampaigns.reduce((sum, campaign) => sum + campaign.messagesSent, 0);
    const activeCampaigns = userCampaigns.filter(c => c.status === "active").length;
    
    const allMessages = Array.from(this.messages.values());
    const aiResponses = allMessages.filter(m => m.sender === "ai").length;
    const responsesReceived = userCampaigns.reduce((sum, campaign) => sum + campaign.responsesReceived, 0);
    
    const responseRate = totalMessages > 0 ? (responsesReceived / totalMessages) * 100 : 0;

    return {
      totalMessages,
      activeCampaigns,
      aiResponses,
      responseRate: Math.round(responseRate * 10) / 10,
    };
  }
}

export const storage = new MemStorage();
