/**
 * Improve LEARN pages - rewrite to natural Indonesian (bukan terjemahan mentah)
 * Read existing English markdown, rewrite to natural Indonesian
 */
import ZAI from 'z-ai-web-dev-sdk';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const EXTRACTED_DIR = '/home/z/my-project/download/aura_library/learn/extracted';
const TRANSLATED_DIR = '/home/z/my-project/download/aura_library/learn/id';

const SYSTEM_PROMPT = `Anda adalah penulis teknis profesional berbahasa Indonesia. Tugas Anda adalah menulis ulang konten bahasa Inggris ke Bahasa Indonesia yang natural, mengalir, dan mudah dipahami.

ATURAN PENULISAN:
1. Tulis Bahasa Indonesia yang natural dan mengalir - BUKAN terjemahan kata demi kata
2. Gunakan kalimat yang pendek dan jelas (maksimal 20 kata per kalimat)
3. Tetap pertahankan semua format markdown (#, *, -, \`, [], (), \`\`\`)
4. Jangan terjemahkan: URL, kode program, nama produk (Aura, Tailwind, React), istilah teknis umum (template, prompt, dashboard, deploy, landing page)
5. Ubah istilah teknis yang punya padanan Indonesia yang natural:
   - "design system" → "sistem desain"
   - "component" → "komponen"
   - "responsive" → "responsif"
   - "animation" → "animasi"
   - "navigation" → "navigasi"
   - "feature" → "fitur"
   - "create" → "membuat" / "buat"
   - "generate" → "hasilkan" / "buat"
   - "customize" → "sesuaikan" / "kustomisasi"
   - "export" → "ekspor"
   - "import" → "impor"
6. Gunakan sapaan "Anda" (formal tapi ramah)
7. Hindari kata-kata kaku seperti "berikut ini adalah" - gunakan yang lebih natural
8. Pertahankan struktur paragraf yang sama
9. Jika ada contoh kode, biarkan apa adanya
10. Buat kalimat pembuka yang menarik untuk setiap bagian

Output HANYA markdown hasil tulisan ulang, tanpa preamble atau penjelasan tambahan.`;

async function main() {
  console.log('Initializing ZAI...');
  const zai = await ZAI.create();
  
  const mdFiles = readdirSync(EXTRACTED_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${mdFiles.length} markdown files to improve\n`);
  
  for (const file of mdFiles) {
    const pageName = file.replace('.md', '');
    const inputFile = join(EXTRACTED_DIR, file);
    const outputFile = join(TRANSLATED_DIR, file);
    
    // Check if already improved (file > 1KB)
    if (existsSync(outputFile)) {
      const existingSize = readFileSync(outputFile, 'utf-8').length;
      if (existingSize > 1000) {
        console.log(`  [${pageName}] Already improved (${existingSize} chars), skipping`);
        continue;
      }
    }
    
    const text = readFileSync(inputFile, 'utf-8');
    if (text.length < 50) {
      console.log(`  [${pageName}] Source too short, skipping`);
      continue;
    }
    
    // Truncate to ~12K chars
    const maxChars = 12000;
    const truncated = text.length > maxChars 
      ? text.slice(0, maxChars) + '\n\n[...konten dipotong untuk ditulis ulang...]'
      : text;
    
    console.log(`  [${pageName}] Rewriting to natural Indonesian (${truncated.length.toLocaleString()} chars)...`);
    
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: truncated },
        ],
        thinking: { type: 'disabled' },
      });
      
      const improved = completion.choices[0]?.message?.content || '';
      console.log(`  [${pageName}] Got response: ${improved.length.toLocaleString()} chars`);
      
      if (improved.length < 100) {
        console.log(`  [${pageName}] WARNING: Response too short, skipping`);
        continue;
      }
      
      writeFileSync(outputFile, improved, 'utf-8');
      console.log(`  [${pageName}] ✓ Saved natural Indonesian version`);
      
      await new Promise(r => setTimeout(r, 2000));
    } catch (e: any) {
      console.error(`  [${pageName}] ERROR: ${e.message}`);
    }
  }
  
  console.log('\n✓ LEARN improvement complete!');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
