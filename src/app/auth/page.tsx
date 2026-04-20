// Phase 13.1 – Auth Page with OTP Flow
'use client';
import { useState } from 'react';
import { sendOTP, verifyOTP } from '@/lib/auth/otp';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await sendOTP(phone);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setStep('otp');
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await verifyOTP(phone, token);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">DriveLegal</h1>
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Mobile Number
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-sm text-gray-600">OTP sent to +91{phone}</p>
            <label className="block text-sm font-medium text-gray-700">
              Enter OTP
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="6-digit OTP"
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-sm text-gray-500 underline"
            >
              Change number
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
