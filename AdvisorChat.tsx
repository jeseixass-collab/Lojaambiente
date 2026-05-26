/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Quote } from '../types';
import { Send, Sparkles, User, Bot, Loader2, ArrowRight } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

interface AdvisorChatProps {
  currentQuote: Partial<Quote>;
}

export default function AdvisorChat({ currentQuote }: AdvisorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Olá! Sou seu assistente técnico especializado do CurtainPro. Posso ajudar você a formular especificações complexas de tecidos, tirar dúvidas de caimento, orientar em vãos com pé-direito duplo ou sugerir acessórios corretos pós-venda. Como posso ajudar agora?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const chips = [
    'Como calcular linho em pé-direito de 6 metros?',
    'Quais forros ajudam no caimento da gaze de linho?',
    'Diferença prática entre Prega Wave e Prega Americana',
    'Como evitar rugas e dobras feias em cortinas pesadas?'
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const newMsgs = [...messages, { sender: 'user' as const, text: textToSend }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/curtain-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: currentQuote,
        }),
      });
      const data = await response.json();
      
      if (data.error) {
        setMessages(m => [...m, { sender: 'bot', text: `Ocorreu um erro técnico: ${data.error}` }]);
      } else {
        setMessages(m => [...m, { sender: 'bot', text: data.text }]);
      }
    } catch (err) {
      setMessages(m => [...m, { sender: 'bot', text: 'Oops! Não consegui conectar ao servidor do assistente AI. Verifique se o servidor está rodando.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#4A443E] border border-natural-muted rounded-2xl overflow-hidden flex flex-col h-[550px] shadow-lg" id="advisor-ai-chat">
      {/* Chat header */}
      <div className="bg-[#3B3530] px-5 py-4 border-b border-[#2D2824] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-white/10 p-2 rounded-lg text-natural-success-border">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-natural-success-border">Consultor IA</span>
            <h3 className="font-bold text-white text-sm">Escritório Técnico CurtainPro</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#8CBA85] animate-pulse"></span>
          <span className="text-[10px] text-natural-border/80 font-medium">Conectado</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-natural-muted">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && (
              <div className="h-8 w-8 rounded-lg bg-white/15 border border-white/20 text-[#C5D9C4] flex items-center justify-center shrink-0">
                <Bot className="h-4.5 w-4.5" />
              </div>
            )}
            
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-natural-primary text-white rounded-tr-none font-medium'
                  : 'bg-[#3F3934] text-natural-border border border-natural-muted/20 rounded-tl-none'
              }`}
            >
              {/* Elementary formatting parse for markdown list elements in simpler blocks */}
              <div className="space-y-1.5">
                {msg.text.split('\n').map((line, lIdx) => {
                  if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                    return <li key={lIdx} className="ml-4 list-disc text-natural-border/90">{line.replace(/^[-*]\s+/, '')}</li>;
                  }
                  if (line.trim().startsWith('###')) {
                    return <h4 key={lIdx} className="font-bold text-[#C5D9C4] mt-2 text-xs uppercase tracking-wider">{line.replace('###', '')}</h4>;
                  }
                  return <p key={lIdx}>{line}</p>;
                })}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="h-8 w-8 rounded-lg bg-natural-primary text-white flex items-center justify-center shrink-0 select-none text-xs font-bold">
                M
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/15 text-natural-success-border flex items-center justify-center shrink-0 animate-spin">
              <Loader2 className="h-4 w-4" />
            </div>
            <div className="bg-[#3F3934] text-natural-border/80 border border-natural-muted/20 rounded-2xl rounded-tl-none p-3.5 text-sm animate-pulse flex items-center gap-2">
              Analisando dados do tecido e materiais...
            </div>
          </div>
        )}
      </div>

      {/* Suggested chips panel */}
      <div className="px-5 py-2.5 bg-[#3B3530]/60 border-t border-[#2D2824] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
        {chips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip)}
            className="text-natural-border bg-[#453F3A] hover:bg-natural-primary hover:text-white border border-natural-muted/30 px-3 py-1.5 rounded-full text-xs transition-colors shrink-0 cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input controls */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-4 bg-[#3B3530] border-t border-[#2D2824] flex gap-2"
        id="chat-input-form"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Perguntar sobre cálculo de ilhós, tecidos..."
          className="flex-1 bg-[#4A443E] border border-natural-muted rounded-xl px-4 py-3 text-sm text-white focus:outline-hidden focus:ring-1 focus:ring-natural-primary focus:border-natural-primary transition-colors placeholder:text-natural-subtle/50"
          id="chat-message-input"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-natural-primary hover:bg-natural-primary-hover text-white p-3 rounded-xl disabled:opacity-50 disabled:hover:bg-natural-primary transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          id="chat-send-btn"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
