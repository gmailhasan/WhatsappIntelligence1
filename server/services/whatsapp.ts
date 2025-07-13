import { storage } from '../storage';
import { openaiService } from './openai';
import { vectorStoreService } from './vectorstore';

export interface WhatsAppMessage {
  id: string;
  from: string;
  text: string;
  timestamp: number;
}

export interface WhatsAppWebhookPayload {
  messages?: WhatsAppMessage[];
  statuses?: Array<{
    id: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: number;
  }>;
}

export class WhatsAppService {
  async sendMessage(phoneNumber: string, message: string): Promise<string> {
    try {
      // For production, replace with actual WhatsApp Business API call
      const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      
      if (!whatsappToken || !phoneNumberId) {
        // Development mode - log the message
        console.log(`[DEV] WhatsApp send to ${phoneNumber}: ${message}`);
        return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Production WhatsApp Business API call
      const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: message
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status}`);
      }
      
      const result = await response.json();
      return result.messages[0].id;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw new Error('Failed to send WhatsApp message');
    }
  }

  async sendTemplateMessage(phoneNumber: string, templateId: number, variables: Record<string, string> = {}): Promise<string> {
    try {
      const template = await storage.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Replace variables in template content
      let message = template.content;
      Object.entries(variables).forEach(([key, value]) => {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      return await this.sendMessage(phoneNumber, message);
    } catch (error) {
      console.error('Error sending template message:', error);
      throw error;
    }
  }

  async handleWebhook(payload: WhatsAppWebhookPayload): Promise<void> {
    try {
      // Handle incoming messages
      if (payload.messages) {
        for (const message of payload.messages) {
          await this.handleIncomingMessage(message);
        }
      }

      // Handle message status updates
      if (payload.statuses) {
        for (const status of payload.statuses) {
          await this.handleStatusUpdate(status);
        }
      }
    } catch (error) {
      console.error('Error handling WhatsApp webhook:', error);
    }
  }

  private async handleIncomingMessage(message: WhatsAppMessage): Promise<void> {
    try {
      // Find or create conversation
      let conversation = await storage.getConversationByPhoneNumber(message.from);
      
      if (!conversation) {
        // Create new conversation - for demo, use userId 1
        conversation = await storage.createConversation({
          userId: 1,
          phoneNumber: message.from,
          customerName: `Customer ${message.from}`,
          campaignId: null,
          aiEnabled: true,
        });
      }

      // Store the incoming message
      await storage.createMessage({
        conversationId: conversation.id,
        content: message.text,
        sender: "customer",
        messageType: "text",
        whatsappMessageId: message.id,
      });

      // Update conversation last message time
      await storage.updateConversation(conversation.id, {
        lastMessageAt: new Date(),
      });

      // Generate AI response if enabled
      if (conversation.aiEnabled) {
        await this.generateAIResponse(conversation.id, message.text);
      }
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  private async generateAIResponse(conversationId: number, userMessage: string): Promise<void> {
    try {
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) return;

      // Search for relevant content using vector store
      const searchResults = await vectorStoreService.searchSimilarContent(
        conversation.userId,
        userMessage,
        3
      );

      if (searchResults.length === 0) {
        // No relevant content found
        const fallbackMessage = "I'd be happy to help you! However, I don't have specific information about your question right now. Please contact our support team for more detailed assistance.";
        
        await storage.createMessage({
          conversationId,
          content: fallbackMessage,
          sender: "ai",
          messageType: "text",
        });

        await this.sendMessage(conversation.phoneNumber, fallbackMessage);
        return;
      }

      // Generate AI response using relevant content
      const context = searchResults.map(result => result.content);
      const aiResponse = await openaiService.generateResponse(userMessage, context);

      // Store AI response
      await storage.createMessage({
        conversationId,
        content: aiResponse.content,
        sender: "ai",
        messageType: "text",
      });

      // Send response via WhatsApp
      await this.sendMessage(conversation.phoneNumber, aiResponse.content);
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  }

  private async handleStatusUpdate(status: { id: string; status: string; timestamp: number }): Promise<void> {
    try {
      // Find message by WhatsApp message ID and update status
      const messages = Array.from(await storage.getMessagesByConversationId(1)); // This would need to be more sophisticated
      // For now, we'll just log the status update
      console.log(`Message ${status.id} status updated to: ${status.status}`);
    } catch (error) {
      console.error('Error handling status update:', error);
    }
  }

  async sendBulkMessages(campaignId: number): Promise<void> {
    try {
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const template = await storage.getTemplate(campaign.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const phoneNumbers = campaign.phoneNumbers as string[];
      let messagesSent = 0;

      for (const phoneNumber of phoneNumbers) {
        try {
          await this.sendTemplateMessage(campaign.templateId, phoneNumber, {
            name: `Customer ${phoneNumber}`,
          });
          messagesSent++;
        } catch (error) {
          console.error(`Error sending message to ${phoneNumber}:`, error);
        }
      }

      // Update campaign stats
      await storage.updateCampaign(campaignId, {
        messagesSent,
        status: "active",
      });
    } catch (error) {
      console.error('Error sending bulk messages:', error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService();
