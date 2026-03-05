import { OpenAI } from 'openai';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { model, messages, temperature } = req.body;

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL || undefined,
        });

        const response = await openai.chat.completions.create({
            model: model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: messages,
            temperature: temperature || 0.7,
        });

        res.status(200).json(response);
    } catch (error) {
        console.error('Erro na API da OpenAI:', error);
        res.status(500).json({ error: 'Erro ao conectar com a API da OpenAI' });
    }
}
