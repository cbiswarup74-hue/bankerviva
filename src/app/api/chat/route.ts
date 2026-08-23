import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const cleanMsg = (message || '').toLowerCase();

    // 1. Static query shortcuts (Safe general platform info)
    if (cleanMsg.includes('jaiib') && (cleanMsg.includes('paper') || cleanMsg.includes('subject') || cleanMsg.includes('syllabus') || cleanMsg.includes('studied'))) {
      return NextResponse.json({
        reply: "JAIIB comprises 4 compulsory papers:\n• Paper 1: Indian Economy & Indian Financial System (IEIFS)\n• Paper 2: Principles & Practices of Banking (PPB)\n• Paper 3: Accounting & Financial Management for Bankers (AFM)\n• Paper 4: Retail Banking & Wealth Management (RBWM)\n\nBankerViva offers 10 full-length CBT mock sets (1,000 bilingual questions) for each paper."
      });
    }

    if (cleanMsg.includes('caiib') && (cleanMsg.includes('paper') || cleanMsg.includes('subject') || cleanMsg.includes('syllabus') || cleanMsg.includes('studied'))) {
      return NextResponse.json({
        reply: "CAIIB consists of 4 core papers:\n• Paper 1: Advanced Bank Management (ABM)\n• Paper 2: Bank Financial Management (BFM)\n• Paper 3: Advanced Business & Financial Management (ABFM)\n• Paper 4: Banking Regulations & Business Laws (BRBL)\n\nBankerViva provides 10 full-length mock sets (1,000 questions) for each paper."
      });
    }

    if (cleanMsg.includes('device') || (cleanMsg.includes('how many') && cleanMsg.includes('use'))) {
      return NextResponse.json({
        reply: "You can register and use up to a maximum of 2 personal devices under your single-user license. The platform enforces a Single Active Session rule—if you log in from a second device while active on the first, the previous session will be automatically signed out for your account security."
      });
    }

    if (cleanMsg.includes('bilingual') || cleanMsg.includes('hindi') || cleanMsg.includes('language')) {
      return NextResponse.json({
        reply: "You can switch between English and Hindi at any point during your live CBT exam using the language switcher button located at the top header of your test screen."
      });
    }

    // 2. Strict Proctor & Exam Anti-Cheating System Prompt
    const SYSTEM_KNOWLEDGE = `You are Vani, the proctoring and support assistant for BankerViva (an online IIBF examination platform for JAIIB, CAIIB, DRA, BCBF, CCP, AML/KYC).

STRICT ANTI-CHEATING & PROCTORING RULES:
1. Under NO circumstances provide direct answers, MCQ solutions, options, formulas, numerical calculations, or statutory legal interpretations for questions that appear to be examination questions, practice problems, or test questions.
2. If the user pastes a question, multiple-choice options (A, B, C, D), asks "What is the answer to...", or asks to solve a specific exam calculation/problem, you MUST politely refuse:
   "I cannot provide answers or solutions to exam questions during test practice. Please solve the question independently and submit your CBT session to view complete diagnostic explanations on your scorecard."
3. You are ONLY permitted to answer general platform inquiries, such as:
   - Platform navigation and features (audio viva, bilingual mode, timer, scorecard)
   - Syllabus structure and paper lists
   - Device binding and login rules
4. Always remain polite, concise, and professional.`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: "Vani assistant is active. Please ask any platform navigation or technical support query!"
      });
    }

    // Direct Gemini Target with 3.5 & 1.5 model fallbacks
    const targetModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-1.5-flash'
    ];

    let aiReply = '';

    for (const model of targetModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: `${SYSTEM_KNOWLEDGE}\n\nCandidate Message: ${message}` }
                  ]
                }
              ],
              generationConfig: {
                maxOutputTokens: 350,
                temperature: 0.2
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            aiReply = text;
            break;
          }
        }
      } catch (e) {
        // Fallback to next model
      }
    }

    if (!aiReply) {
      aiReply = "I cannot provide answers or solutions to exam questions during test practice. Please solve the question independently and submit your CBT session to view complete diagnostic explanations on your scorecard.";
    }

    return NextResponse.json({ reply: aiReply });
  } catch (error: any) {
    return NextResponse.json(
      { reply: "I cannot assist with exam questions during a test. Please proceed with your CBT examination." },
      { status: 500 }
    );
  }
}