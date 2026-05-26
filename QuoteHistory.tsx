/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Quote } from '../types';
import { FileText, Trash2, Send, ExternalLink, RefreshCw, Calendar, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { generateQuotePDF } from './PDFReportGenerator';
import { generateWhatsAppMessage } from '../utils/calculator';
import { CURTAIN_MODELS } from '../constants';

interface QuoteHistoryProps {
  savedQuotes: Quote[];
  onLoadQuote: (quote: Quote) => void;
  onDeleteQuote: (id: string) => void;
  userRole?: 'vendedor' | 'gerente';
}

export default function QuoteHistory({ savedQuotes, onLoadQuote, onDeleteQuote, userRole }: QuoteHistoryProps) {
  const handleShareWhatsApp = (quote: Quote) => {
    const text = generateWhatsAppMessage(quote);
    const tel = quote.clientInfo.phone ? quote.clientInfo.phone.replace(/\D/g, '') : '';
    window.open(`https://api.whatsapp.com/send?phone=${tel}&text=${text}`, '_blank');
  };

  return (
    <div className="bg-white border border-natural-border rounded-2xl shadow-sm p-6" id="quote-history-container">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-natural-border">
        <div>
          <h2 className="text-md font-bold text-natural-text flex items-center gap-2">
            <FileText className="h-5 w-5 text-natural-primary" />
            Histórico de Orçamentos
          </h2>
          <p className="text-xs text-natural-subtle mt-0.5">Clique em um orçamento para carregar ou gerenciar rapidamente.</p>
        </div>
        <span className="text-xs font-bold bg-natural-card text-natural-muted px-2.5 py-1 rounded-full border border-natural-border">
          {savedQuotes.length} Salvos
        </span>
      </div>

      {savedQuotes.length === 0 ? (
        <div className="py-12 text-center" id="no-saved-quotes">
          <FileText className="h-10 w-10 text-natural-subtle mx-auto stroke-1 mb-2.5" />
          <p className="text-sm font-medium text-natural-muted">Nenhum orçamento salvo no navegador</p>
          <p className="text-xs text-natural-subtle max-w-[200px] mx-auto mt-1">
            Preencha a calculadora e clique em "Salvar Orçamento" para iniciar seu histórico local.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
          {savedQuotes.map((quote) => {
            const modelName = CURTAIN_MODELS.find(m => m.id === quote.modelId)?.name || quote.modelId;
            return (
              <div
                key={quote.id}
                className="group relative border border-natural-border/60 hover:border-natural-border rounded-xl p-4 transition-all hover:bg-natural-card/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div 
                  className="cursor-pointer flex-1" 
                  onClick={() => onLoadQuote(quote)}
                  id={`load-quote-${quote.id}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-natural-primary bg-natural-card px-2 py-0.5 rounded-md border border-natural-border">
                      #{quote.quoteNumber}
                    </span>
                    <h3 className="text-sm font-bold text-natural-text group-hover:text-natural-primary transition-colors">
                      {quote.clientInfo.name}
                    </h3>
                    {quote.status === 'liberado' ? (
                      <span className="text-[9px] inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 shrink-0" /> Liberado
                      </span>
                    ) : (
                      <span className="text-[9px] inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        <Clock className="h-2.5 w-2.5 text-amber-600 shrink-0" /> Pendente
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2.5">
                    <p className="text-xs text-natural-muted flex items-center gap-1.5 col-span-2 sm:col-span-1">
                      <Sparkles className="h-3 w-3 text-natural-subtle" />
                      <span className="font-semibold">{quote.environment}</span> ({modelName})
                    </p>
                    <p className="text-xs text-natural-muted font-mono col-span-2 sm:col-span-1">
                      📐 {quote.width.toFixed(2)}m × {quote.height.toFixed(2)}m
                    </p>
                    <p className="text-xs text-natural-subtle flex items-center gap-1 col-span-2 sm:col-span-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(quote.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs font-bold text-[#7A1657] col-span-2 sm:col-span-1">
                      💰 R$ {quote.totals.grandTotal.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-natural-border/30">
                    <span className="text-[10px] bg-[#FAF6F8] text-[#7A1657] border border-[#7A1657]/20 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                      👤 {quote.vendedorName || 'Vendedor Padrão'}
                    </span>
                    <span className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                      💳 {quote.paymentMethod || 'À Vista'}
                    </span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-natural-border">
                  <button
                    onClick={() => onLoadQuote(quote)}
                    title="Carregar para editar"
                    className="p-2 hover:bg-natural-card hover:text-natural-primary text-natural-subtle rounded-lg transition-colors border border-transparent hover:border-natural-border"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => generateQuotePDF(quote)}
                    title="Baixar Relatório PDF"
                    className="p-2 hover:bg-natural-card hover:text-natural-primary text-natural-subtle rounded-lg transition-colors border border-transparent hover:border-natural-border"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleShareWhatsApp(quote)}
                    title="Enviar pelo WhatsApp"
                    className="p-2 hover:bg-[#E4EEE3]/40 hover:text-emerald-700 text-natural-subtle rounded-lg transition-colors border border-transparent hover:border-[#C5D9C4] flex items-center gap-1 text-xs font-medium"
                  >
                    <Send className="h-4 w-4 text-emerald-600" />
                    <span className="sm:hidden">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => onDeleteQuote(quote.id)}
                    title="Excluir"
                    className="p-2 hover:bg-rose-50 hover:text-rose-700 text-natural-subtle rounded-lg transition-colors border border-transparent hover:border-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
