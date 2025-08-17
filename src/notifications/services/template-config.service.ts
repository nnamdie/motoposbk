import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationTemplate } from '../models/notification-template.interface';

@Injectable()
export class TemplateConfigService {
  private readonly logger = new Logger(TemplateConfigService.name);
  private readonly templateDir = path.join(process.cwd(), 'src/notifications/templates');
  private templateCache: Map<string, NotificationTemplate> = new Map();
  private cacheInitialized = false;

  /**
   * Get template configuration by name
   */
  async getTemplateConfig(templateName: string): Promise<NotificationTemplate | null> {
    await this.ensureCacheInitialized();
    
    if (!this.templateCache.has(templateName)) {
      this.logger.warn(`Template '${templateName}' not found in cache`);
      return null;
    }

    return this.templateCache.get(templateName)!;
  }

  /**
   * Check if template supports the requested channel
   */
  async validateTemplateChannel(templateName: string, channel: NotificationChannel): Promise<boolean> {
    const config = await this.getTemplateConfig(templateName);
    if (!config) {
      return false;
    }

    return config.channels.hasOwnProperty(channel);
  }

  /**
   * Validate that required variables are provided
   */
  async validateTemplateVariables(templateName: string, variables: Record<string, any>): Promise<{
    isValid: boolean;
    missing: string[];
    extra: string[];
  }> {
    const config = await this.getTemplateConfig(templateName);
    if (!config) {
      return { isValid: false, missing: [], extra: [] };
    }

    const requiredVars = Object.keys(config.variables);
    const providedVars = Object.keys(variables);

    const missing = requiredVars.filter(v => !providedVars.includes(v));
    const extra = providedVars.filter(v => !requiredVars.includes(v));

    return {
      isValid: missing.length === 0,
      missing,
      extra,
    };
  }

  /**
   * Get all available template names
   */
  async getAvailableTemplates(): Promise<string[]> {
    await this.ensureCacheInitialized();
    return Array.from(this.templateCache.keys());
  }

  /**
   * Get templates that support a specific channel
   */
  async getTemplatesByChannel(channel: NotificationChannel): Promise<string[]> {
    await this.ensureCacheInitialized();
    
    const supportedTemplates: string[] = [];
    
    for (const [name, config] of this.templateCache.entries()) {
      if (config.channels.hasOwnProperty(channel)) {
        supportedTemplates.push(name);
      }
    }

    return supportedTemplates;
  }

  /**
   * Ensure cache is initialized (only once per server lifetime)
   */
  private async ensureCacheInitialized(): Promise<void> {
    if (this.cacheInitialized) {
      return; // Cache is already initialized and valid
    }

    await this.initializeCache();
  }

  /**
   * Initialize template cache from disk (called once on server start)
   */
  private async initializeCache(): Promise<void> {
    try {
      this.logger.log('Initializing template cache...');
      
      const files = await fs.readdir(this.templateDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      this.templateCache.clear();
      
      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.templateDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const config: NotificationTemplate = JSON.parse(content);
          
          // Extract template name from filename (remove .json extension)
          const templateName = path.basename(file, '.json');
          
          this.templateCache.set(templateName, config);
          this.logger.debug(`Loaded template: ${templateName}`);
        } catch (error) {
          this.logger.error(`Failed to load template from ${file}: ${error.message}`);
        }
      }
      
      this.cacheInitialized = true;
      this.logger.log(`Template cache initialized. Loaded ${this.templateCache.size} templates`);
    } catch (error) {
      this.logger.error(`Failed to initialize template cache: ${error.message}`);
      // Even if initialization fails, mark as initialized to prevent infinite retries
      this.cacheInitialized = true;
    }
  }

  /**
   * Manually refresh cache (for testing/debugging or after template updates)
   * Note: This should only be used when templates are updated and server is redeployed
   */
  async forceRefreshCache(): Promise<void> {
    this.logger.log('Manually refreshing template cache...');
    this.cacheInitialized = false;
    await this.initializeCache();
  }

  /**
   * Get cache status
   */
  getCacheStatus(): {
    templateCount: number;
    initialized: boolean;
    templateNames: string[];
  } {
    return {
      templateCount: this.templateCache.size,
      initialized: this.cacheInitialized,
      templateNames: Array.from(this.templateCache.keys()),
    };
  }

  /**
   * Check if a specific template exists in cache
   */
  hasTemplate(templateName: string): boolean {
    return this.templateCache.has(templateName);
  }

  /**
   * Get all template configurations (for debugging/admin purposes)
   */
  getAllTemplateConfigs(): Map<string, NotificationTemplate> {
    return new Map(this.templateCache);
  }
}
