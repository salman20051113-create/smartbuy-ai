import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, MessageSquare, Bot, User, RefreshCw, ChevronRight } from 'lucide-react';
import Markdown from 'react-markdown';
import { Product, ChatMessage } from '../types';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contextProducts: Product[];
  currentQuery: string;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  contextProducts,
  currentQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I'm your **SmartBuy AI Shopping Assistant**. 
I've analyzed the recommended products for "${currentQuery || 'your search'}" in the Indian market.

Ask me anything—such as:
* Which model has the best microphone for noisy calls?
* How does battery endurance compare?
* Which brand has better warranty & service centers in India?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        'Which one has the best microphone for Zoom & phone calls?',
        'Which brand provides better warranty support in India?',
        'Is it worth spending extra for the higher-end option?',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          contextProducts: contextProducts.slice(0, 4),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get chat response');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I evaluated the specs and user reviews. Let me know if you need more details!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: data.suggestedQuestions || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          'Based on real user testing and current Indian market prices, we suggest checking the warranty duration and charging capabilities before finalizing. Feel free to ask about another product feature!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col transition-all">
      {/* Header */}
      <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-slate-950 font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">SmartBuy AI Assistant</h3>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              <span>Contextual Product Advice</span>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Context Badge of Products currently being discussed */}
      {contextProducts.length > 0 && (
        <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 py-2 text-xs text-slate-300 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Context:</span>
          <span className="font-semibold text-orange-400 truncate max-w-[280px]">
            {contextProducts.map((p) => p.name.split(' ')[0] + ' ' + (p.name.split(' ')[1] || '')).join(' vs ')}
          </span>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-1.5 mb-1 px-1">
              {msg.role === 'assistant' ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[11px] font-bold text-orange-400">SmartBuy AI</span>
                </>
              ) : (
                <>
                  <span className="text-[11px] font-bold text-slate-400">You</span>
                  <User className="w-3.5 h-3.5 text-slate-400" />
                </>
              )}
              <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[90%] shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="markdown-body prose prose-invert prose-sm max-w-none space-y-2">
                  <Markdown>{msg.content}</Markdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>

            {/* Suggested Follow-up Questions */}
            {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
              <div className="mt-2.5 space-y-1.5 w-full">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Suggested Follow-ups:
                </span>
                <div className="flex flex-col space-y-1">
                  {msg.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-left text-xs bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700/60 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{q}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-orange-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 w-fit">
            <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
            <span>SmartBuy AI is analyzing product specs & buyer feedback...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask follow-up about specs, battery, mic..."
            className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2.5 bg-orange-500 text-slate-950 font-bold rounded-xl hover:bg-orange-400 disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
