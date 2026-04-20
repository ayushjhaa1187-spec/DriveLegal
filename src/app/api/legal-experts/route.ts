import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stateCode = searchParams.get('stateCode');

  const supabase = await createClient();
  let query = supabase.from('legal_experts').select('*');

  if (stateCode) {
    query = query.eq('state_code', stateCode);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
