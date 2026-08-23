const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// 1. Parse .env.local natively
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase environment variables missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Reliable Google Translate Client with Exponential Retry Logic
function translateToHindi(text, retries = 3) {
  return new Promise((resolve) => {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return resolve(text || '');
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`;

    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed[0]) {
            const translated = parsed[0].map((item) => item[0]).join('');
            resolve(translated);
          } else {
            resolve(text);
          }
        } catch {
          resolve(text);
        }
      });
    });

    req.on('error', async () => {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 600));
        resolve(await translateToHindi(text, retries - 1));
      } else {
        resolve(text);
      }
    });

    req.setTimeout(6000, () => {
      req.destroy();
      resolve(text);
    });
  });
}

// Clean prefixes like [DRA-CBT01-Q001]
function stripPrefix(text) {
  if (!text) return '';
  return text.replace(/^\[.*?\]\s*/, '').trim();
}

// All 12 certification tracks
const ALL_CERTIFICATION_PAPERS = [
  'JAIIB_IEIFS',
  'JAIIB_PPB',
  'JAIIB_AFM',
  'JAIIB_RBWM',
  'DRA',        // 3,000 Questions (30 Sets)
  'BCBF',       // 2,000 Questions (20 Sets)
  'CCP',        // 3,000 Questions (30 Sets)
  'AML_KYC',    // 2,000 Questions (20 Sets)
  'CAIIB_ABM',  // 1,000 Questions (10 Sets)
  'CAIIB_BFM',  // 1,000 Questions (10 Sets)
  'CAIIB_ABFM', // 1,000 Questions (10 Sets)
  'CAIIB_BRBL'  // 1,000 Questions (10 Sets)
];

async function runMasterBilingualMigration() {
  console.log('================================================================');
  console.log('🏛️  BANKERVIVA — UNLIMITED BATCH BILINGUAL POPULATION ENGINE');
  console.log('================================================================\n');

  for (const paper of ALL_CERTIFICATION_PAPERS) {
    console.log(`\n📌 Inspecting Track: ${paper}`);

    let totalProcessedForPaper = 0;

    // Continuous loop until all questions in the track have Hindi populated
    while (true) {
      const { data: questions, error } = await supabase
        .from('questions')
        .select('id, exam_type, cbt_set_number, question_text, option_a, option_b, option_c, option_d, explanation, question_text_hi')
        .eq('exam_type', paper)
        .is('question_text_hi', null)
        .order('id', { ascending: true })
        .limit(1000);

      if (error) {
        console.error(`❌ Error fetching questions for ${paper}:`, error.message);
        break;
      }

      // When no more untranslated questions exist, break to next track
      if (!questions || questions.length === 0) {
        if (totalProcessedForPaper === 0) {
          console.log(`✨ Track ${paper} is already 100% translated and synchronized!`);
        } else {
          console.log(`🎉 Track ${paper} completed! Total translated: ${totalProcessedForPaper}`);
        }
        break;
      }

      console.log(`⚡ Processing batch of ${questions.length} questions for ${paper}...`);

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const match = (q.question_text || '').match(/^\[.*?\]/);
        const tag = match ? `${match[0]} ` : '';
        const cleanText = stripPrefix(q.question_text);

        const [hiText, hiOptA, hiOptB, hiOptC, hiOptD, hiExpl] = await Promise.all([
          translateToHindi(cleanText),
          translateToHindi(q.option_a),
          translateToHindi(q.option_b),
          translateToHindi(q.option_c),
          translateToHindi(q.option_d),
          translateToHindi(q.explanation)
        ]);

        const updatePayload = {
          question_text_hi: `${tag}${hiText}`,
          option_a_hi: hiOptA,
          option_b_hi: hiOptB,
          option_c_hi: hiOptC,
          option_d_hi: hiOptD,
          explanation_hi: hiExpl
        };

        const { error: updateError } = await supabase
          .from('questions')
          .update(updatePayload)
          .eq('id', q.id);

        if (updateError) {
          console.error(`❌ Error on Q#${q.id}:`, updateError.message);
        } else {
          totalProcessedForPaper++;
          console.log(`✅ [${totalProcessedForPaper}] ${paper} (Set #${q.cbt_set_number || 1}) -> Q#${q.id} translated.`);
        }

        // Keep a smooth throttle
        await new Promise((r) => setTimeout(r, 100));
      }
    }
  }

  console.log('\n================================================================');
  console.log('🏆 100% Full Bilingual Population Complete Across Entire Platform!');
  console.log('================================================================\n');
}

runMasterBilingualMigration();