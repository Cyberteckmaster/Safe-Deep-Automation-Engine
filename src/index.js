/**
 * Main entry point for Safe-Deep Automation Engine
 */

import ContentGenerator from './core/generator.js';
import config, { ensureDirectories, validateConfig } from './config/index.js';

// Ensure output directories exist
ensureDirectories();

// Validate configuration
validateConfig();

// Create generator instance
const generator = new ContentGenerator();

// Export for programmatic use
export { generator, ContentGenerator };
export default generator;

// If run directly, show help
if (process.argv[1]?.includes('index.js')) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║     Safe-Deep Automation Engine™                          ║
║     The Future of AI Content is Deep, Not Wide.           ║
╚═══════════════════════════════════════════════════════════╝

📖 Usage:
  npm run generate -- --topic "Your Topic" [options]

🔧 Options:
  --topic, -t      Topic or keyword to generate content for (required)
  --depth, -d      Content depth: basic, intermediate, expert, high (default: expert)
  --format, -f     Output format: html, markdown, json (default: html)
  --audience, -a   Target audience (default: general)
  --output, -o     Output directory (default: ./output)

📋 Examples:
  npm run generate -- -t "Artificial Intelligence"
  npm run generate -- -t "SEO Best Practices" -d high -f markdown
  npm run generate -- -t "Climate Change" -a "students" -f json

🛠️  Other Commands:
  npm run setup    Initialize the engine and validate configuration
  npm test         Run health checks

📚 Documentation: See README.md for full documentation
`);
}
