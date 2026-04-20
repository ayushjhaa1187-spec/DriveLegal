// Phase 13.1 — Supabase Auth with Mobile OTP
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function sendOTP(phone: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    phone: `+91${phone}`,
  });
  return { error: error?.message ?? null };
}

export async function verifyOTP(
  phone: string,
  token: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.verifyOtp({
    phone: `+91${phone}`,
    token,
    type: 'sms',
  });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
