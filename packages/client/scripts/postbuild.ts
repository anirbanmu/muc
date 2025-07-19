import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { load } from 'cheerio';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Polyfill for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, '../dist/index.html');
const outputPath = join(__dirname, '../dist/views/index.ejs');
const outputDir = dirname(outputPath);

console.log(`Starting post-build HTML transformation for client...`);
console.log(`Input: ${inputPath}`);
console.log(`Output: ${outputPath}`);

async function transformHtml() {
  try {
    // Read the HTML file
    const htmlContent = await readFile(inputPath, 'utf8');

    // Load HTML into cheerio
    const $ = load(htmlContent);

    // Find the div with id="app" and add the data attribute
    $('#app').attr('data-api-tokens', '<%= API_TOKENS_JSON %>');

    // Get the modified HTML
    const modifiedHtml = $.html();

    // Ensure the output directory exists
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    // Write the modified content to the EJS file
    await writeFile(outputPath, modifiedHtml, 'utf8');

    console.log('HTML transformation complete: index.html -> index.ejs');
  } catch (error) {
    console.error('Error during HTML transformation:', error);
    process.exit(1);
  }
}

transformHtml();
