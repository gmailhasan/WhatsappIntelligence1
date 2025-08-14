import { storage } from '../storage';
import { openaiService } from './openai';
import { queryVector, upsertVector } from './pinecone';

export interface SearchResult {
  content: string;
  url: string;
  title: string;
  score: number;
}

export class VectorStoreService {
  async searchSimilarContent(userId: number, query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await openaiService.generateEmbedding(query);

      // Query Pinecone for similar vectors
      const matches = await queryVector(queryEmbedding, limit, { userId });
      return matches.map((match: any) => ({
        content: match.metadata.content,
        url: match.metadata.url,
        title: match.metadata.title,
        score: match.score,
      }));
    } catch (error) {
      console.error('Error searching similar content:', error);
      return [];
    }
  }

  async addContent(websiteId: number, url: string, title: string, content: string): Promise<void> {
    try {
      const embedding = await openaiService.generateEmbedding(content);
      // Optionally, upsert to Pinecone here as well
      await upsertVector(`${websiteId}:${url}`, embedding, { websiteId, url, title, content });
      await storage.createWebsiteContent({
        websiteId,
        url,
        title,
        content,
        embedding,
      });
    } catch (error) {
      console.error('Error adding content to vector store:', error);
      throw error;
    }
  }
}

export const vectorStoreService = new VectorStoreService();
