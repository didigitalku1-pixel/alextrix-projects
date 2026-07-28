/**
 * Translate LEARN markdown files to Indonesian using z-ai-web-dev-sdk
 * Reads .md files from learn/extracted/, writes translated .md to learn/id/
 */
import ZAI from 'z-ai-web-dev-sdk';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const EXTRACTED_DIR = '/home/z/my-project/download/aura_library/learn/extracted';
const TRANSLATED_DIR = '/home/z/my-project/download/aura_library/learn/id';

const SYSTEM_PROMPT = `You are a professional English-to-Indonesian translator. Translate the following markdown content to Bahasa Indonesia.

STRICT RULES:
- Preserve ALL markdown formatting exactly (#, *, -, \`, [], (), \`\`\`)
- Preserve ALL URLs and links exactly as-is
- Preserve ALL code blocks as-is (do NOT translate code)
- Translate technical terms naturally:
  - "design system" → "sistem desain"
  - "template" → "template" (keep)
  - "prompt" → "prompt" (keep)
  - "landing page" → "landing page" (keep)
  - "component" → "komponen"
  - "deploy" → "deploy" (keep)
  - "dashboard" → "dashboard" (keep)
- Keep the same paragraph structure and line breaks
- Translate naturally, not word-by-word
- Output ONLY the translated markdown, no preamble, no explanation
- If content is empty or just whitespace, output it as-is`;

async function main() {
  console.log('Initializing ZAI...');
  const zai = await ZAI.create();
  
  // Get all .md files in extracted dir
  const mdFiles = readdirSync(EXTRACTED_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${mdFiles.length} markdown files to translate`);
  
  for (const file of mdFiles) {
    const pageName = file.replace('.md', '');
    const inputFile = join(EXTRACTED_DIR, file);
    const outputFile = join(TRANSLATED_DIR, file);
    
    // Skip if already translated
    if (existsSync(outputFile) && existsSync(outputFile.replace('.md', '_raw.json'))) {
      const existingSize = readFileSync(outputFile, 'utf-8').length;
      if (existingSize > 200) {
        console.log(`  [${pageName}] Already translated (${existingSize} chars), skipping`);
        continue;
      }
    }
    
    const text = readFileSync(inputFile, 'utf-8');
    if (text.length < 50) {
      console.log(`  [${pageName}] Source too short (${text.length} chars), skipping`);
      continue;
    }
    
    // Truncate very long content
    const maxChars = 14000;
    const truncated = text.length > maxChars 
      ? text.slice(0, maxChars) + '\n\n[...content truncated for translation...]'
      : text;
    
    console.log(`  [${pageName}] Translating ${truncated.length.toLocaleString()} chars...`);
    
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: truncated },
        ],
        thinking: { type: 'disabled' },
      });
      
      const translated = completion.choices[0]?.message?.content || '';
      console.log(`  [${pageName}] Got response: ${translated.length.toLocaleString()} chars`);
      
      if (translated.length < 50) {
        console.log(`  [${pageName}] WARNING: Response too short, skipping save`);
        continue;
      }
      
      writeFileSync(outputFile, translated, 'utf-8');
      console.log(`  [${pageName}] ✓ Saved to ${outputFile}`);
      
      // Brief delay between requests
      await new Promise(r => setTimeout(r, 2000));
    } catch (e: any) {
      console.error(`  [${pageName}] ERROR: ${e.message}`);
    }
  }
  
  console.log('\n✓ Translation complete!');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
