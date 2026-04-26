import React, { useState, useRef, useEffect } from 'react';
import { askChartBot } from '../utils/chartBot';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const QUICK_QUESTIONS = [
  'What does my chart say about love?',
  'Tell me about my career prospects',
  'What is my current dasha period?',
  'What yogas are in my chart?',
  'What remedies do I need?',
  'Tell me about my personality',
  'What does my chart say about health?',
  'Will I travel abroad?',
];

export default function ChartBot({ chartData }) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: chartData
        ? `Namaste 🙏 I am your Vedic Astrology guide. Your chart shows a ${['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][chartData.lagnaSign]} Lagna. Ask me anything about your birth chart — love, career, health, dashas, yogas, remedies, or any life question.`
        : 'Namaste 🙏 Please calculate your birth chart first by entering your birth details on the left. Once your chart is ready, I can answer all your astrology questions.',
      followUps: QUICK_QUESTIONS.slice(0, 4),
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput('');

    setMessages(m => [...m, { role: 'user', text: q }]);
    setTyping(true);

    try {
      const result = askChartBot(q, chartData);
      const msgId = Date.now();

      // Wait for Gemini — if it responds, use that. Otherwise fall back to local.
      const rag = await result.ragPromise;

      const finalText = rag?.answer || result.text;
      const finalSources = rag?.sources || [];

      setMessages(m => [...m, {
        role: 'bot',
        text: finalText,
        followUps: result.followUps,
        webResults: finalSources,
        id: msgId,
      }]);
    } catch (e) {
      console.error('Bot error:', e);
      setMessages(m => [...m, {
        role: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        followUps: [],
        webResults: [],
      }]);
    }

    setTyping(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="glass-dark glow-purple flex flex-col" style={{ height: 600 }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow:'0 0 16px rgba(124,58,237,0.4)' }}>
          <Sparkles size={16} className="text-white"/>
        </div>
        <div>
          <div className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">Jyotiṣa Bot</div>
          <div className="text-xs text-gray-500">Ask anything about your birth chart</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
          <span className="text-xs text-gray-500">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: msg.role === 'bot' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(139,92,246,0.2)',
                border: msg.role === 'user' ? '1px solid rgba(139,92,246,0.3)' : 'none',
              }}>
              {msg.role === 'bot' ? <Bot size={14} className="text-white"/> : <User size={14} className="text-purple-300"/>}
            </div>

            {/* Bubble + follow-ups */}
            <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: msg.role === 'bot' ? 'rgba(139,92,246,0.1)' : 'rgba(124,58,237,0.25)',
                  border: `1px solid ${msg.role === 'bot' ? 'rgba(139,92,246,0.2)' : 'rgba(124,58,237,0.4)'}`,
                  color: '#e2e8f0',
                  borderTopLeftRadius: msg.role === 'bot' ? 4 : 16,
                  borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                }}>
                {msg.text}
              </div>

              {/* Follow-up suggestions after bot messages */}
              {msg.role === 'bot' && msg.followUps?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-w-full">
                  {msg.followUps.map((q, j) => (
                    <button key={j} onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all text-left"
                      style={{ background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)', color:'#a78bfa' }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(139,92,246,0.18)'; e.currentTarget.style.borderColor='rgba(139,92,246,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor='rgba(139,92,246,0.2)'; }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Web results */}
              {msg.role === 'bot' && msg.webResults?.length > 0 && (
                <div className="w-full space-y-1.5 mt-1">
                  <div className="text-xs text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                    🌐 From the web
                  </div>
                  {msg.webResults.slice(0, 3).map((r, j) => r.url && (
                    <a key={j} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="block rounded-xl p-3 transition-all"
                      style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(139,92,246,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                      <div className="text-xs font-medium text-purple-300 truncate mb-1">{r.title}</div>
                      <div className="text-xs text-gray-400 leading-relaxed" style={{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{r.snippet}</div>
                      <div className="text-xs text-gray-600 mt-1">{r.source}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              <Bot size={14} className="text-white"/>
            </div>
            <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
              style={{ background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', borderTopLeftRadius:4 }}>
              <span className="text-xs text-purple-400/70">Jyotiṣa AI is thinking</span>
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400"
                  style={{ animation:`bounce 1s ease-in-out ${i*0.15}s infinite` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your chart — love, career, health, dashas..."
            rows={1}
            className="flex-1 resize-none rounded-xl px-4 py-3 text-sm text-gray-100 outline-none transition-all"
            style={{
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(139,92,246,0.22)',
              fontFamily:'Inter,sans-serif', maxHeight:120, lineHeight:1.5,
            }}
            onFocus={e => e.target.style.borderColor='rgba(139,92,246,0.55)'}
            onBlur={e => e.target.style.borderColor='rgba(139,92,246,0.22)'}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || typing}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
            style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow:'0 4px 12px rgba(124,58,237,0.3)' }}>
            <Send size={15} className="text-white"/>
          </button>
        </div>
        <div className="text-xs text-gray-600 mt-1.5 text-center">Press Enter to send · Shift+Enter for new line</div>
      </div>

      <style>{`
        @keyframes bounce {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)}
        }
      `}</style>
    </div>
  );
}
