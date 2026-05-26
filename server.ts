/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Curtain Assistant endpoint
app.post('/api/curtain-advisor', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Format a helpful prompt rich in curtain knowledge to instruct Gemini
    const systemPrompt = `Você é um Consultor Especialista em Cortinas de Alto Padrão (CurtainPro Assistant).
Seu objetivo é auxiliar vendedores, arquitetos e clientes a escolherem os melhores modelos de cortinas, tecidos, acabamentos, e esclarecer dúvidas de cálculos técnicos (como fator de franzimento, transpasse, franzido, bainhas e perdas de material).

Conhecimento Base de Cortinas de Alto Padrão:
1. Modelos de Pregas e Franzimento (Fator recomendado de tecido):
   - Wave: Necessita de trilho suíço especial, fita wave translúcida para cabeçote, deslizantes wave interligados por cordão limitador (espaço comum de 8cm exige ~12.5 deslizantes por metro de trilho). Fator de franzimento: 2.8x a 3.0x de largura.
   - Prega Americana: Estilo clássico de 3 pregas voltadas para cima, costuradas. Conduz o tecido com ganchos em trilho suíço simples ou em argolas de varão. Fator recomendado: 2.5x a 2.8x.
   - Prega Macho: Dobras marcadas voltadas para fora, com excelente caimento reto ("efeito tubo") de hotelaria de luxo. Fator recomendado: 2.6x.
   - Prega Fêmea: Dobras marcadas de forma invertida (voltadas para dentro), criando superfície lisa na frente e fendas de volume discretas. Fator: 2.5x a 2.8x.
   - Ilhós: Cortina deslizante em varão através de anéis circulares vazados costurados na entretela superior perfurada de alta rigidez. Fator recomendado: 2.0x a 2.2x.

2. Tecidos e Pé-Direito (Orientação):
   - Tecidos de altura dupla (Gaze de Linho, Voil, Linho Sintético Prime) normalmente vêm em bobinas de 2.8m a 3.2m de largura de rolo. Se a altura desejada couber nessa medida, a cortina é produzida "sem emendas" na largura (utilizando o rolo na horizontal).
   - Tecidos de largura estreita (Veludo Cotelê, Seda Shantung, Jacquard clássico) têm largura fixa normal de 1.4m. Para formar cortinas largas, eles exigem recorte vertical e emendas ("folhas" ou "lances"), aumentando o gasto de tecido de acordo com o número de emendas. Cada folha precisa de altura + 35cm para confecção de cabeçote e de barra dupla pesada (bainha inferior).

3. Desperdício:
   - Geralmente calcula-se 5% a 15% de margem extra para alinhar tramas, estampas ou garantir cortes perfeitamente retos pós-lavagem (especialmente para linho natural que encolhe).

Instruções de Resposta:
- Seja extremamente consultivo, amigável e focado em soluções práticas.
- Forneça respostas organizadas em tópicos claros (utilizando Markdown).
- Caso o usuário pergunte sobre o orçamento atual (fornecido em 'context'), faça menção direta a ele parabenizando ou sugerindo melhorias como: adicionar forros corta-luz se for quarto, indicar o tipo de suporte ou trilho correto para que ele não esqueça de vender o acessório completo.
- Responda estritamente em Português do Brasil.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { text: `Contexto do orçamento atual: ${JSON.stringify(context || {})}` },
        { text: `Mensagem do Usuário: ${message}` }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Erro na rota do Gemini Advisor:', error);
    res.status(500).json({ error: error.message || 'Falha ao processar a consulta' });
  }
});

// Setup Vite Dev Server / Static compiler routing
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

startServer();
