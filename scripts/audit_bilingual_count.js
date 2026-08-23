const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local natively
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

const TRACKS = [
  { key: 'JAIIB_IEIFS', name: 'JAIIB: Paper 1 (IEIFS)' },
  { key: 'JAIIB_PPB',   name: 'JAIIB: Paper 2 (PPB)' },
  { key: 'JAIIB_AFM',   name: 'JAIIB: Paper 3 (AFM)' },
  { key: 'JAIIB_RBWM',  name: 'JAIIB: Paper 4 (RBWM)' },
  { key: 'DRA',         name: 'Debt Recovery Agent (DRA)' },
  { key: 'BCBF',        name: 'Business Correspondent (BCBF)' },
  { key: 'CCP',         name: 'Certified Credit Professional (CCP)' },
  { key: 'AML_KYC',     name: 'AML / KYC Compliance' },
  { key: 'CAIIB_ABM',   name: 'CAIIB: Paper 1 (ABM)' },
  { key: 'CAIIB_BFM',   name: 'CAIIB: Paper 2 (BFM)' },
  { key: 'CAIIB_ABFM',  name: 'CAIIB: Paper 3 (ABFM)' },
  { key: 'CAIIB_BRBL',  name: 'CAIIB: Paper 4 (BRBL)' },
];

async function runBilingualAudit() {
  console.log('========================================================================');
  console.log('📊 BANKERVIVA — BILINGUAL DATABASE AUDIT REPORT');
  console.log('========================================================================\n');

  let grandTotalQuestions = 0;
  let grandTotalTranslated = 0;

  console.log('| Paper / Certification Track            | Total Qs | Hindi Ready | Status      |');
  console.log('|----------------------------------------|----------|-------------|-------------|');

  for (const track of TRACKS) {
    // 1. Fetch total count for this track
    const { count: totalCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('exam_type', track.key);

    // 2. Fetch translated count for this track
    const { count: translatedCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('exam_type', track.key)
      .not('question_text_hi', 'is', null);

    const total = totalCount || 0;
    const translated = translatedCount || 0;
    const isDone = total > 0 && total === translated;
    const status = isDone ? '✅ Complete' : total === 0 ? '⚠️ No Data' : `⏳ ${Math.round((translated / total) * 100)}%`;

    grandTotalQuestions += total;
    grandTotalTranslated += translated;

    const paddedName = track.name.padEnd(38, ' ');
    const paddedTotal = String(total).padStart(8, ' ');
    const paddedTrans = String(translated).padStart(11, ' ');
    const paddedStatus = status.padEnd(11, ' ');

    console.log(`| ${paddedName} | ${paddedTotal} | ${paddedTrans} | ${paddedStatus} |`);
  }

  console.log('|----------------------------------------|----------|-------------|-------------|');
  const summaryTotal = String(grandTotalQuestions).padStart(8, ' ');
  const summaryTrans = String(grandTotalTranslated).padStart(11, ' ');
  const grandPct = grandTotalQuestions > 0 ? Math.round((grandTotalTranslated / grandTotalQuestions) * 100) : 0;
  console.log(`| GRAND TOTAL                            | ${summaryTotal} | ${summaryTrans} | ${grandPct}% Overall |`);
  console.log('========================================================================\n');
}

runBilingualAudit();