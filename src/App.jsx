import { useState, useRef, useEffect } from "react";
import logo from "./assets/logo.png";
import { User, MessageCircle, Zap, CheckCircle, Lightbulb, Send, Star } from "lucide-react";

const JETSALES_CONTEXT = `Você é um CLIENTE SIMULADO em um roleplay de treinamento de vendas da Jetsales Brasil. Você NÃO é o vendedor. Você é o prospect/lead que está sendo abordado.

SOBRE A JETSALES BRASIL (contexto que o VENDEDOR conhece, mas você como cliente NÃO deve demonstrar conhecimento prévio):
- Plataforma de gestão e automação de vendas pelo WhatsApp
- Quase 10 mil clientes em todo o Brasil
- Mais de 5 milhões de atendimentos processados
- Infraestrutura Oracle Cloud
- Fundada em 2021 em Aracaju/SE
- Funcionalidades: multi-atendentes em um número, chatbot/IA, painel Kanban/CRM, funil de remarketing (recupera até 37% de leads), notas internas, dashboard em tempo real, disparos em massa
- Planos trimestrais (5% OFF), semestrais (7% OFF) e anuais (10% OFF)
- Teste grátis de 7 dias com garantia de reembolso
- Onboarding guiado com equipe de especialistas
- Suporte humanizado

METODOLOGIA DE VENDAS DO POP (12 etapas que o vendedor deve seguir):
1. Abordagem Inicial - Captura de atenção e qualificação
2. Sondagem - Identificação de dor e oportunidades
3. Conexão - Reforço de credibilidade
4. Análise do ROI - Oportunidades de crescimento
5. Apresentação do Produto - Valor e benefícios
6. Funcionalidades Chave - Diferenciais
7. Dribla Solicitação de Preço - Valor percebido
8. Chamada para Ação - Conduzir ao fechamento
9. Follow-up Estratégico
10. Retomada e Proposta
11. Fechamento - Garantia e ação imediata
12. Pós-venda

REGRAS DE COMPORTAMENTO:
- Responda SEMPRE em português brasileiro, de forma natural e coloquial
- Suas respostas devem ser CURTAS (1-3 frases no máximo), como mensagens reais de WhatsApp
- NUNCA revele que é uma IA ou simulação dentro do roleplay
- Reaja de acordo com o NÍVEL DE DIFICULDADE e PERFIL definidos
- Apresente objeções naturais de acordo com o perfil e a etapa da conversa
- Se o vendedor fizer uma boa abordagem, reconheça (mas não facilite demais)
- Se o vendedor cometer erros (ser genérico, pressionar demais, não ouvir), reaja negativamente
- Evolua na conversa: comece mais resistente e vá cedendo conforme o vendedor demonstra valor
- Use linguagem informal mas profissional, como um empresário real faria no WhatsApp`;

