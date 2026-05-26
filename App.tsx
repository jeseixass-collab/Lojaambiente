/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QuoteForm from './components/QuoteForm';
import QuoteHistory from './components/QuoteHistory';
import AdvisorChat from './components/AdvisorChat';
import LojaAmbienteLogo from './components/LojaAmbienteLogo';
import { PRELOADED_QUOTES } from './data/preloadedQuotes';
import { Quote } from './types';
import { Sparkles, Library, FileText, PhoneCall, CheckCircle2, Bot, HelpCircle, FileCheck, ArrowRight, Users } from 'lucide-react';

export default function App() {
  const [userRole, setUserRole] = useState<'vendedor' | 'gerente'>(() => {
    try {
      const stored = localStorage.getItem('curtainpro_role');
      return (stored === 'vendedor' || stored === 'gerente') ? stored : 'vendedor';
    } catch {
      return 'vendedor';
    }
  });

  const [savedQuotes, setSavedQuotes] = useState<Quote[]>(() => {
    try {
      const stored = localStorage.getItem('curtainpro_quotes');
      return stored && JSON.parse(stored).length > 0 ? JSON.parse(stored) : PRELOADED_QUOTES;
    } catch {
      return PRELOADED_QUOTES;
    }
  });

  const [loadedQuote, setLoadedQuote] = useState<Quote | null>(null);

  const [activeVendedor, setActiveVendedor] = useState<string>(() => {
    try {
      return localStorage.getItem('curtainpro_active_vendedor') || 'Vendedor Padrão';
    } catch {
      return 'Vendedor Padrão';
    }
  });

  // Sync role to localStorage
  useEffect(() => {
    localStorage.setItem('curtainpro_role', userRole);
  }, [userRole]);

  // Sync activeVendedor to localStorage
  useEffect(() => {
    localStorage.setItem('curtainpro_active_vendedor', activeVendedor);
  }, [activeVendedor]);

  // Sync quotes to localStorage
  useEffect(() => {
    localStorage.setItem('curtainpro_quotes', JSON.stringify(savedQuotes));
  }, [savedQuotes]);

  const handleSaveQuote = (newQuote: Quote) => {
    setSavedQuotes(prev => {
      const matchIdx = prev.findIndex(q => q.id === newQuote.id);
      if (matchIdx > -1) {
        const list = [...prev];
        list[matchIdx] = newQuote;
        return list;
      }
      return [newQuote, ...prev];
    });
    alert(`Orçamento #${newQuote.quoteNumber} para ${newQuote.clientInfo.name} guardado com sucesso!`);
  };

  const handleDeleteQuote = (id: string) => {
    if (confirm('Tem certeza de que deseja apagar este orçamento permanentemente?')) {
      setSavedQuotes(prev => prev.filter(q => q.id !== id));
      if (loadedQuote?.id === id) {
        setLoadedQuote(null);
      }
    }
  };

  const handleLoadQuote = (quote: Quote) => {
    setLoadedQuote(quote);
    // Smooth scroll back to form workspace
    document.getElementById('quote-form-workspace')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClear = () => {
    setLoadedQuote(null);
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text font-sans" id="curtainpro-app-root">
      
      {/* Visual Header / Branding bar with Loja Ambiente logo and coordinates */}
      <header className="bg-white text-natural-text border-b border-natural-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3.5">
            <LojaAmbienteLogo size="md" className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-bold tracking-tight text-[#7A1657]" id="logo-branding-header">
                  LOJA Ambiente
                </h1>
                <span className="text-[10px] bg-natural-card text-[#7A1657] font-bold uppercase px-2 py-0.5 rounded-md border border-natural-border">SISTEMA OFICIAL</span>
              </div>
              <p className="text-xs italic text-natural-muted font-medium">decorando o seu espaço</p>
            </div>
          </div>

          {/* Core Store Coordinates Column */}
          <div className="hidden lg:flex flex-col text-[10px] text-natural-muted leading-tight border-l border-natural-border pl-4">
            <span className="font-bold uppercase text-[#7A1657]">E.C. DECORAÇÕES EIRELI ME</span>
            <span>Rua Antônio Bertoncini, 135 - Cidade Alta</span>
            <span>Araranguá - SC • CEP 88901-022</span>
            <span>CNPJ: 22.675.872/0001-92 • INSC: 25.767.782-8</span>
          </div>

          <div className="flex items-center gap-3.5 text-xs font-bold uppercase tracking-wider">
            <a 
              href="mailto:lojaambiente@hotmail.com" 
              className="hidden sm:flex items-center gap-1.5 bg-natural-card text-natural-muted hover:text-[#7A1657] px-3 py-2 rounded-xl border border-natural-border transition-all"
            >
              <span>lojaambiente@hotmail.com</span>
            </a>
            <div className="flex items-center gap-1.5 bg-[#F5EDF1] text-[#7A1657] px-3 py-2 rounded-xl border border-[#ECDCE3]">
              <PhoneCall className="h-3.5 w-3.5 text-[#7A1657]" />
              <span>(48) 3524-1574</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout Container */}
      <main className="max-w-7xl mx-auto px-5 py-7">
        
        {/* Intro Card Banner themed with Loja Ambiente brand */}
        <div className="bg-[#7A1657] text-white p-6 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md border border-[#5C1041]">
          <div className="space-y-1.5 max-w-xl text-left">
            <h2 className="text-xl font-serif font-bold tracking-tight">Cálculos de Confecção Sob Medida • LOJA Ambiente</h2>
            <p className="text-sm text-[#F5EDF1]/90 leading-relaxed">
              Sistema corporativo integrado para especificação técnica de tecidos, cálculo de perdas (Desperdício), costuras/emendas verticais e controle de aviamentos. Desenvolvido para as rigorosas exigências dos tecidos de linho e layouts da nossa loja em Araranguá.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center self-stretch flex flex-col justify-center min-w-[200px]">
            <span className="text-[#DFCAD5] font-bold text-xs uppercase block">Fones de Suporte</span>
            <span className="text-md font-bold block font-mono mt-1">(48) 3524-1574</span>
            <span className="text-md font-bold block font-mono">(48) 99931-1574</span>
          </div>
        </div>

        {/* Corporate Profile Switcher */}
        <div className="bg-white border border-natural-border rounded-2xl p-6 mb-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-natural-border pb-3">
            <div className="text-left">
              <h2 className="text-sm font-bold text-[#4A443E] uppercase tracking-widest flex items-center gap-2">
                <Users className="h-5 w-5 text-[#7A1657]" />
                Perfil de Acesso Ativo
              </h2>
              <p className="text-xs text-natural-subtle">
                Alterne seu perfil de trabalho neste painel para simular a montagem do vendedor ou a liberação/descontos do gerente.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 uppercase font-bold rounded-lg shrink-0">
                Aprovação de Alçada Ativa
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* VENDEDOR */}
            <button
              type="button"
              onClick={() => setUserRole('vendedor')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex gap-4 ${
                userRole === 'vendedor'
                  ? 'border-[#7A1657] bg-[#FAF6F8] ring-1 ring-[#7A1657]/10'
                  : 'border-natural-border hover:border-natural-subtle bg-white'
              }`}
            >
              <div className={`p-3 rounded-lg flex items-center justify-center shrink-0 h-11 w-11 ${
                userRole === 'vendedor' ? 'bg-[#7A1657] text-white' : 'bg-natural-card text-natural-muted'
              }`}>
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#4A443E]">Perfil Vendedor</h4>
                  {userRole === 'vendedor' && (
                    <span className="text-[9px] bg-[#7A1657] text-white px-2 py-0.5 font-bold uppercase rounded-sm">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-natural-muted leading-relaxed">
                  Pode estruturar o orçamento completo, alterar medidas e adicinar novos cômodos. Limite de desconto limitado a 10%. Orçamentos são salvos como <strong>Pendente de Aprovação</strong>.
                </p>
              </div>
            </button>

            {/* GERENTE */}
            <button
              type="button"
              onClick={() => setUserRole('gerente')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex gap-4 ${
                userRole === 'gerente'
                  ? 'border-[#7A1657] bg-[#FAF6F8] ring-1 ring-[#7A1657]/10'
                  : 'border-natural-border hover:border-natural-subtle bg-white'
              }`}
            >
              <div className={`p-3 rounded-lg flex items-center justify-center shrink-0 h-11 w-11 ${
                userRole === 'gerente' ? 'bg-[#7A1657] text-white' : 'bg-natural-card text-natural-muted'
              }`}>
                <FileCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#4A443E]">Perfil Gerente (Aprovação)</h4>
                  {userRole === 'gerente' && (
                    <span className="text-[9px] bg-[#7A1657] text-white px-2 py-0.5 font-bold uppercase rounded-sm">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-natural-muted leading-relaxed">
                  Revisa orçamentos, concede descontos avançados acima de 10%, adiciona cômodos/acessórios e clica em <strong>Liberar Orçamento</strong> para consolidá-lo definitivamente para venda.
                </p>
              </div>
            </button>
          </div>

          {/* Active Selling Profile Identification (Simulated) */}
          <div className="mt-4 pt-4 border-t border-natural-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-[#4A443E] uppercase">Assinatura Digital do Vendedor Ativo</span>
              <span className="block text-[10px] text-natural-muted">Vincula novos orçamentos ao seu nome e bloqueia alterações por outros vendedores.</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={activeVendedor}
                onChange={(e) => setActiveVendedor(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full sm:w-64 bg-natural-card border border-natural-input rounded-xl px-4 py-2 text-xs font-semibold text-[#7A1657] focus:outline-hidden focus:ring-1 focus:ring-[#7A1657]"
                id="active-vendedor-input"
              />
              <span className="text-[10px] text-natural-subtle whitespace-nowrap bg-natural-card px-2.5 py-1 rounded-lg border border-natural-border uppercase font-mono font-bold">Vendedor Ativo</span>
            </div>
          </div>
        </div>

        {/* Real-world Scanned Documents / Photo Preload Switchbar */}
        <div className="bg-white border border-natural-border rounded-2xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-natural-text flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[#7A1657]" />
                Simular com Orçamentos Reais da Loja
              </h3>
              <p className="text-xs text-natural-subtle mt-0.5">
                Clique em um dos orçamentos históricos digitalizados a partir das fotos físicas para carregar os parâmetros exatos.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const ariane = PRELOADED_QUOTES.find(q => q.id === 'ariane-veca-cozinha');
                  if (ariane) handleLoadQuote(ariane);
                }}
                className="text-xs font-bold bg-[#FAF6F8] hover:bg-[#F5EDF1] text-[#7A1657] border border-[#ECDCE3] px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span>📄 Ariane (vêca) - Cozinha</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const jana = PRELOADED_QUOTES.find(q => q.id === 'jana-sala-tecido-renda');
                  if (jana) handleLoadQuote(jana);
                }}
                className="text-xs font-bold bg-[#FAF6F8] hover:bg-[#F5EDF1] text-[#7A1657] border border-[#ECDCE3] px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span>📄 Jana - Sala (R$ 1.874,00)</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const janaQ = PRELOADED_QUOTES.find(q => q.id === 'jana-quarto-tecido-renda');
                  if (janaQ) handleLoadQuote(janaQ);
                }}
                className="text-xs font-bold bg-[#FAF6F8] hover:bg-[#F5EDF1] text-[#7A1657] border border-[#ECDCE3] px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span>Quarto Jana (R$ 1.474,00)</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Master Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column 1 & 2: Interactive Quotation Form */}
          <div className="lg:col-span-2 space-y-6">
            <QuoteForm 
              onSaveQuote={handleSaveQuote} 
              loadedQuote={loadedQuote}
              onClearLoadedQuote={handleClear}
              userRole={userRole}
              activeVendedor={activeVendedor}
            />
          </div>

          {/* Right Column 3: History & Live AI Consult Assistant */}
          <div className="space-y-8 col-span-1">
            
            {/* Active AI Consultant Chat */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-natural-subtle flex items-center gap-1.5">
                  <Bot className="h-4.5 w-4.5 text-natural-primary" />
                  Assistência de Engenharia de Venda
                </h3>
                <span className="text-[10px] bg-natural-card text-natural-muted font-bold px-2 py-0.5 rounded-md border border-natural-border flex items-center gap-1">
                  <HelpCircle className="h-3 w-3 text-natural-subtle" /> Consultor Ativo
                </span>
              </div>
              <AdvisorChat currentQuote={loadedQuote || {}} />
            </div>

            {/* Quote History */}
            <QuoteHistory 
              savedQuotes={savedQuotes} 
              onLoadQuote={handleLoadQuote} 
              onDeleteQuote={handleDeleteQuote}
              userRole={userRole}
            />

            {/* Quick specifications advice */}
            <div className="bg-natural-card p-5 rounded-2xl border border-natural-border">
              <h4 className="text-xs font-bold text-natural-primary uppercase">📚 Dica de Produção</h4>
              <p className="text-xs text-natural-muted mt-2 leading-relaxed">
                Ao vender o modelo <strong>Wave</strong>, sempre se assegure de incluir os ganchos do caracol combinados com os deslizantes indicados. Se o pé-direito do cliente for duplo (&gt;3,2m), certifique-se de instruí-los sobre a costura vertical obrigatória caso usem tecidos com rolos estreitos de 1,40m!
              </p>
            </div>
          </div>

        </div>

      </main>

      <footer className="bg-white border-t border-natural-border py-8 mt-16 text-center text-xs text-natural-subtle">
        <p>© 2026 CortinaPro Engenharia e Sistemas de Decoração Ltda. Todos os direitos reservados.</p>
        <p className="mt-1">Nenhum dado é enviado a servidores externos sem permissão explicativa.</p>
      </footer>

    </div>
  );
}
