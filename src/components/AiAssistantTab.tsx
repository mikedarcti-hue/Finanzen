import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  Zap,
  Target,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDateBR } from '../utils/formatters';

interface AiAssistantTabProps {
  onNavigateToTab: (tab: 'expenses' | 'financings') => void;
}

export const AiAssistantTab: React.FC<AiAssistantTabProps> = ({ onNavigateToTab }) => {
  const { data, isAiLoading, aiError, runAiAnalysis } = useFinance();
  const [userNotes, setUserNotes] = useState('');

  const analysis = data.lastAiAnalysis;

  const handleRunAnalysis = async () => {
    await runAiAnalysis(userNotes);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-teal-400 border-teal-500/40 bg-teal-500/10';
    if (score >= 40) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 3.8 Flash Finance Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Assistente de IA: Corte de Gastos & Aceleração
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Auditoria inteligente do seu orçamento mensal, identificação de vazamentos invisíveis de dinheiro e simulação direta de antecipação de dívidas.
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAiLoading}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all active:scale-95 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>{isAiLoading ? 'Analisando Dados...' : 'Gerar Análise com IA'}</span>
          </button>
        </div>

        {/* Optional Context Field */}
        <div className="relative z-10 mt-4 pt-4 border-t border-slate-800/80">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Foco ou Meta Especial para a IA (Opcional):</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Quero economizar R$ 600 cortando delivery e streaming para abater no carro..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
            <button
              onClick={handleRunAnalysis}
              disabled={isAiLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {aiError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <div className="flex-1">
            <strong>Falha na requisição da IA:</strong> {aiError}
          </div>
        </div>
      )}

      {/* Loading state skeleton */}
      {isAiLoading && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-8 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-white">Cruzando dados de receitas, despesas e juros...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            O Copilot Gasto Inteligente está auditando o comprometimento de renda, rastreando despesas supérfluas e calculando amortizações.
          </p>
        </div>
      )}

      {/* Empty State when no analysis generated yet */}
      {!analysis && !isAiLoading && (
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-emerald-400 flex items-center justify-center mx-auto border border-slate-700">
            <Lightbulb className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Nenhuma análise gerada ainda para este mês</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Clique em <strong>"Gerar Análise com IA"</strong> no topo para receber um diagnóstico completo, sugestões de cortes práticos e tempo reduzido de financiamentos.
            </p>
          </div>
          <button
            onClick={handleRunAnalysis}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg transition-all"
          >
            Iniciar Análise Agora
          </button>
        </div>
      )}

      {/* Results Content */}
      {analysis && !isAiLoading && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Row: Diagnosis & Health Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Score Card */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                Score de Saúde Financeira
              </span>
              <div
                className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center mb-2 ${getScoreColor(
                  analysis.healthScore
                )}`}
              >
                <span className="text-3xl font-black">{analysis.healthScore}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">{analysis.healthStatus}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Atualizado em {formatDateBR(analysis.generatedAt.split('T')[0])}
              </p>
            </div>

            {/* Global Diagnosis */}
            <div className="md:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5 mb-2">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Diagnóstico Executivo</span>
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">{analysis.diagnosis}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Meta mensal de economia recomendada:</span>
                <span className="text-base font-bold text-emerald-400">
                  {formatCurrency(analysis.savingsGoal?.recommendedMonthlySaving || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Análise de Padrões & Inconsistências */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Padrões de Consumo & Inconsistências Detectadas</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.patternAlerts?.map((alert, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{alert.category}</span>
                      {alert.percentageImpact && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                          +{alert.percentageImpact}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{alert.insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sugestões de Corte de Gastos */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <span>Recomendações Práticas de Corte & Otimização</span>
              </h3>
              <span className="text-xs text-emerald-400 font-bold">
                Total economia: ~
                {formatCurrency(
                  analysis.cutRecommendations?.reduce(
                    (acc, curr) => acc + curr.monthlySavingEstimate,
                    0
                  ) || 0
                )}
                /mês
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {analysis.cutRecommendations?.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between hover:border-emerald-500/30 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {rec.category || 'Geral'}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          rec.difficulty === 'Fácil'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : rec.difficulty === 'Médio'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-indigo-500/15 text-indigo-400'
                        }`}
                      >
                        {rec.difficulty}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white mb-1.5">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Economia est.:</span>
                    <span className="font-bold text-emerald-400">
                      +{formatCurrency(rec.monthlySavingEstimate)}/mês
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulação de Quitação de Dívidas / Financiamentos com a Economia */}
          {analysis.debtPayoffSimulation && (
            <div className="rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/40 p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Efeito Alavanca: Quitação Acelerada de Dívida
                    </h3>
                    <p className="text-xs text-slate-400">
                      Alvo: <strong>{analysis.debtPayoffSimulation.targetFinancingTitle}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToTab('financings')}
                  className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-colors shrink-0"
                >
                  <span>Abrir na Aba Financiamentos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Aporte Mensal Extra</p>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">
                    {formatCurrency(analysis.debtPayoffSimulation.extraMonthlyAmortization)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Proveniente dos cortes sugeridos</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Meses Antecipados</p>
                  <p className="text-lg font-bold text-cyan-400 mt-0.5">
                    -{analysis.debtPayoffSimulation.estimatedMonthsReduced} meses
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    (~{(analysis.debtPayoffSimulation.estimatedMonthsReduced / 12).toFixed(1)} anos livres)
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Juros Poupados</p>
                  <p className="text-lg font-bold text-white mt-0.5">
                    ~{formatCurrency(analysis.debtPayoffSimulation.estimatedInterestSaved || 0)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Economia financeira líquida</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                💬 <strong>Conclusão do Consultor:</strong> {analysis.debtPayoffSimulation.conclusion}
              </p>
            </div>
          )}

          {/* Plano de Ação em 3 Passos */}
          {analysis.savingsGoal?.threeStepsAction && (
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Plano de Execução Imediato em 3 Passos</span>
              </h3>

              <div className="space-y-2.5">
                {analysis.savingsGoal.threeStepsAction.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/70"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-200 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
