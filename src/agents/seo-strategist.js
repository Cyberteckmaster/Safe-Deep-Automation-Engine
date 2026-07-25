/**
 * SEO Strategist Agent
 * Handles keyword analysis, competitor research, and SEO optimization
 */

import config from '../config/index.js';

export class SEOStrategist {
  constructor(llmClient) {
    this.llm = llmClient;
    this.intentPatterns = {
      informational: ['how to', 'what is', 'guide', 'tutorial', 'explain'],
      navigational: ['login', 'sign in', 'website', 'official'],
      transactional: ['buy', 'price', 'cost', 'order', 'purchase'],
      commercial: ['best', 'review', 'comparison', 'vs', 'top'],
    };
  }

  /**
   * Analyze search intent for a given topic/keyword
   */
  async analyzeIntent(topic) {
    const prompt = `Analyze the search intent for: "${topic}"
    
    Determine:
    1. Primary intent type (informational, navigational, transactional, commercial)
    2. User goals and expectations
    3. Key questions users want answered
    4. Related entities and concepts
    5. Content depth required
    
    Return as JSON.`;

    try {
      const response = await this.llm.generate(prompt, {
        temperature: 0.3,
        responseFormat: 'json',
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing intent:', error);
      return this.getDefaultIntentAnalysis(topic);
    }
  }

  /**
   * Identify content gaps compared to competitors
   */
  async identifyContentGaps(topic, competitorUrls = []) {
    const prompt = `For the topic "${topic}", identify content gaps that would make our content superior.
    
    ${competitorUrls.length > 0 ? `Competitor URLs: ${competitorUrls.join(', ')}` : ''}
    
    Provide:
    1. Missing subtopics competitors don't cover
    2. Questions left unanswered
    3. Data or statistics that should be included
    4. Unique angles or perspectives
    5. Multimedia opportunities (tables, charts, calculators)
    
    Return as JSON array.`;

    try {
      const response = await this.llm.generate(prompt, {
        temperature: 0.5,
        responseFormat: 'json',
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Error identifying content gaps:', error);
      return [];
    }
  }

  /**
   * Generate keyword cluster for comprehensive coverage
   */
  async generateKeywordCluster(mainTopic) {
    const prompt = `Generate a comprehensive keyword cluster for: "${mainTopic}"
    
    Include:
    1. Primary keyword (main topic)
    2. Secondary keywords (5-8 related terms)
    3. Long-tail keywords (10-15 specific queries)
    4. Question-based keywords (Who, What, When, Where, Why, How)
    5. LSI keywords (semantically related terms)
    
    Return as JSON with categories.`;

    try {
      const response = await this.llm.generate(prompt, {
        temperature: 0.4,
        responseFormat: 'json',
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating keyword cluster:', error);
      return this.getDefaultKeywordCluster(mainTopic);
    }
  }

  /**
   * Suggest internal linking structure
   */
  async suggestInternalLinks(topic, existingPages = []) {
    const prompt = `For content about "${topic}", suggest an internal linking strategy.
    
    Existing pages: ${existingPages.length > 0 ? existingPages.join(', ') : 'None specified'}
    
    Provide:
    1. Anchor text suggestions
    2. Link placement recommendations (intro, body, conclusion)
    3. Related topics that should link TO this content
    4. Topics this content should link TO
    
    Return as JSON.`;

    try {
      const response = await this.llm.generate(prompt, {
        temperature: 0.4,
        responseFormat: 'json',
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Error suggesting internal links:', error);
      return { incoming: [], outgoing: [] };
    }
  }

  /**
   * Optimize for SERP features (Featured Snippets, PAA, etc.)
   */
  async optimizeForSERPFeatures(topic) {
    const depthConfig = config.depthLevels[config.output.depthLevel] || config.depthLevels.expert;
    
    const prompt = `Optimize content for "${topic}" to win SERP features.
    
    Target features:
    - Featured Snippets (paragraph, list, table)
    - People Also Ask (PAA)
    - Knowledge Panel
    - Image Pack
    
    Provide:
    1. Concise definition (40-60 words) for featured snippet
    2. Step-by-step list if applicable
    3. Comparison table structure if relevant
    4. 5-8 PAA questions with brief answers
    5. Key entities for knowledge panel
    
    Return as JSON.`;

    try {
      const response = await this.llm.generate(prompt, {
        temperature: 0.3,
        responseFormat: 'json',
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Error optimizing for SERP features:', error);
      return {};
    }
  }

  /**
   * Get default intent analysis when LLM fails
   */
  getDefaultIntentAnalysis(topic) {
    const lowerTopic = topic.toLowerCase();
    let intentType = 'informational';
    
    for (const [type, patterns] of Object.entries(this.intentPatterns)) {
      if (patterns.some(pattern => lowerTopic.includes(pattern))) {
        intentType = type;
        break;
      }
    }
    
    return {
      primaryIntent: intentType,
      userGoals: [`Learn about ${topic}`, 'Understand key concepts', 'Find actionable information'],
      keyQuestions: [
        `What is ${topic}?`,
        `How does ${topic} work?`,
        `Why is ${topic} important?`,
      ],
      relatedEntities: [topic],
      contentDepth: 'comprehensive',
    };
  }

  /**
   * Get default keyword cluster when LLM fails
   */
  getDefaultKeywordCluster(mainTopic) {
    return {
      primary: mainTopic,
      secondary: [`${mainTopic} guide`, `${mainTopic} benefits`, `${mainTopic} examples`],
      longTail: [
        `how to use ${mainTopic}`,
        `${mainTopic} best practices`,
        `${mainTopic} for beginners`,
        `advanced ${mainTopic} techniques`,
      ],
      questionBased: [
        `What is ${mainTopic}?`,
        `How does ${mainTopic} work?`,
        `Why use ${mainTopic}?`,
        `When to use ${mainTopic}?`,
      ],
      lsi: [`${mainTopic} strategy`, `${mainTopic} optimization`, `${mainTopic} tools`],
    };
  }
}

export default SEOStrategist;
