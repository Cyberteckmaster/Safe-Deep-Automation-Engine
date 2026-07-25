/**
 * Research Analyst Agent
 * Handles fact-checking, source verification, and data synthesis
 */

import axios from 'axios';
import config from '../config/index.js';

export class ResearchAnalyst {
  constructor(llmClient) {
    this.llm = llmClient;
    this.trustedSources = [
      '.gov',
      '.edu',
      'wikipedia.org',
      'scholar.google.com',
      'pubmed.ncbi.nlm.nih.gov',
      'arxiv.org',
    ];
  }

  /**
   * Verify claims against multiple sources
   */
  async verifyClaims(claims, topic) {
    const results = [];
    
    for (const claim of claims) {
      const verification = await this.verifySingleClaim(claim, topic);
      results.push(verification);
    }
    
    return results;
  }

  /**
   * Verify a single claim
   */
  async verifySingleClaim(claim, topic) {
    const prompt = `Verify the following claim related to "${topic}":
    
    Claim: "${claim}"
    
    Assess:
    1. Accuracy (true, partially true, false, unverified)
    2. Confidence level (0-100)
    3. Supporting evidence or counter-evidence
    4. Recommended sources for verification
    5. Context or nuances to consider
    
    Return as JSON.`;

    try {
      const response = await this.llm.generate(prompt, {
        temperature: 0.2,
        responseFormat: 'json',
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Error verifying claim:', error);
      return {
        claim,
        accuracy: 'unverified',
        confidence: 50,
        note: 'Verification failed - manual review recommended',
      };
    }
  }

  /**
   * Find authoritative sources on a topic
   */
  async findAuthoritativeSources(topic) {
    const prompt = `Find authoritative sources for researching: "${topic}"
    
    Provide:
    1. Academic sources (journals, papers)
    2. Government/official sources
    3. Industry reports and publications
    4. Expert organizations and institutions
    5. Recent news sources (if applicable)
    
    Include URLs where possible.
    Return as JSON array with fields: name, url, type, credibilityScore (0-100).`;

    try {
      const response = await this.llm.generate(prompt, {
        temperature: 0.3,
        responseFormat: 'json',
      });
      
      const sources = JSON.parse(response);
      
      // Add credibility assessment based on domain
      return sources.map(source => ({
        ...source,
        isTrustedDomain: this.isTrustedDomain(source.url),
        credibilityScore: this.calculateCredibilityScore(source),
      }));
    } catch (error) {
      console.error('Error finding sources:', error);
      return this.getDefaultSources(topic);
    }
  }

  /**
   * Synthesize information from multiple sources
   */
  async synthesizeInformation(sources, topic) {
    const prompt = `Synthesize information about "${topic}" from the following sources:
    
    ${JSON.stringify(sources, null, 2)}
    
    Create a comprehensive synthesis that:
    1. Identifies key themes and patterns
    2. Highlights consensus and disagreements
    3. Extracts important statistics and data points
    4. Notes gaps in current knowledge
    5. Provides actionable insights
    
    Return as structured JSON.`;

    try {
      const response = await this.llm.generate(prompt, {
        temperature: 0.4,
        responseFormat: 'json',
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Error synthesizing information:', error);
      return { themes: [], insights: [], dataPoints: [] };
    }
  }

  /**
   * Extract relevant statistics and data
   */
  async extractStatistics(topic) {
    const prompt = `Extract key statistics and data points about: "${topic}"
    
    For each statistic, provide:
    1. The statistic itself
    2. Source/origin
    3. Date/timeframe
    4. Sample size or scope (if applicable)
    5. Reliability rating (high, medium, low)
    6. Context for interpretation
    
    Return as JSON array.`;

    try {
      const response = await this.llm.generate(prompt, {
        temperature: 0.3,
        responseFormat: 'json',
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Error extracting statistics:', error);
      return [];
    }
  }

  /**
   * Identify trending topics and recent developments
   */
  async identifyTrends(topic) {
    const prompt = `Identify current trends and recent developments in: "${topic}"
    
    Include:
    1. Emerging trends (last 6-12 months)
    2. Recent breakthroughs or innovations
    3. Changing best practices
    4. New regulations or standards
    5. Market shifts or industry changes
    
    Return as JSON with trend name, description, impact level, and date.`;

    try {
      const response = await this.llm.generate(prompt, {
        temperature: 0.4,
        responseFormat: 'json',
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Error identifying trends:', error);
      return [];
    }
  }

  /**
   * Check if a domain is trusted
   */
  isTrustedDomain(url) {
    if (!url) return false;
    return this.trustedSources.some(domain => url.includes(domain));
  }

  /**
   * Calculate credibility score for a source
   */
  calculateCredibilityScore(source) {
    let score = 50; // Base score
    
    if (this.isTrustedDomain(source.url)) {
      score += 30;
    }
    
    if (source.type === 'academic' || source.type === 'government') {
      score += 15;
    }
    
    if (source.type === 'news') {
      score += 5;
    }
    
    // Cap at 100
    return Math.min(score, 100);
  }

  /**
   * Get default sources when LLM fails
   */
  getDefaultSources(topic) {
    return [
      {
        name: `Wikipedia - ${topic}`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}`,
        type: 'encyclopedia',
        credibilityScore: 60,
        isTrustedDomain: true,
      },
      {
        name: `Google Scholar - ${topic}`,
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`,
        type: 'academic',
        credibilityScore: 85,
        isTrustedDomain: true,
      },
    ];
  }

  /**
   * Generate citations in specified format
   */
  generateCitations(sources, format = 'APA') {
    return sources.map(source => {
      const { name, url, date } = source;
      
      switch (format.toUpperCase()) {
        case 'APA':
          return `${name}. (${date || 'n.d.'}). Retrieved from ${url}`;
        case 'MLA':
          return `"${name}." ${url}. Accessed ${new Date().toLocaleDateString()}.`;
        case 'CHICAGO':
          return `"${name}." ${url}.`;
        default:
          return `${name}. ${url}`;
      }
    });
  }
}

export default ResearchAnalyst;
