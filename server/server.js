const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());



app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, temperature } = req.body;

    // Instanciar o OpenAI a cada requisição com os valores atualizados do .env
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });

    // Fallback model to env default or gpt-4o-mini
    const response = await openai.chat.completions.create({
      model: model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages,
      temperature: temperature || 0.7,
    });

    res.json(response);
  } catch (error) {
    console.error('Erro na API da OpenAI:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao conectar com a API da OpenAI' });
    }
  }
});

app.post('/api/webhook', async (req, res) => {
  const webhookUrl = process.env.VITE_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.includes("COLE_SUA_URL")) {
    return res.status(400).json({ status: 'error', message: 'Webhook não configurado. Dados apenas locais.' });
  }

  try {
    console.log("Enviando dados pro Sheets via Node Proxy...");
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();
    // Exibe aviso claro se o Google barrar pedindo login do desenvolvedor
    if (text.includes("Você precisa ter acesso") || text.includes("Sign in")) {
      console.error("❌ ERRO DE PERMISSÃO: O Google barrou a requisição. Você precisa configurar 'Quem tem acesso' para 'Qualquer pessoa'.");
      return res.status(403).json({ status: 'error', message: 'Permissão Negada' });
    }

    console.log("Sucesso no Sheets!");
    res.json({ status: 'ok', response: text });
  } catch (error) {
    console.error("Erro interno no envio pro webhook:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor proxy OpenAI rodando na porta ${PORT}`);
});
