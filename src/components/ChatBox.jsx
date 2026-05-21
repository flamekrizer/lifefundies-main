'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { subscribeToMessages, sendMessage } from '@/lib/chatService';

function formatTime(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function ChatBox({ sessionId, currentUser, guideName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;
    if (sessionId === 'demo-session') {
      setMessages([
        {
          id: 'welcome-1',
          senderId: 'guide-mental-health-1',
          senderName: guideName || 'Priya Sharma',
          text: `Hello! 👋 Welcome to your clarity session. I'm Priya Sharma. I have reviewed your notes about career transition and anxiety. How are you feeling today?`,
          role: 'guide',
          createdAt: new Date(Date.now() - 60000),
        }
      ]);
      return;
    }
    const unsub = subscribeToMessages(sessionId, setMessages);
    return () => unsub();
  }, [sessionId, guideName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');

    if (sessionId === 'demo-session') {
      const userMsg = {
        id: `user-msg-${Date.now()}`,
        senderId: currentUser?.uid || 'demo-user-id',
        senderName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User',
        text,
        role: 'user',
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      
      // Dynamic therapist responses
      setTimeout(() => {
        const replies = [
          "I completely understand that feeling. Transitioning careers can feel like stepping into the dark. What's the biggest challenge you are facing right now?",
          "That is a very natural response. Remember, change is a process. Let's break down your main goals for this transition so we can build a practical plan together.",
          "Absolutely! Taking small, consistent steps is key. Let's do a simple deep breathing exercise for 1 minute before we dive into your resume strategy. Ready?",
        ];
        
        let replyText = replies[0];
        if (text.toLowerCase().includes('stress') || text.toLowerCase().includes('anxious') || text.toLowerCase().includes('fear') || text.toLowerCase().includes('bad')) {
          replyText = replies[1];
        } else if (text.toLowerCase().includes('goal') || text.toLowerCase().includes('resume') || text.toLowerCase().includes('job') || text.toLowerCase().includes('strategy')) {
          replyText = replies[2];
        }
        
        const guideMsg = {
          id: `guide-reply-${Date.now()}`,
          senderId: 'guide-mental-health-1',
          senderName: guideName || 'Priya Sharma',
          text: replyText,
          role: 'guide',
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, guideMsg]);
      }, 1500);
      return;
    }

    if (!currentUser) return;
    setSending(true);
    try {
      await sendMessage(sessionId, {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        text,
        role: 'user',
      });
    } catch (err) {
      console.error('Failed to send:', err);
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isMe = (msg) => msg.senderId === currentUser?.uid;

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] rounded-2xl border border-white/8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-white/[0.03]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white text-sm font-bold">
          {guideName?.charAt(0) || 'G'}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{guideName || 'Your Guide'}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-[11px] text-zinc-400">In session</p>
          </div>
        </div>
        <MessageCircle className="ml-auto w-4 h-4 text-zinc-500" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-zinc-500" />
            </div>
            <p className="text-sm text-zinc-500 max-w-[200px]">
              Start the conversation with your guide
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const mine = isMe(msg);
          return (
            <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 mt-1">
                  {msg.senderName?.charAt(0) || 'G'}
                </div>
              )}
              <div className={`max-w-[75%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!mine && (
                  <span className="text-[10px] text-zinc-500 ml-1">{msg.senderName}</span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                    mine
                      ? 'bg-green-600 text-white rounded-tr-sm'
                      : 'bg-white/[0.07] text-zinc-100 border border-white/8 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-zinc-600 mx-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/8 bg-white/[0.02]">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all max-h-24 overflow-y-auto [scrollbar-width:none]"
            style={{ lineHeight: '1.5' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </form>
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-1">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
