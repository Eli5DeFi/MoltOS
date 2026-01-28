import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '@/store';
import {
  Inbox,
  Send,
  Star,
  Trash2,
  Search,
  RefreshCw,
  Mail,
  MoreHorizontal,
  Paperclip,
  Reply,
  Forward,
  Archive
} from 'lucide-react';
import { format } from 'date-fns';

type Folder = 'inbox' | 'sent' | 'starred' | 'trash';

export function MailApp() {
  const { emails, toggleEmailRead, toggleEmailStar } = useDesktopStore();
  const [selectedFolder, setSelectedFolder] = useState<Folder>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(search.toLowerCase()) ||
                         email.from.toLowerCase().includes(search.toLowerCase());
    if (selectedFolder === 'starred') return email.starred && matchesSearch;
    return matchesSearch;
  });

  const selectedEmailData = emails.find(e => e.id === selectedEmail);

  const folders: { id: Folder; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox className="w-4 h-4" />, count: emails.filter(e => !e.read).length },
    { id: 'sent', label: 'Sent', icon: <Send className="w-4 h-4" />, count: 0 },
    { id: 'starred', label: 'Starred', icon: <Star className="w-4 h-4" />, count: emails.filter(e => e.starred).length },
    { id: 'trash', label: 'Trash', icon: <Trash2 className="w-4 h-4" />, count: 0 },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-52 border-r border-white/10 p-3 bg-black/20">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors mb-4">
          <Mail className="w-4 h-4" />
          Compose
        </button>

        <div className="space-y-1">
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/70 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {folder.icon}
                {folder.label}
              </div>
              {folder.count > 0 && (
                <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                  {folder.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <p className="text-xs text-white/50 mb-1">AgentMail</p>
          <p className="text-sm text-white font-medium">Connected</p>
          <p className="text-xs text-white/40 mt-1">user@moltos.local</p>
        </div>
      </div>

      {/* Email List */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/40 outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-white/40">{filteredEmails.length} messages</span>
            <button className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white/70 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {filteredEmails.map((email, index) => (
              <motion.button
                key={email.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => {
                  setSelectedEmail(email.id);
                  if (!email.read) toggleEmailRead(email.id);
                }}
                className={`w-full p-3 text-left border-b border-white/5 transition-colors ${
                  selectedEmail === email.id
                    ? 'bg-blue-500/10'
                    : 'hover:bg-white/5'
                } ${!email.read && 'bg-white/5'}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-sm truncate ${!email.read ? 'text-white font-semibold' : 'text-white/70'}`}>
                    {email.from.split('@')[0]}
                  </span>
                  <div className="flex items-center gap-1">
                    {email.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                    <span className="text-xs text-white/40">{format(email.date, 'MMM d')}</span>
                  </div>
                </div>
                <p className={`text-sm truncate ${!email.read ? 'text-white' : 'text-white/60'}`}>
                  {email.subject}
                </p>
                <p className="text-xs text-white/40 truncate mt-1">{email.body}</p>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 flex flex-col">
        {selectedEmailData ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 border-b border-white/10">
              <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white/70 transition-colors">
                <Reply className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white/70 transition-colors">
                <Forward className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white/70 transition-colors">
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleEmailStar(selectedEmailData.id)}
                className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                  selectedEmailData.starred ? 'text-yellow-400' : 'text-white/50 hover:text-white/70'
                }`}
              >
                <Star className={`w-4 h-4 ${selectedEmailData.starred && 'fill-yellow-400'}`} />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white/70 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex-1" />
              <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white/70 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Email Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-xl font-semibold text-white mb-4">{selectedEmailData.subject}</h2>

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {selectedEmailData.from.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedEmailData.from}</p>
                    <p className="text-sm text-white/50">to {selectedEmailData.to}</p>
                  </div>
                </div>
                <span className="text-sm text-white/40">
                  {format(selectedEmailData.date, 'MMM d, yyyy h:mm a')}
                </span>
              </div>

              <div className="text-white/80 leading-relaxed whitespace-pre-wrap">
                {selectedEmailData.body}
              </div>

              {/* Attachment placeholder */}
              <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 text-white/50">
                  <Paperclip className="w-5 h-5" />
                  <span className="text-sm">No attachments</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Mail className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-white/50">Select an email to read</p>
            <p className="text-sm text-white/30 mt-1">AgentMail integration ready</p>
          </div>
        )}
      </div>
    </div>
  );
}
