import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Soft rate limit memory store
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let limitRecord = rateLimitMap.get(ip);

  // Reset at midnight or 24 hrs
  if (!limitRecord || limitRecord.resetAt < now) {
    limitRecord = { count: 0, resetAt: now + 24 * 60 * 60 * 1000 };
    rateLimitMap.set(ip, limitRecord);
  }

  if (limitRecord.count >= 10) {
    return false;
  }

  limitRecord.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Rate Limiting (Soft limit for anonymous, 10/day/IP)
    if (!user) {
      const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
      if (!checkRateLimit(ip)) {
         return NextResponse.json(
            { error: 'Daily limit reached. Sign up for unlimited simulator sessions.' }, 
            { status: 429 }
         );
      }
    }

    const body = await request.json();
    const { messages, tierPrompt } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Missing or invalid messages' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI Services not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build the gemini parts format
    const contents = messages.map(msg => ({
       role: msg.role === 'user' ? 'user' : 'model',
       parts: [{ text: msg.text }]
    }));

    // Prepend system prompt to the first user message or handle via systemInstruction
    const chat = model.startChat({
       history: contents.slice(0, -1),
       systemInstruction: { role: 'system', parts: [{ text: tierPrompt }] },
       generationConfig: {
          temperature: 0.7,
       }
    });

    const lastMessage = contents[contents.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error("Simulation API Error:", error);
    return NextResponse.json({ error: error.message || 'Simulation failed' }, { status: 500 });
  }
}
