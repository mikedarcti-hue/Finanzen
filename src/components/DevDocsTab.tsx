import React, { useState } from 'react';
import {
  Code,
  Smartphone,
  Server,
  Download,
  Upload,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { FINANCIAL_AI_SYSTEM_PROMPT } from '../utils/aiPromptConstants';

export const DevDocsTab: React.FC = () => {
  const { data, exportDataAsJSON, importDataFromJSON, resetToDefaultData } = useFinance();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleExportDownload = () => {
    const json = exportDataAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzen-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const ok = importDataFromJSON(importJsonText.trim());
    if (ok) {
      setImportStatus('success');
      setImportJsonText('');
      setTimeout(() => setImportStatus(null), 4000);
    } else {
      setImportStatus('error');
    }
  };

  const SYSTEM_PROMPT_DOC = `Você é o "FinanZen Copilot", um consultor financeiro sênior especializado em finanças pessoais, economia comportamental e matemática de amortização acelerada (métodos SAC e PRICE).

Seu objetivo é analisar minuciosamente o raio-x financeiro do usuário (fontes de renda, despesas fixas e variáveis com seus vencimentos, e dívidas/financiamentos de longo prazo) e fornecer:
1. "diagnosis": Diagnóstico direto da saúde financeira (grau de comprometimento da renda, risco de endividamento e índice de liquidez).
2. "patternAlerts": Análise de inconsistências e padrões de consumo (ex: despesas variáveis infladas como delivery, assinaturas esquecidas, lazer desproporcional, peso dos juros).
3. "cutRecommendations": 3 a 5 recomendações práticas, realistas e específicas de corte ou renegociação de gastos (categorizadas com estimativa de economia mensal em R$).
4. "debtPayoffSimulation": Cálculo de aceleração de quitação: caso a economia sugerida seja direcionada integralmente para amortização antecipada do financiamento prioritário, calcular quantos meses/anos e juros serão poupados.
5. "savingsGoal": Meta de economia mensal recomendada e plano de ação imediato em 3 passos.

Você DEVE responder SEMPRE em formato JSON estrito, respeitando as propriedades definidas no schema. Seja empático, pragmático e focado em resultados reais. Valores monetários devem estar em Reais (BRL, números float).`;

  const JSON_SCHEMA_DOC = `{
  "type": "OBJECT",
  "properties": {
    "diagnosis": { "type": "STRING" },
    "healthScore": { "type": "NUMBER" },
    "healthStatus": { "type": "STRING" },
    "patternAlerts": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "category": { "type": "STRING" },
          "insight": { "type": "STRING" },
          "percentageImpact": { "type": "NUMBER" }
        },
        "required": ["category", "insight"]
      }
    },
    "cutRecommendations": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "title": { "type": "STRING" },
          "description": { "type": "STRING" },
          "monthlySavingEstimate": { "type": "NUMBER" },
          "difficulty": { "type": "STRING" },
          "category": { "type": "STRING" }
        },
        "required": ["title", "description", "monthlySavingEstimate", "difficulty"]
      }
    },
    "debtPayoffSimulation": {
      "type": "OBJECT",
      "properties": {
        "targetFinancingTitle": { "type": "STRING" },
        "extraMonthlyAmortization": { "type": "NUMBER" },
        "estimatedMonthsReduced": { "type": "NUMBER" },
        "estimatedInterestSaved": { "type": "NUMBER" },
        "conclusion": { "type": "STRING" }
      },
      "required": ["targetFinancingTitle", "extraMonthlyAmortization", "estimatedMonthsReduced", "conclusion"]
    },
    "savingsGoal": {
      "type": "OBJECT",
      "properties": {
        "recommendedMonthlySaving": { "type": "NUMBER" },
        "threeStepsAction": { "type": "ARRAY", "items": { "type": "STRING" } }
      },
      "required": ["recommendedMonthlySaving", "threeStepsAction"]
    }
  },
  "required": ["diagnosis", "healthScore", "healthStatus", "patternAlerts", "cutRecommendations", "savingsGoal"]
}`;

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Title */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span>Arquitetura Técnica, Engenharia de Prompt & Deploy</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Guia completo para desenvolvedores com modelagem de dados, prompts de IA estruturados e instruções para deploy na Vercel e empacotamento Android (Capacitor / TWA).
        </p>
      </div>

      {/* Database Backup & Restore */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Gerenciamento de Dados (LocalStorage & Export/Import JSON)</span>
        </h3>
        <p className="text-xs text-slate-400">
          O FinanZen funciona 100% offline via LocalStorage e está totalmente preparado para ser conectado a bancos de dados na nuvem (Supabase, Firebase Firestore ou PostgreSQL).
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar Backup (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Deseja restaurar os dados de exemplo padrão? Todas as alterações manuais serão resetadas.')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Dados Exemplo</span>
          </button>
        </div>

        {/* Import JSON field */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <label className="text-xs font-medium text-slate-300">
            Importar Dados via JSON:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Cole aqui o JSON exportado do FinanZen..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500/60"
            />
            <button
              onClick={handleImportSubmit}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              Restaurar Dados
            </button>
          </div>
          {importStatus === 'success' && (
            <p className="text-xs text-emerald-400">Dados importados com sucesso!</p>
          )}
          {importStatus === 'error' && (
            <p className="text-xs text-rose-400">JSON inválido ou incompatível.</p>
          )}
        </div>
      </div>

      {/* System Prompt & JSON Schema Section */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <span>Engenharia de Prompt: System Prompt & Schema JSON</span>
          </h3>
          <button
            onClick={() => copyToClipboard(SYSTEM_PROMPT_DOC, 'sys-prompt')}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            {copiedSection === 'sys-prompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'sys-prompt' ? 'Copiado!' : 'Copiar Prompt'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
            {SYSTEM_PROMPT_DOC}
          </pre>
        </div>

        {/* Schema */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              ResponseSchema (Structured Output para @google/genai):
            </span>
            <button
              onClick={() => copyToClipboard(JSON_SCHEMA_DOC, 'schema')}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {copiedSection === 'schema' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'schema' ? 'Copiado!' : 'Copiar Schema'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300/90 font-mono overflow-x-auto max-h-60 overflow-y-auto">
            {JSON_SCHEMA_DOC}
          </pre>
        </div>
      </div>

      {/* Guide: Deploying to Vercel & Packaging for Android */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vercel Guide */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            <span>Como Hospedar na Vercel (PWA)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Passo a passo para publicar o FinanZen com HTTPS obrigatório e suporte completo a Service Worker e PWA:
          </p>

          <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/70">
            <li>Suba o projeto no seu repositório GitHub ou GitLab.</li>
            <li>Conecte sua conta na <strong>Vercel</strong> e importe o repositório.</li>
            <li>
              Defina o <strong>Framework Preset</strong> como <em>Vite</em>.
            </li>
            <li>
              <strong>Variáveis de Ambiente</strong>: Adicione <code className="text-emerald-400 font-mono">GEMINI_API_KEY</code> nas configurações da Vercel.
            </li>
            <li>
              Para rotas de backend (se usar Serverless Functions da Vercel): crie uma pasta <code className="text-cyan-300 font-mono">/api/analyze.ts</code> ou utilize o servidor Express containerizado (Render, Railway ou Cloud Run).
            </li>
          </ol>
        </div>

        {/* Android Packaging (Capacitor / TWA) */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Transformar em App Android Nativo (APK / Play Store)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Você tem dois caminhos profissionais e recomendados:
          </p>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70">
              <strong className="text-cyan-300 block mb-1">Opção 1: Capacitor (Recomendada)</strong>
              <p className="text-slate-400 mb-2">Gera um projeto Android nativo completo com Gradle e Android Studio:</p>
              <div className="p-2 bg-black/80 rounded font-mono text-[10px] text-slate-300 space-y-1">
                <p>npm i @capacitor/core @capacitor/cli @capacitor/android</p>
                <p>npx cap init FinanZen com.finanzen.app</p>
                <p>npm run build</p>
                <p>npx cap add android</p>
                <p>npx cap open android</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70">
              <strong className="text-emerald-300 block mb-1">Opção 2: TWA (Trusted Web Activity) via Bubblewrap</strong>
              <p className="text-slate-400 mb-2">Empacota seu PWA hospedado na Vercel diretamente em APK assinado para Google Play:</p>
              <div className="p-2 bg-black/80 rounded font-mono text-[10px] text-slate-300">
                <p>npx @bubblewrap/cli init --manifest=https://seu-dominio.vercel.app/manifest.webmanifest</p>
                <p>npx @bubblewrap/cli build</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
