import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type Notification = {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  type: 'info' | 'warning' | 'success' | 'deadline';
};

function NotificationIcon({ type }: { type: Notification['type'] }) {
  const map = {
    info: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'i' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: '!' },
    success: { bg: 'bg-green-100', text: 'text-green-600', icon: '✓' },
    deadline: { bg: 'bg-red-100', text: 'text-red-600', icon: '⏰' },
  };
  const s = map[type] ?? map.info;
  return (
    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${s.bg} ${s.text}`}>
      {s.icon}
    </span>
  );
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/auth');

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const items = (notifications as Notification[]) ?? [];
  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-4">🔔</p>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <div
                key={n.id}
                className={`bg-white rounded-2xl shadow-sm p-4 flex items-start gap-3 ${
                  !n.is_read ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <NotificationIcon type={n.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{n.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{n.body}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(n.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
