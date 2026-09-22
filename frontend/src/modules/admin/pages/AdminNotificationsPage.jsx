import React, { useState } from 'react';
import { Bell, Send, Users, Store, Globe, CheckCircle2 } from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminNotificationsPage = () => {
  const { notifications, sendBroadcastNotification } = useAdmin();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all'); // 'all' | 'customers' | 'salons'

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    await sendBroadcastNotification({ title, message, audience });
    setTitle('');
    setMessage('');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Push Broadcasts & System Announcements"
        subtitle="Dispatch platform alerts, seasonal announcements and emergency updates"
      />

      <div className="p-8 space-y-8 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dispatch Form */}
          <div className="lg:col-span-1 bg-[#14141e] border border-[#262638] rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-400" />
              Dispatch Broadcast
            </h2>

            <form onSubmit={handleSend} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-medium">Target Audience</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'Everyone', icon: Globe },
                    { id: 'customer', label: 'Customers', icon: Users },
                    { id: 'salon', label: 'Partners', icon: Store }
                  ].map((aud) => {
                    const Icon = aud.icon;
                    return (
                      <button
                        key={aud.id}
                        type="button"
                        onClick={() => setAudience(aud.id)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                          audience === aud.id
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                            : 'bg-[#1a1a26] border-[#2c2c3e] text-stone-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-semibold">{aud.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Notification Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Festival Weekend 20% Cashback"
                  className="w-full bg-[#0d0d14] border border-[#2c2c40] rounded-xl px-3 py-2 text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Notification Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Book any salon appointment this Saturday & Sunday to unlock exclusive cashback tokens."
                  className="w-full bg-[#0d0d14] border border-[#2c2c40] rounded-xl p-3 text-white focus:border-purple-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Broadcast Instantly</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Broadcast History */}
          <div className="lg:col-span-2 bg-[#14141e] border border-[#262638] rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-pink-400" />
              Recent Platform Broadcasts ({notifications.length})
            </h2>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 rounded-xl bg-[#1b1b26] border border-[#262638] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-white text-xs">{n.title}</div>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-stone-800 text-stone-400">
                        {n.audience || 'Broadcast'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1">{n.message}</p>
                    <div className="text-[10px] text-stone-500 mt-2">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : n.time || 'Recent'}
                    </div>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-16 text-xs text-stone-500">
                  No previous broadcast messages recorded in session.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
