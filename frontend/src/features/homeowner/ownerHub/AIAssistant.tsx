import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIResponse, LBI_MUNICIPALITIES, type MunicipalityData } from './municipalityData';

interface Props {
  activeMuniId?: string; // pre-selected from ComplianceTracker
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  relatedTopics?: string[];
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'Do I need a permit to rent my property?',
  'What taxes do I owe on short-term rentals in NJ?',
  'When are my quarterly tax returns due?',
  'Can I rent year-round on LBI?',
  'What are the occupancy limits in my town?',
  'What is the noise ordinance in Beach Haven?',
  'Do I need a Certificate of Occupancy?',
  'What flood insurance do I need?',
  'What is the parking rule in Harvey Cedars?',
  'Are there minimum stay requirements on LBI?',
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-sm">
          ⚖️
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`rounded-3xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'rounded-br-lg bg-ocean-600 text-white'
              : 'rounded-bl-lg bg-white/85 border border-white/60 text-slate-700 shadow-glass'
          }`}
          style={!isUser ? { backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } : {}}
        >
          {/* Render markdown-ish bold */}
          <MarkdownText text={msg.text} />
        </div>

        {/* Related topics */}
        {msg.relatedTopics && msg.relatedTopics.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5 px-1">
            {msg.relatedTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-ocean/10 px-2.5 py-0.5 text-[10px] font-semibold text-ocean-600"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        <span className="px-1 text-[10px] text-slate-400">
          {msg.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

/**
 * Renders simple markdown: **bold** and line breaks with \n\n.
 * Keeps it lightweight — no external dep needed.
 */
function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        // Split on **bold**
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={i}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j}>{part.slice(2, -2)}</strong>
              ) : (
                part
              ),
            )}
            {i < lines.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

/** AIAssistant — conversational LBI compliance Q&A */
export function AIAssistant({ activeMuniId }: Props) {
  const activeMuni: MunicipalityData | null = activeMuniId ? LBI_MUNICIPALITIES[activeMuniId] ?? null : null;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: activeMuni
        ? `Hi! I'm your Shore Stay compliance assistant. I see your property is in **${activeMuni.name}** — I can answer questions about your specific municipality, NJ tax obligations, permits, seasonal planning, and more. What would you like to know?`
        : `Hi! I'm your Shore Stay compliance assistant. I can help with LBI rental regulations, NJ tax obligations, permit requirements, seasonal planning, and more.\n\nSelect your municipality in the Compliance Tracker above for more specific answers — or just ask away!`,
      relatedTopics: ['Permits', 'Taxes', 'Compliance'],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate a brief "thinking" delay for natural feel
    setTimeout(() => {
      const response = getAIResponse(text, activeMuni);
      const assistantMsg: Message = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text: response.answer,
        relatedTopics: response.relatedTopics,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleSuggestion(q: string) {
    sendMessage(q);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 420 }}>
      {/* Active municipality badge */}
      {activeMuni && (
        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-ocean/8 border border-ocean/15 px-4 py-2">
          <span className="text-ocean-400 text-sm">🏛️</span>
          <p className="text-[12px] font-semibold text-ocean-700">
            Answering with context for <span className="font-bold">{activeMuni.name}</span>
          </p>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-96 pr-1 pb-2">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-sm">
                ⚖️
              </div>
              <div className="flex items-center gap-1 rounded-3xl rounded-bl-lg bg-white/80 border border-white/60 px-4 py-3 shadow-glass">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-ocean-300"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="mt-3 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Suggested questions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.slice(0, 6).map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestion(q)}
                className="rounded-full border border-ocean/20 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-ocean-600 hover:bg-white hover:border-ocean/40 transition shadow-glass text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about permits, taxes, occupancy rules…"
          disabled={isTyping}
          className="flex-1 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm placeholder:text-slate-300 focus:border-ocean-400 transition disabled:opacity-60"
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-white transition hover:bg-ocean-700 disabled:opacity-50 active:scale-95"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
            <path d="M1 8l14-6-6 14-2-5-6-3z" />
          </svg>
        </button>
      </form>

      <p className="mt-2 text-center text-[10px] text-slate-400">
        Answers are informational only — always verify with your municipality and a licensed attorney.
      </p>
    </div>
  );
}
