import { logger } from '../logger';
import * as cheerio from 'cheerio';
import { storage } from '../storage';
import { openaiService } from './openai';

export interface CrawlResult {
  url: string;
  title: string;
  content: string;
  links: string[];
}

export class WebScraperService {
  async crawlWebsite(websiteId: number, url: string, depth: number = 1): Promise<void> {
    try {
      logger.info(`Starting crawl for website ${websiteId} at ${url} with depth ${depth}`);
      await storage.updateWebsite(websiteId, { status: "crawling" });
      const visited = new Set<string>();
      const toVisit = [{ url, depth: 0 }];
      let pagesIndexed = 0;

      while (toVisit.length > 0) {
        const { url: currentUrl, depth: currentDepth } = toVisit.shift()!;
        logger.debug(`Dequeued URL: ${currentUrl} at depth ${currentDepth}`);
        if (visited.has(currentUrl) || currentDepth >= depth) {
          logger.debug(`Skipping URL: ${currentUrl} (visited or max depth)`);
          continue;
        }

        try {
          logger.info(`Crawling URL: ${currentUrl}`);
          const result = await this.scrapeUrl(currentUrl);
          visited.add(currentUrl);
          logger.debug(`Visited URLs count: ${visited.size}`);
          // Generate embedding for the content
          const embedding = await openaiService.generateEmbedding(result.content);
          logger.debug(`Generated embedding for ${currentUrl}`);
          // Store the content
          await storage.createWebsiteContent({
            websiteId,
            url: currentUrl,
            title: result.title,
            content: result.content,
            embedding,
          });
          logger.info(`Stored content for ${currentUrl}`);
          pagesIndexed++;
          logger.info(`Indexed page: ${currentUrl} (title: ${result.title})`);
          // Add new links to visit if we haven't reached max depth
          if (currentDepth < depth - 1) {
            for (const link of result.links) {
              if (!visited.has(link) && this.isValidUrl(link, url)) {
                logger.debug(`Queueing link: ${link}`);
                toVisit.push({ url: link, depth: currentDepth + 1 });
              } else {
                logger.debug(`Skipping link: ${link}`);
              }
            }
          }
          // Update progress
          await storage.updateWebsite(websiteId, { pagesIndexed });
          logger.debug(`Updated pagesIndexed for websiteId ${websiteId}: ${pagesIndexed}`);
        } catch (error) {
          logger.error(`Error crawling ${currentUrl}:`, error);
        }
      }
      logger.info(`Crawl completed for website ${websiteId}. Pages indexed: ${pagesIndexed}`);
      await storage.updateWebsite(websiteId, { 
        status: "completed",
        pagesIndexed,
      });
    } catch (error) {
      logger.error(`Error crawling website ${websiteId}:`, error);
      await storage.updateWebsite(websiteId, { status: "failed" });
    }
  }

  private async scrapeUrl(url: string): Promise<CrawlResult> {
    logger.info(`Scraping URL: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      logger.error(`Failed to fetch ${url}: ${response.status}`);
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    logger.debug(`Fetched HTML for ${url}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    // Remove script and style elements
    $('script, style, nav, header, footer').remove();
    // Extract title
    const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';
    logger.debug(`Extracted title for ${url}: ${title}`);
    // Extract main content
    const contentSelectors = [
      'main',
      'article',
      '.content',
      '.main-content',
      '#content',
      'body'
    ];
    let content = '';
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        logger.debug(`Found content for ${url} using selector: ${selector}`);
        break;
      }
    }
    // Clean up content
    content = content.replace(/\s+/g, ' ').trim();
    // Limit content length
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...';
      logger.debug(`Content for ${url} truncated to 10000 chars`);
    }
    // Extract links
    const links: string[] = [];
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const absoluteUrl = new URL(href, url).href;
        links.push(absoluteUrl);
      }
    });
    logger.debug(`Extracted ${links.length} links from ${url}`);
    return {
      url,
      title,
      content,
      links: Array.from(new Set(links)), // Remove duplicates
    };
  }

  private isValidUrl(link: string, baseUrl: string): boolean {
    try {
      const linkUrl = new URL(link);
      const baseUrlObj = new URL(baseUrl);
      // Only crawl same domain
      if (linkUrl.hostname !== baseUrlObj.hostname) {
        logger.debug(`Skipping link (different domain): ${link}`);
        return false;
      }
      // Skip non-HTTP protocols
      if (!linkUrl.protocol.startsWith('http')) {
        logger.debug(`Skipping link (non-http): ${link}`);
        return false;
      }
      // Skip file extensions we don't want
      const skipExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.css', '.js', '.xml'];
      if (skipExtensions.some(ext => linkUrl.pathname.toLowerCase().endsWith(ext))) {
        logger.debug(`Skipping link (file extension): ${link}`);
        return false;
      }
      return true;
    } catch {
      logger.debug(`Skipping link (invalid URL): ${link}`);
      return false;
    }
  }
}

export const webScraperService = new WebScraperService();
