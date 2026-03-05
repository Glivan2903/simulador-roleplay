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
        if (text.includes("Você precisa ter acesso") || text.includes("Sign in")) {
            console.error("ERRO DE PERMISSÃO: O Google barrou a requisição.");
            return res.status(403).json({ status: 'error', message: 'Permissão Negada' });
        }

        res.status(200).json({ status: 'ok', response: text });
    } catch (error) {
        console.error("Erro interno no envio pro webhook:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}
