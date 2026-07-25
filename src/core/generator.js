/**
 * Content Generator Orchestrator
 * Coordinates all agents to produce high-quality, deep content
 */

import config from '../config/index.js';
import LLMClient from './llm-client.js';
import SEOStrategist from '../agents/seo-strategist.js';
import ResearchAnalyst from '../agents/research-analyst.js';
import FullStackDeveloper from '../agents/fullstack-developer.js';

export class ContentGenerator {
  constructor() {
    this.llm = new LLMClient();
    this.seo = new SEOStrategist(this.llm);
    this.research = new ResearchAnalyst(this.llm);
    this.developer = new FullStackDeveloper(this.llm);
  }

  /**
   * Main generation method - orchestrates the entire workflow
   */
  async generate(options) {
    const {
      topic,
      depth = 'expert',
      format = 'html',
      audience = 'general',
      includeSchema = true,
      targetWordCount = null,
    } = options;

    console.log(`\n🚀 Starting Safe-Deep Generation for: "${topic}"`);
    console.log(`   Depth: ${depth} | Format: ${format} | Audience: ${audience}\n`);

    try {
      // Step 1: Analyze search intent
      console.log('📊 Step 1/7: Analyzing search intent...');
      const intentAnalysis = await this.seo.analyzeIntent(topic);

      // Step 2: Generate keyword cluster
      console.log('🔍 Step 2/7: Generating keyword cluster...');
      const keywordCluster = await this.seo.generateKeywordCluster(topic);

      // Step 3: Identify content gaps
      console.log('🎯 Step 3/7: Identifying content gaps...');
      const contentGaps = await this.seo.identifyContentGaps(topic);

      // Step 4: Research and fact-checking
      console.log('📚 Step 4/7: Conducting research...');
      const sources = await this.research.findAuthoritativeSources(topic);
      const statistics = await this.research.extractStatistics(topic);
      const trends = await this.research.identifyTrends(topic);

      // Step 5: Optimize for SERP features
      console.log('⭐ Step 5/7: Optimizing for SERP features...');
      const serpOptimization = await this.seo.optimizeForSERPFeatures(topic);

      // Step 6: Generate comprehensive content
      console.log('✍️  Step 6/7: Generating deep content...');
      const content = await this.generateContent({
        topic,
        intentAnalysis,
        keywordCluster,
        contentGaps,
        sources,
        statistics,
        trends,
        serpOptimization,
        audience,
        depth,
        targetWordCount,
      });

      // Step 7: Format and enhance output
      console.log('🎨 Step 7/7: Formatting and enhancing output...');
      let output;

      if (format === 'html') {
        output = await this.formatAsHTML(content, {
          title: topic,
          includeSchema,
          serpOptimization,
        });
      } else if (format === 'markdown') {
        output = content.markdown;
      } else if (format === 'json') {
        output = {
          metadata: {
            topic,
            generatedAt: new Date().toISOString(),
            depth,
            audience,
          },
          content: content,
          seo: {
            intentAnalysis,
            keywordCluster,
            serpOptimization,
          },
          research: {
            sources,
            statistics,
            trends,
          },
        };
      }

      console.log('\n✅ Generation complete!\n');
      
      return {
        success: true,
        output,
        metadata: {
          topic,
          wordCount: content.wordCount,
          sections: content.sections?.length || 0,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('\n❌ Generation failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate comprehensive content using all research data
   */
  async generateContent(params) {
    const {
      topic,
      intentAnalysis,
      keywordCluster,
      contentGaps,
      sources,
      statistics,
      trends,
      serpOptimization,
      audience,
      depth,
      targetWordCount,
    } = params;

    const depthConfig = config.depthLevels[depth] || config.depthLevels.expert;
    const wordCount = targetWordCount || depthConfig.wordCount;

    const prompt = `Create a comprehensive, authoritative article about: "${topic}"

AUDIENCE: ${audience}
TARGET WORD COUNT: ~${wordCount} words
DEPTH LEVEL: ${depth}

SEARCH INTENT ANALYSIS:
${JSON.stringify(intentAnalysis, null, 2)}

KEYWORD CLUSTER TO INCORPORATE:
${JSON.stringify(keywordCluster, null, 2)}

CONTENT GAPS TO ADDRESS:
${JSON.stringify(contentGaps, null, 2)}

AUTHORITATIVE SOURCES:
${JSON.stringify(sources.slice(0, 5), null, 2)}

KEY STATISTICS TO INCLUDE:
${JSON.stringify(statistics.slice(0, 10), null, 2)}

CURRENT TRENDS:
${JSON.stringify(trends.slice(0, 5), null, 2)}

SERP OPTIMIZATION DATA:
${JSON.stringify(serpOptimization, null, 2)}

REQUIREMENTS:
1. Start with a compelling introduction that includes a direct answer (40-60 words) for featured snippets
2. Use question-based H2 and H3 headings where appropriate
3. Include at least one table comparing key concepts
4. Add bullet points and numbered lists for scannability
5. Incorporate statistics naturally with proper context
6. Address all identified content gaps
7. Include a FAQ section with 5-8 questions
8. End with actionable conclusions or next steps
9. Maintain an authoritative yet accessible tone
10. Avoid fluff and ensure every paragraph adds value

Return the content in Markdown format with clear heading hierarchy.`;

    try {
      const markdownContent = await this.llm.generate(prompt, {
        temperature: 0.7,
        maxTokens: 4096,
      });

      // Generate FAQ for schema
      const faqPrompt = `Based on the topic "${topic}", generate 5-8 frequently asked questions with concise answers.
      
      Return as JSON array with objects containing "question" and "answer" fields.`;

      const faqResponse = await this.llm.generate(faqPrompt, {
        temperature: 0.3,
        responseFormat: 'json',
      });

      let faqs = [];
      try {
        faqs = JSON.parse(faqResponse);
      } catch (e) {
        console.warn('Could not parse FAQs, using empty array');
      }

      // Count words
      const wordCount = markdownContent.split(/\s+/).length;

      // Extract sections
      const sections = markdownContent.split(/^## /m).filter(s => s.trim());

      return {
        markdown: markdownContent,
        wordCount,
        sections,
        faqs,
        html: null, // Will be generated separately
      };
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  /**
   * Format content as HTML with schema markup
   */
  async formatAsHTML(content, options) {
    const { title, includeSchema, serpOptimization } = options;

    // Generate semantic HTML
    let html = await this.developer.generateSemanticHTML(content.markdown, {
      title,
      metaDescription: content.markdown.substring(0, 160),
      includeNav: true,
      includeAside: true,
    });

    // Add schema markup if requested
    if (includeSchema) {
      const schema = this.developer.generateSchema({
        type: 'Article',
        title,
        description: content.markdown.substring(0, 160),
        keywords: Object.values(content.keywordCluster?.secondary || []).flat(),
        faqs: content.faqs,
      });

      html = this.developer.injectSchema(html, schema);
    }

    // Add accessibility features
    html = this.developer.addAccessibilityFeatures(html);

    // Optimize for performance
    html = this.developer.optimizeForPerformance(html);

    return html;
  }

  /**
   * Batch generate multiple pieces of content
   */
  async batchGenerate(topics, options = {}) {
    const results = [];
    
    console.log(`\n📦 Starting batch generation for ${topics.length} topics...\n`);
    
    for (let i = 0; i < topics.length; i++) {
      console.log(`\n[${i + 1}/${topics.length}] Processing: ${topics[i]}`);
      
      const result = await this.generate({
        topic: topics[i],
        ...options,
      });
      
      results.push(result);
      
      // Rate limiting - wait between requests
      if (i < topics.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return {
      total: topics.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  /**
   * Test all systems are operational
   */
  async healthCheck() {
    console.log('🔍 Running health check...\n');
    
    const checks = {
      llm: await this.llm.testConnection(),
      config: {
        success: !!config.llm.apiKey && config.llm.apiKey !== 'your_api_key_here',
        message: config.llm.apiKey ? 'API key configured' : 'API key missing',
      },
    };
    
    const allPassed = Object.values(checks).every(c => c.success);
    
    console.log(allPassed ? '✅ All systems operational' : '⚠️  Some checks failed');
    
    return {
      status: allPassed ? 'healthy' : 'degraded',
      checks,
    };
  }
}

export default ContentGenerator;
