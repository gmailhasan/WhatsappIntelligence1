import { storage } from '../storage';
import { openaiService } from './openai';

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
      
      // Get all website content for the user
      const userWebsites = await storage.getWebsitesByUserId(userId);
      const allContent: SearchResult[] = [];
      
      for (const website of userWebsites) {
        const content = await storage.getWebsiteContent(website.id);
        
        for (const item of content) {
          if (item.embedding) {
            const score = this.cosineSimilarity(queryEmbedding, item.embedding as number[]);
            allContent.push({
              content: item.content,
              url: item.url,
              title: item.title || 'Untitled',
              score,
            });
          }
        }
      }
      
      // Sort by similarity score and return top results
      return allContent
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error searching similar content:', error);
      return [];
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vector dimensions must match');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async addContent(websiteId: number, url: string, title: string, content: string): Promise<void> {
    try {
      const embedding = await openaiService.generateEmbedding(content);
      
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
