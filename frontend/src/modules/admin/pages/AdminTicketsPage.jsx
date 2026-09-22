import React, { useState } from 'react';
import { LifeBuoy, Send, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminTicketsPage = () => {
  const { tickets, updateTicketStatus, replyTicket } = useAdmin();

  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);
  const [replyText, setReplyText] = useState('');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    replyTicket(selectedTicket.id, replyText.trim());
    setReplyText('');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Help & Support Desk"
        subtitle="Customer disputes, partner queries, and incident resolution tickets"
      />

      <div className="flex-1 flex overflow-hidden p-8 gap-6">
        {/* Tickets Left List */}
        <div className="w-80 bg-[#14141e] border border-[#262638] rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#232333] font-bold text-xs uppercase tracking-wider text-stone-400">
            Open & Pending Tickets ({tickets.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1e1e2c]">
            {tickets.map((t) => {
              const isSelected = t.id === (selectedTicket?.id || selectedTicketId);
              const isOpen = t.status === 'Open';

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full text-left p-4 transition-colors cursor-pointer block ${
                    isSelected ? 'bg-[#1e1e2e] border-l-2 border-purple-500' : 'hover:bg-[#181824]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] text-purple-400 font-bold">{t.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isOpen
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{t.subject || 'Support Query'}</div>
                  <div className="text-[11px] text-stone-400 truncate mt-0.5">
                    User: {t.userName || t.userId || 'Customer'}
                  </div>
                </button>
              );
            })}

            {tickets.length === 0 && (
              <div className="p-8 text-center text-xs text-stone-500">
                No tickets currently logged in the helpdesk.
              </div>
            )}
          </div>
        </div>

        {/* Selected Ticket Thread */}
        <div className="flex-1 bg-[#14141e] border border-[#262638] rounded-2xl flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-5 border-b border-[#232333] flex justify-between items-center bg-[#111119]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{selectedTicket.subject || 'Support Query'}</h2>
                    <span className="font-mono text-xs text-purple-400">({selectedTicket.id})</span>
                  </div>
                  <div className="text-xs text-stone-400 mt-1">
                    From: <span className="text-stone-200">{selectedTicket.userName || selectedTicket.userId}</span> •
                    Logged: {new Date(selectedTicket.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTicket.status === 'Open' ? (
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'Resolved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'Open')}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                    >
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Messages conversation */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Initial query / body */}
                {selectedTicket.body && (
                  <div className="p-4 rounded-xl bg-[#1a1a26] border border-[#272738] max-w-xl">
                    <div className="text-[11px] font-semibold text-stone-400 mb-1">
                      {selectedTicket.userName || 'Customer'}
                    </div>
                    <p className="text-xs text-stone-200">{selectedTicket.body}</p>
                  </div>
                )}

                {/* Message replies */}
                {selectedTicket.messages?.map((m, idx) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="text-[10px] text-stone-500">
                        {isAdmin ? 'InstaaTrim Staff' : selectedTicket.userName || 'Customer'} •{' '}
                        {m.sentAt ? new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                      <div
                        className={`p-3.5 rounded-xl max-w-lg text-xs ${
                          isAdmin
                            ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                            : 'bg-[#1b1b28] text-stone-200 border border-[#2b2b3e] rounded-bl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-[#232333] bg-[#101018] flex gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type an official admin reply or resolution instruction..."
                  className="flex-1 bg-[#181824] border border-[#2d2d42] rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Reply</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-stone-500 text-xs">
              Select a ticket on the left to inspect conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
