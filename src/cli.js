#!/usr/bin/env node

/**
 * Command Line Interface for Safe-Deep Automation Engine
 */

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ContentGenerator from './core/generator.js';
import config, { ensureDirectories } from './config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

program
  .name('safe-deep')
  .description('Safe-Deep Automation Engine - Generate authoritative, deep content')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate content for a topic')
  .requiredOption('-t, --topic <string>', 'Topic or keyword to generate content for')
  .option('-d, --depth <string>', 'Content depth level', 'expert')
  .option('-f, --format <string>', 'Output format', 'html')
  .option('-a, --audience <string>', 'Target audience', 'general')
  .option('-o, --output <string>', 'Output directory', './output')
  .option('--no-schema', 'Disable schema markup generation')
  .option('-w, --word-count <number>', 'Target word count')
  .action(async (options) => {
    const spinner = ora('Initializing Safe-Deep Engine...').start();
    
    try {
      // Validate depth option
      const validDepths = ['basic', 'intermediate', 'expert', 'high'];
      if (!validDepths.includes(options.depth)) {
        spinner.fail(`Invalid depth: ${options.depth}. Choose from: ${validDepths.join(', ')}`);
        process.exit(1);
      }

      // Validate format option
      const validFormats = ['html', 'markdown', 'json'];
      if (!validFormats.includes(options.format)) {
        spinner.fail(`Invalid format: ${options.format}. Choose from: ${validFormats.join(', ')}`);
        process.exit(1);
      }

      spinner.info(`Generating content for: "${options.topic}"`);
      
      // Create generator
      const generator = new ContentGenerator();
      
      // Generate content
      const result = await generator.generate({
        topic: options.topic,
        depth: options.depth,
        format: options.format,
        audience: options.audience,
        includeSchema: options.schema !== false,
        targetWordCount: options.wordCount ? parseInt(options.wordCount) : null,
      });

      if (result.success) {
        spinner.succeed('Content generated successfully!');
        
        // Save output
        const outputDir = path.resolve(options.output);
        ensureDirectories();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const safeTopic = options.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
        const extension = options.format === 'html' ? 'html' : options.format === 'markdown' ? 'md' : 'json';
        const filename = `${safeTopic}-${timestamp}.${extension}`;
        const filepath = path.join(outputDir, filename);
        
        // Write file
        fs.writeFileSync(filepath, result.output);
        
        console.log(chalk.green('\n📄 Output saved to:'), chalk.cyan(filepath));
        console.log(chalk.green('📊 Word count:'), chalk.cyan(result.metadata.wordCount));
        console.log(chalk.green('📑 Sections:'), chalk.cyan(result.metadata.sections));
        
      } else {
        spinner.fail('Generation failed');
        console.error(chalk.red('Error:'), result.error);
        process.exit(1);
      }
    } catch (error) {
      spinner.fail('Unexpected error occurred');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('batch')
  .description('Generate content for multiple topics')
  .requiredOption('-i, --input <string>', 'Input file with topics (one per line)')
  .option('-d, --depth <string>', 'Content depth level', 'expert')
  .option('-f, --format <string>', 'Output format', 'html')
  .option('-o, --output <string>', 'Output directory', './output')
  .action(async (options) => {
    const spinner = ora('Processing batch...').start();
    
    try {
      // Read topics from file
      const inputFile = path.resolve(options.input);
      if (!fs.existsSync(inputFile)) {
        spinner.fail(`Input file not found: ${inputFile}`);
        process.exit(1);
      }
      
      const topics = fs.readFileSync(inputFile, 'utf-8')
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      if (topics.length === 0) {
        spinner.fail('No topics found in input file');
        process.exit(1);
      }
      
      spinner.info(`Found ${topics.length} topics`);
      
      const generator = new ContentGenerator();
      const results = await generator.batchGenerate(topics, {
        depth: options.depth,
        format: options.format,
      });
      
      spinner.succeed(`Batch complete: ${results.successful}/${results.total} successful`);
      
      if (results.failed > 0) {
        console.warn(chalk.yellow(`\n⚠️  ${results.failed} generation(s) failed`));
      }
      
    } catch (error) {
      spinner.fail('Batch processing failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('health')
  .description('Run health checks on the engine')
  .action(async () => {
    const spinner = ora('Running health checks...').start();
    
    try {
      const generator = new ContentGenerator();
      const health = await generator.healthCheck();
      
      if (health.status === 'healthy') {
        spinner.succeed('All systems operational');
      } else {
        spinner.warn('Some checks failed');
      }
      
      console.log('\nHealth Check Results:');
      Object.entries(health.checks).forEach(([name, check]) => {
        const icon = check.success ? '✅' : '❌';
        console.log(`  ${icon} ${name}: ${check.message || 'OK'}`);
      });
      
    } catch (error) {
      spinner.fail('Health check failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('setup')
  .description('Initialize the engine and create necessary files')
  .action(() => {
    const spinner = ora('Setting up Safe-Deep Engine...').start();
    
    try {
      ensureDirectories();
      
      // Create .env if it doesn't exist
      const envPath = path.join(process.cwd(), '.env');
      if (!fs.existsSync(envPath)) {
        const exampleEnv = path.join(__dirname, '..', '.env.example');
        if (fs.existsSync(exampleEnv)) {
          fs.copyFileSync(exampleEnv, envPath);
          spinner.info('Created .env file from template');
        }
      }
      
      spinner.succeed('Setup complete!');
      console.log(chalk.green('\nNext steps:'));
      console.log('  1. Edit .env and add your LLM API key');
      console.log('  2. Run: npm run health');
      console.log('  3. Run: npm run generate -t "Your Topic"');
      
    } catch (error) {
      spinner.fail('Setup failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Parse and execute
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
