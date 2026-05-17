'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWsUrl, getToken } from '@/lib/api/client';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

interface DiscussionTabProps {
  bookId: string;
}

export function DiscussionTab({ bookId }: DiscussionTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Connect to WebSocket
    const room_id = `book_${bookId}`;
    const wsUrl = getWsUrl(`/ws/chat/${room_id}`);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setConnected(true);
      console.log('Connected to Discussion Room');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          user: data.user || 'Peer',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false, // Messages from socket are from others
        };
        setMessages((prev) => [...prev, newMessage]);
      } catch {
        // Handle raw text
        const newMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          user: 'Peer',
          text: event.data,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      console.log('Disconnected from Discussion Room');
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [bookId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;

    const user = JSON.parse(localStorage.getItem('ms_user') || '{}').name || 'You';
    const msgData = { user, text: inputText };
    
    socketRef.current.send(JSON.stringify(msgData));

    // Add locally immediately
    const myMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      user: 'You',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setMessages((prev) => [...prev, myMsg]);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif text-[var(--primary)] font-bold flex items-center gap-2">
            💬 Discussion Room
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1">Chat with others reading this book</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-[var(--border)]"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-8">
            <div className="text-4xl mb-4">🛸</div>
            <p className="text-sm italic">The room is quiet... be the first to start the intellectual discourse.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{msg.user}</span>
                <span className="text-[10px] text-[var(--muted)]/50">{msg.timestamp}</span>
              </div>
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm
                ${msg.isMe 
                  ? 'bg-[var(--primary)] text-[#0C0A09] rounded-tr-none' 
                  : 'bg-[#1C1917] border border-[var(--border)] text-[var(--foreground)] rounded-tl-none'}`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="relative">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="w-full bg-[#1C1917] border border-[var(--border)] rounded-full py-3 px-5 pr-12 text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || !connected}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[var(--primary)] text-[#0C0A09] rounded-full hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </form>
    </div>
  );
}
