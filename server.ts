import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { FINANCIAL_AI_SYSTEM_PROMPT } from './src/utils/aiPromptConstants.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK on server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI analysis endpoint
app.post('/api/ai/analyze-finances', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      incomes = [],
      expenses = [],
      financings = [],
      totalIncome = 0,
      totalExpenses = 0,
      totalPaid = 0,
      totalPending = 0,
      balance = 0,
      notes = '',
    } = req.body;

    // If no API key is available or in test mode, return high quality rule-based response
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured. Providing calculated deterministic insight.');
      const fallbackSavings = Math.round(totalExpenses * 0.15);
      res.json({
        success: true,
        isDemo: true,
        data: {
          diagnosis: `Comprometimento de ${totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : '100'}% da renda líquida total informada. Seu saldo livre mensal atual é de R$ ${balance.toFixed(2)}.`,
          healthScore: totalIncome > totalExpenses ? 78 : 45,
          healthStatus: totalIncome > totalExpenses ? 'Equilibrado com oportunidade de otimização' : 'Alerta de déficit orçamentário',
          patternAlerts: [
            {
              category: 'Despesas Variáveis',
              insight: 'Gastos variáveis e supérfluos representam oportunidade imediata de retenção de capital.',
              percentageImpact: 18,
            },
            {
              category: 'Vencimentos e Fluxo',
              insight: `Você possui R$ ${totalPending.toFixed(2)} em contas pendentes neste mês. Mantenha os pagamentos antes do vencimento para evitar encargos.`,
              percentageImpact: 12,
            },
          ],
          cutRecommendations: [
            {
              title: 'Revisão de Assinaturas e Serviços Recorrentes',
              description: 'Cancele streamings não utilizados nos últimos 30 dias e renegocie planos de telefonia/internet.',
              monthlySavingEstimate: 80,
              difficulty: 'Fácil',
              category: 'Assinaturas',
            },
            {
              title: 'Teto Semanal para Delivery e Alimentação Externa',
              description: 'Defina um teto fixo por final de semana para pedidos e refeições fora de casa.',
              monthlySavingEstimate: Math.max(120, Math.round(totalExpenses * 0.08)),
              difficulty: 'Médio',
              category: 'Alimentação',
            },
            {
              title: 'Otimização de Lazer e Compras por Impulso',
              description: 'Adote a regra das 48 horas antes de efetuar compras de itens não essenciais.',
              monthlySavingEstimate: Math.max(100, Math.round(totalExpenses * 0.05)),
              difficulty: 'Fácil',
              category: 'Lazer',
            },
          ],
          debtPayoffSimulation: financings.length > 0 ? {
            targetFinancingTitle: financings[0].title,
            extraMonthlyAmortization: fallbackSavings,
            estimatedMonthsReduced: Math.min(financings[0].remainingInstallments || 24, Math.max(6, Math.round(fallbackSavings / 30))),
            estimatedInterestSaved: Math.round(fallbackSavings * 8.5),
            conclusion: `Injetando R$ ${fallbackSavings.toFixed(2)} economizados mensalmente na amortização do ${financings[0].title}, você reduzirá drasticamente os juros futuros e antecipará a quitação total.`
          } : null,
          savingsGoal: {
            recommendedMonthlySaving: fallbackSavings,
            threeStepsAction: [
              '1. Congele novos parcelamentos no cartão de crédito nas próximas 4 semanas.',
              '2. Direcione a economia das despesas cortadas diretamente para uma conta separada ou amortização.',
              '3. Pague as contas pendentes antes do 3º dia útil para manter score alto.'
            ]
          }
        }
      });
      return;
    }

    // Prepare structured payload for Gemini
    const payload = {
      userSummary: {
        totalIncome,
        totalExpenses,
        totalPaid,
        totalPending,
        balance,
        savingsRatePercentage: totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : '0',
      },
      incomes: incomes.map((i: any) => ({ name: i.name, amount: i.amount, type: i.type, frequency: i.frequency })),
      expenses: expenses.map((e: any) => ({
        name: e.name,
        amount: e.amount,
        dueDate: e.dueDate,
        category: e.category,
        type: e.type,
        status: e.status,
      })),
      financings: financings.map((f: any) => ({
        title: f.title,
        totalAmount: f.totalAmount,
        interestRateAnnual: f.interestRate,
        installmentAmount: f.installmentAmount,
        totalInstallments: f.totalInstallments,
        paidInstallments: f.paidInstallments,
        remainingInstallments: f.remainingInstallments,
        remainingBalance: f.remainingBalance,
      })),
      userNotes: notes,
    };

    const userPrompt = `
Aqui estão os dados financeiros consolidados do usuário para este mês:
\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\`

Analise com rigor financeiro, detecte anomalias e excessos nos gastos e gere recomendações personalizadas com simulação matemática de quitação de financiamento acelerada.
`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: FINANCIAL_AI_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING, description: 'Diagnóstico financeiro global objetivo em 2 a 3 frases.' },
            healthScore: { type: Type.NUMBER, description: 'Score de 0 a 100 da saúde financeira.' },
            healthStatus: { type: Type.STRING, description: 'Classificação (ex: Excelente, Estável, Alerta, Crítico)' },
            patternAlerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  insight: { type: Type.STRING },
                  percentageImpact: { type: Type.NUMBER },
                },
                required: ['category', 'insight'],
              },
            },
            cutRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  monthlySavingEstimate: { type: Type.NUMBER },
                  difficulty: { type: Type.STRING, description: 'Fácil, Médio ou Avançado' },
                  category: { type: Type.STRING },
                },
                required: ['title', 'description', 'monthlySavingEstimate', 'difficulty'],
              },
            },
            debtPayoffSimulation: {
              type: Type.OBJECT,
              properties: {
                targetFinancingTitle: { type: Type.STRING },
                extraMonthlyAmortization: { type: Type.NUMBER },
                estimatedMonthsReduced: { type: Type.NUMBER },
                estimatedInterestSaved: { type: Type.NUMBER },
                conclusion: { type: Type.STRING },
              },
              required: ['targetFinancingTitle', 'extraMonthlyAmortization', 'estimatedMonthsReduced', 'conclusion'],
            },
            savingsGoal: {
              type: Type.OBJECT,
              properties: {
                recommendedMonthlySaving: { type: Type.NUMBER },
                threeStepsAction: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['recommendedMonthlySaving', 'threeStepsAction'],
            },
          },
          required: ['diagnosis', 'healthScore', 'healthStatus', 'patternAlerts', 'cutRecommendations', 'savingsGoal'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsedData = JSON.parse(text);

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error generating AI financial insights:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Falha ao processar análise financeira com IA.',
    });
  }
});

// Endpoint to inspect the System Prompt and JSON schema for documentation and developers
app.get('/api/ai/prompt-specs', (_req: Request, res: Response) => {
  res.json({
    systemPrompt: FINANCIAL_AI_SYSTEM_PROMPT,
    model: 'gemini-3.8-flash',
    format: 'JSON Schema Structured Output',
  });
});

// Vite Middleware or Static Serves
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Gasto Inteligente server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
