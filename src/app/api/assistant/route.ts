import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are DriveLegal AI, an expert Indian legal assistant specializing in motor vehicle laws, traffic regulations, and road accident cases in India. You help users understand:
- Motor Vehicles Act 1988 and its amendments
- Traffic challans and how to contest them
- Accident compensation under MACT (Motor Accident Claims Tribunal)
- Insurance claims after accidents
- FIR filing procedures
- Hit and run provisions
- Driving licence matters

Always cite specific sections of Indian law when relevant. Provide practical, actionable advice. Remind users that your advice is informational and they should consult a qualified lawyer for representation.`;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { messages } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: `AI error: ${err}` }, { status: 500 });
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content ?? '';

  // Save conversation to Supabase
  await supabase.from('assistant_logs').insert({
    user_id: session.user.id,
    messages: JSON.stringify(messages),
    reply,
  });

  return NextResponse.json({ reply });
}
