/**
 * Configuration Manager for Safe-Deep Automation Engine
 * Handles environment variables and runtime settings
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

export const config = {
  // LLM Provider Configuration
  llm: {
    provider: process.env.LLM_PROVIDER || 'openai',
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || 'gpt-4-turbo-preview',
    temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.MAX_TOKENS) || 4096,
  },

  // Output Settings
  output: {
    format: process.env.OUTPUT_FORMAT || 'html',
    depthLevel: process.env.DEPTH_LEVEL || 'high',
    includeSchema: process.env.INCLUDE_SCHEMA === 'true',
  },

  // Research Settings
  research: {
    minSources: parseInt(process.env.MIN_SOURCES) || 3,
    maxSources: parseInt(process.env.MAX_SOURCES) || 10,
    verificationEnabled: process.env.VERIFICATION_ENABLED === 'true',
  },

  // API Server Settings
  server: {
    port: parseInt(process.env.PORT) || 3000,
    apiEnabled: process.env.API_ENABLED === 'true',
  },

  // Database Settings
  database: {
    enabled: process.env.DB_ENABLED === 'true',
    connectionString: process.env.DB_CONNECTION_STRING || '',
  },

  // Logging Settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/engine.log',
  },

  // Paths
  paths: {
    root: join(__dirname, '..'),
    templates: join(__dirname, '..', 'templates'),
    output: join(__dirname, '..', 'output'),
    logs: join(__dirname, '..', 'logs'),
  },

  // Depth Levels
  depthLevels: {
    basic: { sections: 3, wordCount: 800, sources: 2 },
    intermediate: { sections: 5, wordCount: 1500, sources: 5 },
    expert: { sections: 8, wordCount: 3000, sources: 10 },
    high: { sections: 10, wordCount: 4000, sources: 15 },
  },
};

// Ensure directories exist
export function ensureDirectories() {
  const dirs = [config.paths.output, config.paths.logs];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Validate configuration
export function validateConfig() {
  const errors = [];
  
  if (!config.llm.apiKey || config.llm.apiKey === 'your_api_key_here') {
    errors.push('LLM_API_KEY is not configured. Please set it in your .env file.');
  }
  
  if (!['openai', 'anthropic', 'ollama'].includes(config.llm.provider)) {
    errors.push(`Invalid LLM_PROVIDER: ${config.llm.provider}. Supported: openai, anthropic, ollama`);
  }
  
  if (!['basic', 'intermediate', 'expert', 'high'].includes(config.output.depthLevel)) {
    errors.push(`Invalid DEPTH_LEVEL: ${config.output.depthLevel}. Supported: basic, intermediate, expert, high`);
  }
  
  if (errors.length > 0) {
    console.warn('⚠️  Configuration Warnings:');
    errors.forEach(err => console.warn(`   - ${err}`));
    return false;
  }
  
  return true;
}

export default config;