const SEGMENTS = [
  {
    id: "varejo", label: "Varejo / Lojas", icon: "🏪", description: "Loja física com vendas pelo WhatsApp",
    personas: [
      { name: "Carlos", business: "loja de roupas masculinas", city: "Recife", team: "3 vendedores", challenge: "perde muitas conversas no WhatsApp pessoal de cada vendedor" },
      { name: "Fernanda", business: "loja de acessórios femininos", city: "Goiânia", team: "2 atendentes", challenge: "não consegue fazer remarketing dos clientes que visitam a loja" },
      { name: "Roberto", business: "loja de materiais de construção", city: "Belo Horizonte", team: "5 vendedores", challenge: "cada vendedor usa seu próprio WhatsApp e ele não tem controle" },
    ]
  },
  {
    id: "clinicas", label: "Clínicas e Saúde", icon: "🏥", description: "Clínica ou consultório com agendamentos",
    personas: [
      { name: "Dra. Mariana", business: "clínica odontológica", city: "Salvador", team: "1 recepcionista", challenge: "pacientes não confirmam consulta e tem muito no-show" },
      { name: "Dr. Lucas", business: "clínica de estética", city: "Curitiba", team: "2 recepcionistas", challenge: "muitas mensagens de orçamento que nunca convertem" },
      { name: "Ana Paula", business: "clínica veterinária", city: "Fortaleza", team: "3 atendentes", challenge: "não consegue organizar retornos e vacinas dos pets" },
    ]
  },
  {
    id: "infoprodutos", label: "Infoprodutos / Digital", icon: "💻", description: "Negócio digital com vendas online",
    personas: [
      { name: "Thiago", business: "curso online de marketing digital", city: "São Paulo", team: "4 closers", challenge: "leads do tráfego pago esfriam rápido e o time não dá conta" },
      { name: "Juliana", business: "mentoria de finanças pessoais", city: "Brasília", team: "2 SDRs + 1 closer", challenge: "não tem funil de recuperação para quem não compra na primeira abordagem" },
      { name: "Rafael", business: "agência de lançamentos", city: "Rio de Janeiro", team: "6 atendentes", challenge: "cada lançamento gera milhares de mensagens e não tem como gerenciar" },
    ]
  },
  {
    id: "servicos", label: "Serviços Locais", icon: "⚖️", description: "Escritório ou prestador de serviço",
    personas: [
      { name: "Dr. Henrique", business: "escritório de advocacia", city: "Porto Alegre", team: "1 secretária + 2 advogados", challenge: "clientes mandam mensagem fora do horário e ninguém responde" },
      { name: "Patrícia", business: "escritório de contabilidade", city: "Campinas", team: "3 atendentes", challenge: "precisa enviar documentos e lembretes em massa mas faz tudo manual" },
      { name: "Marcos", business: "imobiliária", city: "Florianópolis", team: "8 corretores", challenge: "corretores saem e levam a carteira de clientes no WhatsApp pessoal" },
    ]
  }
];

const DIFFICULTIES = [
  {
    id: "basico", label: "Básico", desc: "Cliente receptivo, objeções leves", icon: User, color: "#2ECC71",
    instruction: "Você é um cliente RECEPTIVO. Faça 1-2 objeções leves por etapa mas ceda relativamente fácil quando o vendedor argumenta bem. Demonstre interesse genuíno pela solução. Faça perguntas construtivas."
  },
  {
    id: "intermediario", label: "Intermediário", desc: "Cliente resistente mas aberto", icon: MessageCircle, color: "#F39C12",
    instruction: "Você é um cliente RESISTENTE MAS ABERTO. Faça 2-3 objeções por etapa, incluindo preço e comparação com concorrentes. Não ceda fácil, exija argumentos sólidos. Questione números e promessas. Mas se o vendedor demonstrar valor real, vá abrindo."
  },
  {
    id: "avancado", label: "Avançado", desc: "Cliente difícil, múltiplas objeções", icon: Zap, color: "#E74C3C",
    instruction: "Você é um cliente DIFÍCIL. Faça múltiplas objeções seguidas, questione tudo, compare com concorrentes, diga que achou caro, que precisa falar com o sócio, que vai pensar. Seja desconfiado, impaciente e direto. Só ceda se o vendedor realmente demonstrar valor excepcional e lidar com todas as objeções com maestria. Tente encerrar a conversa pelo menos 2 vezes."
  }
];

const EVAL_PROMPT = `Analise a conversa de roleplay de vendas abaixo e dê uma avaliação em português brasileiro.

IMPORTANTE: Responda APENAS com um JSON válido, sem nenhum texto antes ou depois, sem markdown. O formato EXATO deve ser:
{
  "criterios": {
    "abordagem": { "nota": 8, "comentario": "comentário curto aqui" },
    "sondagem": { "nota": 7, "comentario": "comentário curto aqui" },
    "conexao": { "nota": 6, "comentario": "comentário curto aqui" },
    "valor": { "nota": 8, "comentario": "comentário curto aqui" },
    "objecoes": { "nota": 7, "comentario": "comentário curto aqui" },
    "fechamento": { "nota": 5, "comentario": "comentário curto aqui" }
  },
  "nota_geral": 6.8,
  "acertos": ["acerto 1", "acerto 2", "acerto 3"],
  "melhorias": ["melhoria 1", "melhoria 2", "melhoria 3"],
  "dica_ouro": "Uma dica de ouro para a próxima simulação"
}

Critérios:
1. ABORDAGEM: Se apresentou bem e capturou atenção?
2. SONDAGEM: Fez perguntas abertas para entender a dor?
3. CONEXÃO: Demonstrou credibilidade e empatia?
4. VALOR: Focou em benefícios (não só funcionalidades)?
5. OBJEÇÕES: Lidou bem com as resistências?
6. FECHAMENTO: Conduziu para a ação com segurança?

Notas de 1 a 10 cada. Comentários com no máximo 15 palavras. Seja justo e construtivo.`;

