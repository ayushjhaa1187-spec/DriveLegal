// Phase 14 – Dashboard Page
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth');
  }

  const phone = session.user.phone ?? 'Unknown';

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">DriveLegal Dashboard</h1>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-red-500 underline hover:text-red-700"
          >
            Sign Out
          </button>
        </form>
      </header>

      <p className="text-gray-600 mb-8">Welcome, +91{phone}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/dashboard/cases/new"
          className="block bg-white rounded-2xl shadow p-6 hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-blue-600 mb-2">File a Case</h2>
          <p className="text-sm text-gray-500">Start a new legal case and track its progress.</p>
        </Link>

        <Link
          href="/dashboard/cases"
          className="block bg-white rounded-2xl shadow p-6 hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-blue-600 mb-2">My Cases</h2>
          <p className="text-sm text-gray-500">View and manage all your filed cases.</p>
        </Link>

        <Link
          href="/dashboard/assistant"
          className="block bg-white rounded-2xl shadow p-6 hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-blue-600 mb-2">AI Legal Assistant</h2>
          <p className="text-sm text-gray-500">Get instant AI-powered legal guidance.</p>
        </Link>

        <Link
          href="/dashboard/documents"
          className="block bg-white rounded-2xl shadow p-6 hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-blue-600 mb-2">Documents</h2>
          <p className="text-sm text-gray-500">Generate and download legal documents.</p>
        </Link>

        <Link
          href="/dashboard/timeline"
          className="block bg-white rounded-2xl shadow p-6 hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-blue-600 mb-2">Case Timeline</h2>
          <p className="text-sm text-gray-500">Track key milestones and deadlines.</p>
        </Link>

        <Link
          href="/dashboard/notifications"
          className="block bg-white rounded-2xl shadow p-6 hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-blue-600 mb-2">Notifications</h2>
          <p className="text-sm text-gray-500">Stay updated with case alerts and reminders.</p>
        </Link>
      </div>
    </main>
  );
}
