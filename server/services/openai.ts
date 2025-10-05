import OpenAI from "openai";
import { logger } from '../logger';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface AIResponse {
  content: string;
  confidence: number;
  sources: string[];
}

import { ConversationHistoryItem, LLMClient } from "./orchestrator/types";

export class OpenAIService implements LLMClient {
  async chat(history: ConversationHistoryItem[]): Promise<string> {
    // Only keep the last 10 conversation items
    const recentHistory = history.slice(-10);
    const context: string[] = recentHistory
      .filter((item) => item.role === "assistant" || item.role === "user")
      .map((item) => `${item.role}: ${item.content}`);
    const lastUserMsg = [...recentHistory].reverse().find((item) => item.role === "user");
    const query = lastUserMsg?.content || "";
    const aiResp = await this.generateResponse(query, context);
    return aiResp.content;
  }
  async generateResponse(query: string, context: string[]): Promise<AIResponse> {
    try {
      const systemPrompt = `You are a helpful customer service assistant. Use the provided context to answer user questions accurately and helpfully. If you cannot find the answer in the context, politely say so and suggest they contact support.

Context information:
${context.join('\n\n')}

Respond in JSON format with the following structure:
{
  "content": "Your response to the user, formatted Markdown for clarity and readability (use lists, bold, code blocks, etc. as appropriate)",
  "confidence": 0.95,
  "sources": ["source1", "source2"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      logger.info("OpenAI Response:", result);
      
      return {
        content: result.content || "I'm sorry, I couldn't generate a response.",
        confidence: result.confidence || 0.5,
        sources: result.sources || [],
      };
    } catch (error) {
      logger.error("OpenAI API Error:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error("OpenAI Embedding Error:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  async summarizeContent(content: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Summarize the following content in a concise way that captures the key information for customer service purposes."
          },
          { role: "user", content: content }
        ],
        temperature: 0.5,
        max_tokens: 200,
      });

      return response.choices[0].message.content || content;
    } catch (error) {
      logger.error("OpenAI Summarize Error:", error);
      return content; // Return original content if summarization fails
    }
  }
}

export const openaiService = new OpenAIService();