// ============ API E WEBHOOK CONFIG ============
const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const WEBHOOK_URL = `${API_BASE_URL}/api/webhook`;

async function sendToSheets(data) {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) console.error("Falha ao salvar. Veja os logs do terminal do Backend Node.");
  } catch (e) {
    console.error("Erro ao enviar via proxy:", e);
  }
}

export default function JetsalesRoleplay() {
  const [screen, setScreen] = useState("login");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [segment, setSegment] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [persona, setPersona] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evalRaw, setEvalRaw] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentEtapa, setCurrentEtapa] = useState(1);
  const [showTip, setShowTip] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false); // New state
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (screen === "chat") inputRef.current?.focus();
  }, [screen]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const startSimulation = () => {
    const seg = SEGMENTS.find(s => s.id === segment);
    const randomPersona = seg.personas[Math.floor(Math.random() * seg.personas.length)];
    setPersona(randomPersona);
    setMessages([]);
    setConversationHistory([]);
    setCurrentEtapa(1);
    setEvaluation(null);
    setEvalRaw(null);
    setStartTime(new Date());
    setIsFinished(false); // Reset on new simulation
    setScreen("chat");

    const systemContent = `${JETSALES_CONTEXT}

PERFIL DO CLIENTE QUE VOCÊ ESTÁ INTERPRETANDO:
- Nome: ${randomPersona.name}
- Negócio: ${randomPersona.business}
- Cidade: ${randomPersona.city}
- Equipe: ${randomPersona.team}
- Principal desafio: ${randomPersona.challenge}

NÍVEL DE DIFICULDADE: ${DIFFICULTIES.find(d => d.id === difficulty).label}
${DIFFICULTIES.find(d => d.id === difficulty).instruction}

IMPORTANTE:
- Você JÁ INICIOU a conversa enviando: "Quero mais informações sobre como automatizar meus atendimentos."
- Agora ESPERE o vendedor responder e reaja de forma natural a partir daí
- Suas respostas devem ser curtas e naturais (estilo WhatsApp)
- Vá evoluindo nas etapas conforme a conversa avança
- Mencione naturalmente detalhes do seu perfil quando fizer sentido`;

    const firstClientMsg = "Quero mais informações sobre como automatizar meus atendimentos.";

    setConversationHistory([
      { role: "system", content: systemContent },
      { role: "assistant", content: firstClientMsg }
    ]);

    setTimeout(() => {
      setMessages([
        {
          role: "system",
          content: `🎯 Simulação iniciada!\n\nVocê é o consultor de vendas da Jetsales Brasil.\nSeu cliente: ${randomPersona.name} — ${randomPersona.business} em ${randomPersona.city}, com ${randomPersona.team}.\n\nO lead acabou de enviar uma mensagem. Responda como faria no WhatsApp!`
        },
        {
          role: "assistant",
          content: firstClientMsg
        }
      ]);
    }, 300);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || isFinished) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const newHistory = [...conversationHistory, { role: "user", content: userMsg }];
    const apiMessages = newHistory.slice(1).map(m => ({
      role: m.role === "system" ? "user" : m.role,
      content: m.content
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.7,
          messages: [
            { role: "system", content: newHistory[0].content },
            ...apiMessages
          ]
        })
      });
      const data = await response.json();
      const assistantMsg = data.choices?.[0]?.message?.content || "...";
      setMessages(prev => [...prev, { role: "assistant", content: assistantMsg }]);
      const fullHistory = [...newHistory, { role: "assistant", content: assistantMsg }];
      setConversationHistory(fullHistory);

      const msgCount = fullHistory.filter(m => m.role === "user").length;
      if (msgCount >= 2) setCurrentEtapa(prev => Math.max(prev, 2));
      if (msgCount >= 4) setCurrentEtapa(prev => Math.max(prev, 3));
      if (msgCount >= 6) setCurrentEtapa(prev => Math.max(prev, 4));
      if (msgCount >= 8) setCurrentEtapa(prev => Math.max(prev, 5));
      if (msgCount >= 10) setCurrentEtapa(prev => Math.max(prev, 6));
      if (msgCount >= 12) setCurrentEtapa(prev => Math.max(prev, 7));
      if (msgCount >= 14) setCurrentEtapa(prev => Math.max(prev, 8));
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Erro na conexão. Tente novamente." }]);
    }
    setLoading(false);
  };

  const finishAndEvaluate = async () => {
    setEvaluating(true);
    setIsFinished(true); // Mark simulation as finished
    setScreen("result");
    const endTime = new Date();

    const chatLog = messages
      .filter(m => m.role !== "system")
      .map(m => `${m.role === "user" ? "VENDEDOR" : "CLIENTE"}: ${m.content}`)
      .join("\n");

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2, // Temperatura mais baixa para avaliação estruturada (JSON)
          messages: [{
            role: "user",
            content: `${EVAL_PROMPT}\n\nCONTEXTO: O vendedor "${userName}" estava atendendo ${persona.name}, dono(a) de uma ${persona.business} em ${persona.city}, nível de dificuldade: ${DIFFICULTIES.find(d => d.id === difficulty).label}.\n\nCONVERSA:\n${chatLog}`
          }]
        })
      });
      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || "";

      let parsed = null;
      try {
        const clean = rawText.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        parsed = null;
      }

      setEvalRaw(parsed);

      if (parsed) {
        // Send to Google Sheets
        const sheetData = {
          timestamp: endTime.toISOString(),
          nome: userName,
          email: userEmail,
          segmento: SEGMENTS.find(s => s.id === segment)?.label || segment,
          dificuldade: DIFFICULTIES.find(d => d.id === difficulty)?.label || difficulty,
          persona_nome: persona.name,
          persona_negocio: persona.business,
          persona_cidade: persona.city,
          nota_abordagem: parsed.criterios?.abordagem?.nota || 0,
          nota_sondagem: parsed.criterios?.sondagem?.nota || 0,
          nota_conexao: parsed.criterios?.conexao?.nota || 0,
          nota_valor: parsed.criterios?.valor?.nota || 0,
          nota_objecoes: parsed.criterios?.objecoes?.nota || 0,
          nota_fechamento: parsed.criterios?.fechamento?.nota || 0,
          nota_geral: parsed.nota_geral || 0,
          acertos: (parsed.acertos || []).join(" | "),
          melhorias: (parsed.melhorias || []).join(" | "),
          dica_ouro: parsed.dica_ouro || "",
          conversa_completa: chatLog,
          duracao_minutos: Math.round((endTime - startTime) / 60000)
        };
        sendToSheets(sheetData);
      }

      setEvaluation(parsed ? "ok" : rawText);
    } catch {
      setEvaluation("⚠️ Erro ao gerar avaliação.");
    }
    setEvaluating(false);
  };

  const etapaLabels = ["Abordagem", "Sondagem", "Conexão", "ROI", "Produto", "Funções", "Preço", "Fechamento"];
  const tipsByEtapa = [
    "Apresente-se, diga seu nome e o da Jetsales. Pergunte se pode seguir com o atendimento.",
    "Faça perguntas abertas: qual o maior desafio? Quantas pessoas atendem? Usam tráfego pago?",
    "Mostre que já atendeu empresas do mesmo segmento. Compartilhe um case rápido.",
    "Pergunte ticket médio e volume de conversas. Projete o aumento de 10% no faturamento.",
    "Fale do número único, atendimento de qualquer lugar, acompanhamento em tempo real.",
    "Destaque chatbot, notas internas, Kanban e funil de remarketing (37% de recuperação).",
    "Não dê preço direto. Reforce o valor e apresente planos com descontos progressivos.",
    "Pergunte: com qual plano vamos avançar? Ofereça o teste de 7 dias."
  ];

  const criterioLabels = {
    abordagem: { label: "Abordagem", icon: "👋" },
    sondagem: { label: "Sondagem", icon: "🔍" },
    conexao: { label: "Conexão", icon: "🤝" },
    valor: { label: "Valor", icon: "💎" },
    objecoes: { label: "Objeções", icon: "🛡️" },
    fechamento: { label: "Fechamento", icon: "🎯" }
  };

  function getNotaColor(nota) {
    if (nota >= 8) return "#1DB954";
    if (nota >= 6) return "#F39C12";
    if (nota >= 4) return "#E67E22";
    return "#E74C3C";
  }

  // Common Header for all screens
  const CommonHeader = ({ screen, finishAndEvaluate, messages, isFinished, evaluating }) => (
    <header className="glass-header text-white px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="h-8 rounded-md bg-white flex items-center justify-center px-2 py-1">
          <img src={logo} alt="Jetsales Brasil" className="h-full w-auto object-contain" />
        </div>
        <div className="hidden sm:block border-l border-white/20 pl-3">
          <span className="text-[10px] text-jet-neon font-bold tracking-widest uppercase">Roleplay Simulator</span>
        </div>
      </div>
      {screen === 'chat' && (
        <button
          onClick={finishAndEvaluate}
          disabled={messages?.length < 3 || isFinished || evaluating}
          className="btn-secondary text-sm py-2 px-4 shadow-sm"
        >
          {evaluating ? 'Gerando Relatório...' : 'Finalizar Simulação'}
        </button>
      )}
    </header>
  );

  // ===================== LOGIN SCREEN =====================
  if (screen === "login") {
    const canProceed = userName.trim().length >= 2 && isValidEmail(userEmail);
    return (
      <div className="h-screen overflow-hidden bg-jet-bg text-white flex flex-col font-sans">
        <CommonHeader screen={screen} />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center mb-6 max-w-md">
            <div className="inline-flex items-center gap-2 bg-jet-neon/10 border border-jet-neon/20 rounded-full px-3 py-1 mb-4">
              <span className="text-sm">🚀</span>
              <span className="text-[10px] font-bold tracking-widest text-jet-neon uppercase">Treinamento Inicial</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight">
              Simulador de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-jet-neon to-blue-400">Roleplay</span>
            </h1>
            <p className="text-sm text-gray-400 m-0 leading-relaxed">
              Identifique-se para iniciar o treinamento.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-auto shadow-lg">
            <div className="mb-5">
              <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">
                Seu nome
              </label>
              <input
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="Ex: João Silva"
                className="input-field"
                onKeyDown={e => e.key === "Enter" && canProceed && setScreen("home")}
              />
            </div>
            <div className="mb-7">
              <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">
                Seu e-mail
              </label>
              <input
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                placeholder="Ex: joao@jetsales.com.br"
                type="email"
                className="input-field"
                onKeyDown={e => e.key === "Enter" && canProceed && setScreen("home")}
              />
            </div>
            <button
              onClick={() => setScreen("home")}
              disabled={!canProceed}
              className="btn-primary w-full py-3 text-sm mt-2"
            >
              Continuar →
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ===================== HOME SCREEN =====================
  if (screen === "home") {
    return (
      <div className="h-screen overflow-hidden bg-jet-bg text-white flex flex-col font-sans">
        <CommonHeader screen={screen} />
        <main className="flex-1 flex flex-col items-center p-4 overflow-y-auto custom-scrollbar">
          <div className="text-center mb-6 max-w-xl shrink-0">
            <div className="inline-flex items-center gap-2 bg-jet-neon/10 border border-jet-neon/20 rounded-full px-3 py-1 mb-3">
              <span className="text-sm">🎯</span>
              <span className="text-[10px] font-bold tracking-widest text-jet-neon uppercase">Seleção de Cenário</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-1 leading-tight">
              Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-jet-neon to-blue-400">{userName.split(" ")[0]}</span>!
            </h1>
            <p className="text-xs text-gray-400 m-0 leading-relaxed">
              Escolha o cenário para seu treino de vendas.
            </p>
          </div>

          <div className="max-w-2xl w-full mb-6 shrink-0">
            <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-3 px-1">
              Segmento do cliente
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SEGMENTS.map(seg => {
                const active = segment === seg.id;
                return (
                  <button key={seg.id} onClick={() => setSegment(seg.id)} className={`
                    relative p-3 rounded-xl text-center transition-all duration-250 flex flex-col items-center justify-center h-28
                    ${active ? "bg-jet-neon/15 border-jet-neon/50 scale-[1.02]" : "bg-white/5 border-white/10 hover:border-white/20"}
                    border-2
                  `}>
                    {active && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-jet-neon to-blue-400 rounded-t-xl" />}
                    <div className="text-2xl mb-1.5">{seg.icon}</div>
                    <div className="text-sm font-bold mb-0.5">{seg.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-w-2xl w-full mb-6 shrink-0">
            <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-3 px-1">
              Nível de dificuldade
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DIFFICULTIES.map(diff => {
                const active = difficulty === diff.id;
                const IconComponent = diff.icon;
                return (
                  <button key={diff.id} onClick={() => setDifficulty(diff.id)} className={`
                    flex-1 relative p-3 rounded-xl text-left transition-all duration-250
                    ${active ? "bg-jet-neon/10 border-white/30" : "bg-white/5 border-white/10 hover:border-white/20"}
                    border-2 flex items-center justify-between
                  `}>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center p-1.5 rounded-md ${active ? 'bg-white/10' : 'bg-black/20'}`}>
                        <IconComponent size={18} color={diff.color} />
                      </span>
                      <div>
                        <div className="text-sm font-bold text-white">{diff.label}</div>
                        <div className="text-[10px] text-gray-400 line-clamp-1">{diff.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={startSimulation} disabled={!segment || !difficulty} className="btn-primary px-14 py-4 text-base">
            Iniciar Simulação →
          </button>
        </main>
      </div>
    );
  }

  // ===================== CHAT SCREEN =====================
  if (screen === "chat") {
    const diff = DIFFICULTIES.find(d => d.id === difficulty);
    return (
      <div className="h-screen flex flex-col bg-jet-bg font-sans text-white">
        <CommonHeader screen={screen} finishAndEvaluate={finishAndEvaluate} messages={messages} isFinished={isFinished} evaluating={evaluating} />

        <div className="bg-jet-surface border-b border-jet-border p-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-jet-neon to-blue-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {persona?.name?.charAt(0)}
            </div>
            <div>
              <div className="text-base font-bold leading-tight">{persona?.name}</div>
              <div className="text-xs text-gray-400">{persona?.business} • {persona?.city}</div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setShowTip(!showTip)} className={`
              btn-ghost text-xs font-semibold py-2 px-3 rounded-lg
              ${showTip ? "bg-jet-neon/20 text-jet-neon" : "text-gray-400 hover:bg-white/5"}
            `}>
              <Lightbulb size={14} className="inline-block mr-1" /> Dica
            </button>
          </div>
        </div>

        <div className="bg-jet-surface border-b border-jet-border py-2 px-3 flex gap-1 items-center flex-shrink-0 overflow-x-auto custom-scrollbar">
          {etapaLabels.map((label, i) => {
            const isActive = i + 1 === currentEtapa;
            const isDone = i + 1 < currentEtapa;
            return (
              <div key={i} className={`
                flex-none py-1.5 px-3 rounded-full text-xs font-bold whitespace-nowrap
                ${isActive ? "bg-gradient-to-r from-jet-neon to-blue-600 text-white" :
                  isDone ? "bg-green-600/20 text-green-400" : "bg-white/5 text-gray-500"}
              `}>
                {isDone ? <CheckCircle size={12} className="inline-block mr-1" /> : ""}{label}
              </div>
            );
          })}
        </div>

        {showTip && (
          <div className="bg-jet-neon/10 border-b border-jet-neon/20 p-3 text-sm text-jet-neon-light flex justify-between items-start gap-3 leading-relaxed flex-shrink-0">
            <span>💡 <strong>Etapa {currentEtapa} — {etapaLabels[currentEtapa - 1]}:</strong> {tipsByEtapa[currentEtapa - 1]}</span>
            <button onClick={() => setShowTip(false)} className="text-gray-500 hover:text-gray-300 text-xl leading-none p-0 flex-shrink-0">×</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex w-full ${msg.role === "user" ? "justify-end" : msg.role === "system" ? "justify-center" : "justify-start"}`}>
              {msg.role === "system" ? (
                <div className="bg-jet-neon/10 border border-jet-neon/20 rounded-xl p-3 text-xs text-jet-neon-light max-w-[88%] text-center leading-relaxed whitespace-pre-line">
                  {msg.content}
                </div>
              ) : (
                <div className={`
                  bubble-base shadow-md
                  ${msg.role === "user" ? "bubble-user" : "bubble-ai"}
                `}>
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start fade-in">
              <div className="bubble-ai px-4 py-3 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-jet-neon animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-jet-neon animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-jet-neon animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="bg-jet-surface border-t border-jet-border p-3 flex gap-3 items-end flex-shrink-0">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Digite aqui..."
            className="input-field min-h-[44px] max-h-24 resize-none custom-scrollbar text-sm"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || isFinished}
            className="btn-primary p-3 flex-shrink-0"
            title="Enviar mensagem"
          >
            <Send size={20} className="text-jet-bg" />
          </button>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }

          .glass-header {
            background: linear-gradient(180deg, rgba(0,30,60,0.95) 0%, rgba(0,20,45,0.9) 100%);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0,168,232,0.1);
          }

          .input-field {
            flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
            border-radius: 0.875rem; padding: 0.8125rem 1.125rem; font-size: 0.875rem; color: #fff; outline: none;
            box-sizing: border-box; transition: border 0.2s;
          }
          .input-field:focus { border-color: rgba(0,168,232,0.4); }

          .btn-primary {
            background: linear-gradient(135deg, #00A8E8, #0068d6); border: none;
            border-radius: 0.875rem; font-weight: 700; color: #fff; cursor: pointer;
            transition: all 0.3s; box-shadow: 0 6px 24px rgba(0,168,232,0.25);
          }
          .btn-primary:disabled {
            background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
            color: #3a5060; cursor: not-allowed; box-shadow: none;
          }
          .btn-secondary {
            background: linear-gradient(135deg, #1DB954, #17a348); border: none;
            border-radius: 0.5rem; font-weight: 700; color: #fff; cursor: pointer;
            transition: all 0.3s; box-shadow: 0 4px 16px rgba(29,185,84,0.2);
          }
          .btn-secondary:disabled {
            background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
            color: #3a5060; cursor: not-allowed; box-shadow: none;
          }
          .btn-ghost {
            background: none; border: none;
            transition: background 0.2s, color 0.2s;
          }
          .btn-ghost:hover { background: rgba(255,255,255,0.05); }

          .bubble-base {
            padding: 0.6875rem 0.9375rem; font-size: 0.84375rem; line-height: 1.55; color: #dce8f0;
          }
          .bubble-user {
            background: linear-gradient(135deg, #0057B8, #003a7a);
            border-radius: 1.125rem 1.125rem 0.25rem 1.125rem;
          }
          .bubble-ai {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.04);
            border-radius: 1.125rem 1.125rem 1.125rem 0.25rem;
          }

          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-4px); }
          }
          .animate-bounce { animation: bounce 1.4s infinite; }

          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .animate-spin-fast { animation: spin 1s linear infinite; }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .slide-up { animation: slideUp 0.3s ease-out forwards; }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .fade-in { animation: fadeIn 0.3s ease-out forwards; }
        `}</style>
      </div>
    );
  }

  // ===================== RESULT SCREEN =====================
  if (screen === "result") {
    const diff = DIFFICULTIES.find(d => d.id === difficulty);
    const activeSegment = SEGMENTS.find(s => s.id === segment);
    return (
      <div className="h-screen overflow-y-auto flex flex-col bg-jet-bg font-sans text-white p-4 md:p-6 items-center justify-start custom-scrollbar">
        <div className="w-full max-w-3xl pb-8">
          <CommonHeader screen={screen} finishAndEvaluate={finishAndEvaluate} messages={messages} isFinished={isFinished} evaluating={evaluating} />

          <div className="bg-jet-surface border border-jet-border rounded-2xl p-5 md:p-6 mb-5 text-center mt-4">
            <h2 className="text-xl md:text-2xl font-bold text-jet-neon mb-2">Simulação Concluída!</h2>
            <p className="text-jet-text-light text-sm md:text-base">
              Você concluiu a simulação de <span className="font-semibold text-white">{activeSegment?.label}</span> no nível <span className="font-semibold text-white">{diff?.label}</span>.
            </p>
          </div>

          {evaluating ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin-fast rounded-full h-16 w-16 border-t-2 border-b-2 border-jet-neon mb-4"></div>
              <p className="text-jet-text-light text-lg">Avaliando sua performance...</p>
            </div>
          ) : evalRaw ? (
            <div className="space-y-4">
              <div className="bg-jet-surface border border-jet-border rounded-2xl p-5 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">Sua Pontuação: <span className="text-jet-neon">{evalRaw.nota_geral}</span> / 10</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm md:text-base">
                  <div>
                    <p className="text-jet-text-light">Abordagem:</p>
                    <p className="font-semibold text-white">{evalRaw.criterios?.abordagem?.nota}/10</p>
                  </div>
                  <div>
                    <p className="text-jet-text-light">Sondagem:</p>
                    <p className="font-semibold text-white">{evalRaw.criterios?.sondagem?.nota}/10</p>
                  </div>
                  <div>
                    <p className="text-jet-text-light">Conexão:</p>
                    <p className="font-semibold text-white">{evalRaw.criterios?.conexao?.nota}/10</p>
                  </div>
                  <div>
                    <p className="text-jet-text-light">Geração de Valor:</p>
                    <p className="font-semibold text-white">{evalRaw.criterios?.valor?.nota}/10</p>
                  </div>
                  <div>
                    <p className="text-jet-text-light">Contornar Objeções:</p>
                    <p className="font-semibold text-white">{evalRaw.criterios?.objecoes?.nota}/10</p>
                  </div>
                  <div>
                    <p className="text-jet-text-light">Fechamento:</p>
                    <p className="font-semibold text-white">{evalRaw.criterios?.fechamento?.nota}/10</p>
                  </div>
                </div>
              </div>

              <div className="bg-jet-surface border border-jet-border rounded-2xl p-5 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">Feedback Detalhado</h3>

                <div className="bg-green-600/10 border border-green-600/20 rounded-xl p-4 mb-4">
                  <div className="text-xs font-bold tracking-wider text-green-400 uppercase mb-2">✅ Pontos Fortes</div>
                  {(evalRaw.acertos || []).map((p, i) => (
                    <div key={i} className="text-sm text-green-200 mb-1 leading-relaxed">{p}</div>
                  ))}
                </div>

                <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-xl p-4">
                  <div className="text-xs font-bold tracking-wider text-yellow-400 uppercase mb-2">📈 Oportunidades de Melhoria</div>
                  {(evalRaw.melhorias || []).map((m, i) => (
                    <div key={i} className="text-sm text-yellow-200 mb-1 leading-relaxed">{m}</div>
                  ))}
                </div>
              </div>

              {evalRaw.dica_ouro && (
                <div className="bg-blue-600/10 border border-blue-600/20 rounded-2xl p-5 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">💎 Dica de Ouro</h3>
                  <p className="text-blue-200 text-sm md:text-base leading-relaxed">{evalRaw.dica_ouro}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-jet-surface border border-jet-border rounded-2xl p-6 md:p-8 text-center text-jet-text-light text-base md:text-lg">
              {evaluation}
            </div>
          )}

          {!evaluating && (
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button onClick={() => { setScreen("home"); setSegment(null); setDifficulty(null); setEvaluation(null); setEvalRaw(null); }} className="btn-ghost py-3 px-6 text-base font-semibold text-jet-text-light hover:bg-white/5 rounded-xl">
                ← Novo Cenário
              </button>
              <button onClick={() => { setEvaluation(null); setEvalRaw(null); startSimulation(); }} className="btn-primary py-3 px-8 text-base">
                Jogar Novamente →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
