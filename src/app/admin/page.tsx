import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const ADMIN_PHONE = process.env.ADMIN_PHONE ?? '';

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/auth');

  // Only allow admin
  const userPhone = session.user.phone ?? '';
  if (ADMIN_PHONE && userPhone !== ADMIN_PHONE) {
    redirect('/dashboard');
  }

  // Fetch stats
  const [{ count: totalUsers }, { count: totalCases }, { count: openCases }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('cases').select('*', { count: 'exact', head: true }),
    supabase.from('cases').select('*', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  const { data: recentCases } = await supabase
    .from('cases')
    .select('id, title, case_type, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Users" value={totalUsers ?? 0} color="blue" />
        <StatCard label="Total Cases" value={totalCases ?? 0} color="green" />
        <StatCard label="Open Cases" value={openCases ?? 0} color="orange" />
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Cases</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentCases ?? []).map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-800">{c.title}</td>
                  <td className="py-2 pr-4 text-gray-600">{c.case_type}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500">
                    {new Date(c.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
  };
  return (
    <div className={`rounded-2xl p-6 ${colors[color] ?? colors.blue}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 font-medium">{label}</p>
    </div>
  );
}
