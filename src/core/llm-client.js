/**
 * LLM Client Manager
 * Handles connections to various LLM providers (OpenAI, Anthropic, Ollama)
 */

import OpenAI from 'openai';
import axios from 'axios';
import config from '../config/index.js';

export class LLMClient {
  constructor() {
    this.provider = config.llm.provider;
    this.apiKey = config.llm.apiKey;
    this.model = config.llm.model;
    this.temperature = config.llm.temperature;
    this.maxTokens = config.llm.maxTokens;
    
    this.initializeClient();
  }

  /**
   * Initialize the appropriate client based on provider
   */
  initializeClient() {
    switch (this.provider) {
      case 'openai':
        this.client = new OpenAI({
          apiKey: this.apiKey,
        });
        break;
      case 'anthropic':
        // Anthropic client initialization
        this.client = {
          apiKey: this.apiKey,
          baseURL: 'https://api.anthropic.com/v1',
        };
        break;
      case 'ollama':
        // Ollama uses local endpoint
        this.client = {
          baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        };
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${this.provider}`);
    }
  }

  /**
   * Generate text using the configured LLM
   */
  async generate(prompt, options = {}) {
    const {
      temperature = this.temperature,
      maxTokens = this.maxTokens,
      responseFormat = null,
      systemPrompt = 'You are a helpful AI assistant specialized in creating high-quality, deep content.',
    } = options;

    try {
      switch (this.provider) {
        case 'openai':
          return await this.generateOpenAI(prompt, { temperature, maxTokens, responseFormat, systemPrompt });
        case 'anthropic':
          return await this.generateAnthropic(prompt, { temperature, maxTokens, systemPrompt });
        case 'ollama':
          return await this.generateOllama(prompt, { temperature, maxTokens, systemPrompt });
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error(`Error generating with ${this.provider}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate using OpenAI
   */
  async generateOpenAI(prompt, options) {
    const { temperature, maxTokens, responseFormat, systemPrompt } = options;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined,
    });

    return completion.choices[0].message.content;
  }

  /**
   * Generate using Anthropic
   */
  async generateAnthropic(prompt, options) {
    const { temperature, maxTokens, systemPrompt } = options;

    const response = await axios.post(
      `${this.client.baseURL}/messages`,
      {
        model: this.model || 'claude-3-opus-20240229',
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.client.apiKey,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    return response.data.content[0].text;
  }

  /**
   * Generate using Ollama (local models)
   */
  async generateOllama(prompt, options) {
    const { temperature, maxTokens, systemPrompt } = options;

    const response = await axios.post(
      `${this.client.baseURL}/api/generate`,
      {
        model: this.model || 'llama2',
        prompt: `${systemPrompt}\n\n${prompt}`,
        stream: false,
        options: {
          temperature,
          num_predict: maxTokens,
        },
      }
    );

    return response.data.response;
  }

  /**
   * Generate structured JSON output
   */
  async generateJSON(prompt, schema) {
    const systemPrompt = `You are a JSON generator. Always respond with valid JSON matching this schema:
${JSON.stringify(schema, null, 2)}

Do not include any text outside of the JSON object.`;

    return await this.generate(prompt, {
      responseFormat: 'json',
      systemPrompt,
    });
  }

  /**
   * Test connection to LLM provider
   */
  async testConnection() {
    try {
      const response = await this.generate('Respond with only: "Connection successful"', {
        temperature: 0,
        maxTokens: 10,
      });
      
      return {
        success: true,
        message: 'Connection test passed',
        provider: this.provider,
        model: this.model,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        provider: this.provider,
      };
    }
  }

  /**
   * Get available models for current provider
   */
  async getAvailableModels() {
    if (this.provider === 'openai') {
      const models = await this.client.models.list();
      return models.data.map(m => m.id);
    } else if (this.provider === 'ollama') {
      const response = await axios.get(`${this.client.baseURL}/api/tags`);
      return response.data.models.map(m => m.name);
    }
    
    return [this.model];
  }
}

export default LLMClient;
