
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Send, User, Hash, Paperclip, MoreVertical, Plus, Check, CheckCheck, Smile, Phone, Video, Circle, MessageSquare, X, Info, Wifi, WifiOff, Loader2, AlertCircle, RefreshCw, Terminal, Database, Copy, Globe, Zap, AlertTriangle, ExternalLink, ShieldAlert, Cpu, Sparkles, Activity, ShieldCheck, HeartPulse } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SystemUser } from '../types';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  isSystem?: boolean;
}

interface Chat {
  id: string;
  name: string;
  type: 'DIRECT' | 'CHANNEL';
  lastMessage?: string;
  lastTime?: string;
  unreadCount: number;
  online?: boolean;
  role?: string;
}

const STATIC_CHANNELS: Chat[] = [
  { id: 'chan-kitchen', name: 'Kitchen Staff', type: 'CHANNEL', unreadCount: 0 },
  { id: 'chan-foh', name: 'Front of House', type: 'CHANNEL', unreadCount: 0 },
  { id: 'chan-drivers', name: 'Drivers Fleet', type: 'CHANNEL', unreadCount: 0 },
];

interface MessagesProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const Messages: React.FC<MessagesProps> = ({ onNotify }) => {
  const { currentUser, users } = useApp();
  const [activeChatId, setActiveChatId] = useState<string>('chan-kitchen');
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'LOCAL' | 'CONNECTING' | 'LIVE' | 'ERROR'>(
    isSupabaseConfigured ? 'CONNECTING' : 'LOCAL'
  );
  const [lastError, setLastError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isDoctoring, setIsDoctoring] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    console.log(`[Foodika Cloud] ${msg}`);
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 25));
  };

  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem('foodika-chat-v25');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  const activeChat = useMemo(() => {
    const direct = users?.find(u => u.id === activeChatId);
    const channel = STATIC_CHANNELS.find(c => c.id === activeChatId);
    if (direct) return { 
        id: direct.id, 
        name: direct.username, 
        type: 'DIRECT' as const, 
        role: direct.roleName, 
        online: direct.status === 'ACTIVE',
        unreadCount: 0
    };
    return channel || STATIC_CHANNELS[0];
  }, [activeChatId, users]);

  const currentConversationId = useMemo(() => {
    if (!activeChat || !currentUser) return '';
    if (activeChat.type === 'CHANNEL') return activeChat.id;
    return [currentUser.id, activeChat.id].sort().join('--');
  }, [activeChat, currentUser]);

  const currentMessages = currentConversationId ? (chatHistory[currentConversationId] || []) : [];

  const runConnectionDoctor = async () => {
    setIsDoctoring(true);
    addLog("Doctor: Initiating Network Diagnostic...");
    try {
      const start = Date.now();
      const response = await fetch('https://vqdqqordjsfvthwditrfw.supabase.co/rest/v1/', {
        method: 'GET',
        headers: { 'apikey': 'checking' }
      });
      const latency = Date.now() - start;
      addLog(`Doctor: Endpoint reachable (${latency}ms). Status: ${response.status}`);
      onNotify("Cloud Node is reachable. Retrying sync...", "success");
      setRetryCount(prev => prev + 1);
    } catch (err: any) {
      addLog(`Doctor ALERT: CRITICAL FETCH FAILURE. Browser is blocking traffic.`);
      addLog(`Fix: Check VPN, Ad-blocker, or Proxy settings.`);
      setLastError("NETWORK_BLOCKED");
    } finally {
      setIsDoctoring(false);
    }
  };

  const fetchLatestMessages = async () => {
    if (!isSupabaseConfigured || !currentConversationId) return false;
    setIsFetching(true);
    addLog(`Sync: Syncing node ${currentConversationId}...`);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversationId)
        .order('timestamp', { ascending: true })
        .limit(50);

      if (error) {
        addLog(`Protocol Error: ${error.message} (${error.code})`);
        if (error.code === '42P01') { 
          setConnectionStatus('ERROR');
          setLastError("DATABASE_TABLE_MISSING");
          return false;
        }
        throw error;
      }

      if (data) {
        addLog(`Sync: Downloaded ${data.length} records.`);
        const formatted: Message[] = data.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          text: m.text,
          timestamp: m.timestamp,
          status: m.status as any
        }));
        setChatHistory(prev => ({ ...prev, [currentConversationId]: formatted }));
        setLastError(null);
        return true;
      }
      return false;
    } catch (err: any) {
      addLog(`Sync failed: ${err.message}`);
      if (err.message.includes('Failed to fetch')) {
        setLastError("FETCH_FAILURE");
        setConnectionStatus('ERROR');
      }
      return false;
    } finally {
      setIsFetching(false);
    }
  };

  const initSupabase = async () => {
    if (!isSupabaseConfigured) {
      setConnectionStatus('LOCAL');
      return;
    }

    setConnectionStatus('CONNECTING');
    addLog("Cloud: Connecting to publication stream...");

    const fetchOk = await fetchLatestMessages();

    try {
      const channel = supabase
        .channel(`room:${currentConversationId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${currentConversationId}`
        }, (payload) => {
          addLog("Inbound: Broadcast received.");
          const newMessage: Message = {
            id: payload.new.id,
            senderId: payload.new.sender_id,
            senderName: payload.new.sender_name,
            text: payload.new.text,
            timestamp: payload.new.timestamp,
            status: payload.new.status as any
          };
          
          setChatHistory(prev => {
            const existing = prev[currentConversationId] || [];
            if (existing.some(m => m.id === newMessage.id)) return prev;
            return { ...prev, [currentConversationId]: [...existing, newMessage] };
          });
        })
        .subscribe((status) => {
          addLog(`Stream Status: ${status}`);
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('LIVE');
            setLastError(null);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
             if (!fetchOk) {
               setConnectionStatus('ERROR');
               setLastError("HANDSHAKE_TIMEOUT");
             }
          }
        });

      return channel;
    } catch (err: any) {
      addLog(`Protocol Fail: ${err.message}`);
      if (!fetchOk) setConnectionStatus('ERROR');
    }
  };

  useEffect(() => {
    if (!currentConversationId) return;
    let channel: any;
    initSupabase().then(c => { channel = c; });
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [currentConversationId, retryCount]);

  useEffect(() => {
    try {
      localStorage.setItem('foodika-chat-v25', JSON.stringify(chatHistory));
    } catch (e) {}
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages.length, activeChatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentUser || !activeChat || !currentConversationId) return;

    const timestamp = new Date().toISOString();
    const tempId = `temp-${Date.now()}`;
    const textToSubmit = messageText;

    // Optimistic Push
    const newMessage: Message = {
      id: tempId,
      senderId: currentUser.id,
      senderName: currentUser.username,
      text: textToSubmit,
      timestamp,
      status: 'SENT'
    };

    setChatHistory(prev => ({
      ...prev,
      [currentConversationId]: [...(prev[currentConversationId] || []), newMessage]
    }));

    setMessageText('');

    try {
      const { error } = await supabase.from('messages').insert([{
        sender_id: currentUser.id,
        sender_name: currentUser.username,
        conversation_id: currentConversationId,
        text: textToSubmit,
        timestamp: timestamp,
        status: 'SENT'
      }]);
      
      if (error) {
        addLog(`Send Fail: ${error.message}`);
        onNotify(`Cloud sync failed: ${error.message}`, 'error');
      }
    } catch (err: any) {
      addLog(`Network Fail: ${err.message}`);
      onNotify(`Network disconnected. Message pending.`, 'info');
    }
  };

  const filteredChats = useMemo(() => {
    const all = [...STATIC_CHANNELS, ...(users || []).filter(u => u.id !== currentUser?.id).map(u => ({
      id: u.id,
      name: u.username,
      type: 'DIRECT' as const,
      role: u.roleName,
      online: u.status === 'ACTIVE',
      unreadCount: 0
    }))];
    return all.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, currentUser, searchTerm]);

  if (!currentUser) return null;

  return (
    <div className="h-full flex bg-white dark:bg-brand-black overflow-hidden animate-in fade-in duration-500">
      {/* SIDEBAR */}
      <div className="w-80 border-r border-gray-200 dark:border-neutral-800 flex flex-col bg-gray-50 dark:bg-brand-surface/20">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-transparent">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                 Messenger <Sparkles size={16} className="text-brand-red" />
              </h2>
              <div className="flex flex-col gap-1 mt-1">
                 {connectionStatus === 'LIVE' ? (
                   <button onClick={() => setShowDiagnostics(!showDiagnostics)} className="flex items-center gap-2 group text-left">
                     <span className="flex items-center gap-1 text-[9px] text-green-500 font-bold uppercase tracking-widest group-hover:underline">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Node: Connected
                     </span>
                   </button>
                 ) : connectionStatus === 'CONNECTING' ? (
                    <span className="flex items-center gap-1 text-[9px] text-brand-red font-bold uppercase tracking-widest animate-pulse">
                      <Loader2 size={10} className="animate-spin" /> Node: Handshaking...
                    </span>
                 ) : (
                    <button 
                      onClick={() => setShowDiagnostics(true)}
                      className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest hover:underline ${connectionStatus === 'ERROR' ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      {connectionStatus === 'ERROR' ? <ShieldAlert size={10}/> : <WifiOff size={10}/>}
                      {connectionStatus === 'ERROR' ? 'Sync Interrupted (Check Logs)' : 'Isolated Node'}
                    </button>
                 )}
              </div>
            </div>
            <button className="p-2 bg-brand-red text-white rounded-xl hover:bg-brand-redHover shadow-lg shadow-red-900/20 transition-all active:scale-95">
              <Plus size={20} />
            </button>
          </div>
          
          {showDiagnostics && (
            <div className="mb-4 p-3 bg-black rounded-lg border border-neutral-800 text-[9px] font-mono text-green-500 space-y-1 animate-in slide-in-from-top-2">
               <div className="flex justify-between text-gray-500 border-b border-neutral-800 pb-1 mb-1">
                  <span className="flex items-center gap-1 uppercase font-bold font-sans"><Terminal size={10}/> Cloud Session Debugger</span>
                  <button onClick={() => setShowDiagnostics(false)}><X size={10}/></button>
               </div>
               <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                  {logs.map((log, i) => <div key={i} className="mb-1 break-words">{log}</div>)}
               </div>
               <div className="pt-2 mt-2 border-t border-neutral-800 flex gap-1">
                  <button 
                    onClick={runConnectionDoctor}
                    disabled={isDoctoring}
                    className="flex-1 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded font-bold uppercase tracking-tighter flex items-center justify-center gap-1"
                  >
                    {isDoctoring ? <Loader2 size={8} className="animate-spin"/> : <HeartPulse size={10}/>}
                    Run Doctor
                  </button>
                  <button 
                    onClick={() => setRetryCount(prev => prev + 1)}
                    className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-bold uppercase tracking-tighter"
                  >
                    Force Sync
                  </button>
               </div>
            </div>
          )}

          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search directory..."
              className="w-full bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-1">
            {filteredChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group relative ${
                  activeChatId === chat.id 
                    ? 'bg-white dark:bg-neutral-800 shadow-md border border-gray-200 dark:border-neutral-700 scale-[1.02] z-10' 
                    : 'hover:bg-gray-100 dark:hover:bg-neutral-900/50 border border-transparent'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 border-transparent transition-all ${chat.type === 'CHANNEL' ? 'bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-neutral-400' : 'bg-brand-red/10 text-brand-red'}`}>
                  {chat.type === 'CHANNEL' ? <Hash size={20} /> : <User size={20} />}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <span className={`font-bold text-sm truncate block ${activeChatId === chat.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-neutral-300'}`}>{chat.name}</span>
                  <p className="text-xs text-gray-400 truncate uppercase tracking-tighter font-bold">{chat.type === 'CHANNEL' ? 'Fleet Node' : 'Direct Link'}</p>
                </div>
                {chat.online && activeChatId !== chat.id && <div className="w-2 h-2 rounded-full bg-green-500 absolute right-4 top-1/2 -translate-y-1/2"></div>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white dark:bg-brand-black relative">
        {activeChat ? (
          <>
            <div className="h-20 px-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between bg-white/80 dark:bg-brand-surface/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeChat.type === 'CHANNEL' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-500' : 'bg-brand-red/10 text-brand-red'}`}>
                  {activeChat.type === 'CHANNEL' ? <Hash size={20} /> : <User size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                    {activeChat.name}
                    {activeChat.online && <Circle size={8} fill="#22c55e" className="text-green-500" />}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-neutral-500 font-bold uppercase tracking-widest">
                    {activeChat.type === 'CHANNEL' ? 'Enterprise Channel' : activeChat.role || 'System Member'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setRetryCount(prev => prev + 1)} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-brand-red transition-all" title="Resync"><RefreshCw size={20} /></button>
                <div className="w-px h-6 bg-gray-200 dark:border-neutral-800 mx-2"></div>
                <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 transition-all"><Phone size={20} /></button>
                <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 transition-all"><Video size={20} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30 dark:bg-transparent">
              {lastError ? (
                 <div className="h-full flex flex-col items-center justify-center p-8 animate-in zoom-in-95">
                    <div className="p-6 bg-red-100 dark:bg-red-900/20 rounded-3xl mb-6">
                       <ShieldAlert size={64} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">
                      {lastError === "DATABASE_TABLE_MISSING" ? 'Infrastructure Fault' : 'Network Handshake Failed'}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-neutral-400 text-center max-w-sm mb-6 space-y-2">
                       {lastError === "FETCH_FAILURE" || lastError === "NETWORK_BLOCKED" ? (
                         <>
                           <p>Your browser is blocking the connection to the Cloud Node. This usually happens due to:</p>
                           <ul className="text-xs text-left list-disc list-inside bg-gray-100 dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
                             <li><strong>Ad-blockers:</strong> Disable for this domain.</li>
                             <li><strong>VPN / Firewall:</strong> Check if external APIs are allowed.</li>
                             <li><strong>Proxy:</strong> Ensure <code>supabase.co</code> is whitelisted.</li>
                           </ul>
                         </>
                       ) : (
                         <p>The system cannot locate the <strong>'messages'</strong> table in your cloud node.</p>
                       )}
                    </div>
                    
                    <div className="flex gap-3">
                       <button onClick={runConnectionDoctor} className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-xl transition-all flex items-center gap-2">
                          <HeartPulse size={18} /> Connectivity Doctor
                       </button>
                       <button onClick={() => setRetryCount(prev => prev + 1)} className="px-6 py-3 bg-brand-red text-white font-bold rounded-xl shadow-xl shadow-red-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                          <RefreshCw size={18} /> Retry Sync
                       </button>
                    </div>
                 </div>
              ) : (
                <>
                  {currentMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-20 text-center">
                       {isFetching ? <Loader2 size={64} className="mb-4 animate-spin text-brand-red" /> : <Zap size={64} className="mb-4" />}
                       <p className="text-lg font-bold uppercase tracking-widest">{isFetching ? 'Synchronizing...' : 'Secure Node Ready'}</p>
                    </div>
                  ) : (
                    currentMessages.map((msg, idx) => {
                      const isMe = msg.senderId === currentUser.id;
                      const showSender = idx === 0 || currentMessages[idx-1].senderId !== msg.senderId;
                      
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                          {!isMe && showSender && (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">{msg.senderName}</span>
                          )}
                          <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className={`p-4 rounded-2xl text-sm shadow-sm relative ${
                              isMe 
                                ? 'bg-brand-red text-white rounded-br-none shadow-red-900/10' 
                                : 'bg-white dark:bg-brand-surface text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-neutral-800 shadow-md'
                            }`}>
                              {msg.text}
                              <div className={`flex items-center gap-1.5 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                 <span className={`text-[9px] font-mono ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                                 {isMe && <CheckCheck size={12} className="text-white/50" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-brand-black">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-gray-100 dark:bg-neutral-900 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-brand-red/20 transition-all border border-transparent focus-within:border-brand-red/30">
                <button type="button" className="p-2 text-gray-400 hover:text-brand-red transition-colors"><Paperclip size={20}/></button>
                <input 
                  type="text" 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Secure node message to ${activeChat.name}...`}
                  className="flex-1 bg-transparent border-none text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400"
                />
                <button type="button" className="p-2 text-gray-400 hover:text-brand-red transition-colors"><Smile size={20}/></button>
                <button 
                  type="submit" 
                  disabled={!messageText.trim()}
                  className={`p-3 rounded-xl transition-all shadow-lg ${
                    messageText.trim() 
                      ? 'bg-brand-red text-white hover:bg-brand-redHover shadow-red-900/30' 
                      : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-12 text-center opacity-40">
            <MessageSquare size={80} className="mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">System Node</h3>
            <p className="max-w-xs mx-auto text-sm">Select a colleague or channel to start an encrypted session.</p>
          </div>
        )}
      </div>
    </div>
  );
};
