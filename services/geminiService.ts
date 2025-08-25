import { GoogleGenAI, Type } from "@google/genai";
import { User, CharacterPower, AiSuggestedTask } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generateInsightPrompt = (user: User) => {
  const historySummary = user.taskHistory
    .map(log => `- Tarefa: ${user.tasks.find(t => t.id === log.taskId)?.name}, Agendado: ${new Date(log.scheduledTime).toLocaleString('pt-BR')}, Status: ${log.status}`)
    .join('\n');
    
  const medicationSummary = user.tasks
    .filter(t => t.taskType === 'medication')
    .map(t => `- Medicamento: ${t.name}, Dosagem: ${t.dosage || 'N/A'}, Instruções: ${t.instructions || 'N/A'}`)
    .join('\n');

  return `
    Você é o Sync, um mascote de IA amigável e encorajador para o aplicativo de apoio a neurodivergentes, NeuroSync AI.
    Sua personalidade é como a de um guia de videogame: positiva, motivacional e cheia de dicas.
    Analise os dados do Herói ${user.name} e forneça insights de apoio em português do Brasil.
    
    Dados do Herói:
    - Nome: ${user.name}
    - Poder Escolhido: ${user.characterPower}
    - Medicamentos Atuais: ${medicationSummary || "Nenhum registrado."}
    
    Histórico de Tarefas (últimos registros):
    ${historySummary}
    
    Fale diretamente com o usuário ("Percebi que você...", "Que tal...").
    A 'analysis' deve ser uma observação curta e empática.
    A 'recommendation' deve ser uma sugestão prática e positiva, como uma dica de jogo.
    Retorne em formato JSON.
  `;
};

export const getTaskInsights = async (user: User): Promise<{ analysis: string; recommendation: string } | null> => {
  if (!API_KEY) {
    return {
        analysis: "Olá, Herói! Minha análise está offline no momento.",
        recommendation: "Peça para meu criador configurar a chave de API do Gemini para eu poder te ajudar melhor!"
    };
  }
  
  if (!user.taskHistory || user.taskHistory.length < 2) {
      return {
          analysis: `Olá, ${user.name}! Estou pronto para a aventura!`,
          recommendation: "Continue registrando suas missões para que eu possa te dar dicas e truques secretos!"
      }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: generateInsightPrompt(user),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.STRING,
              description: 'Uma breve e solidária análise do padrão de tarefas do usuário em português.',
            },
            recommendation: {
              type: Type.STRING,
              description: 'Uma sugestão acionável e positiva para melhorar o engajamento em português.',
            },
          },
          required: ['analysis', 'recommendation']
        },
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result;

  } catch (error) {
    console.error("Error fetching insights from Gemini API:", error);
    return {
        analysis: "Ops! Minhas antenas estão com um pouco de interferência.",
        recommendation: "Não consegui processar os dados agora. Vamos tentar de novo mais tarde!"
    };
  }
};

const generateMissionsPrompt = (power: CharacterPower) => {
    const powerDescription = {
        focus: "Foco (para ajudar com concentração e produtividade, como em casos de TDAH)",
        memory: "Memória (para auxiliar na lembrança de tarefas e informações importantes)",
        calm: "Calma (para gerenciar ansiedade e estresse com técnicas de relaxamento)"
    };

    return `
    Você é Sync, o mascote e mestre de missões do aplicativo NeuroSync AI.
    Sua tarefa é criar 2 "missões" diárias, como em um RPG, para um Herói que escolheu o poder de "${powerDescription[power]}".
    As missões devem ser pequenas, acionáveis, positivas e ter nomes criativos de fantasia/RPG.
    
    Exemplos para Foco: 
    - Nome: "Ritual do Foco Arcano". Descrição: "Concentre seus poderes! Use um timer de 25 min para uma tarefa e depois descanse por 5 min para recarregar."
    - Nome: "Limpeza do Santuário". Descrição: "Um ambiente limpo fortalece a mente. Organize sua mesa por 10 minutos para criar uma zona de poder."
    
    Exemplos para Memória:
    - Nome: "Feitiço da Previsão". Descrição: "Olhe para o futuro! Revise seu grimório de tarefas de amanhã antes de dormir."
    - Nome: "Coletar Orbes de Memória". Descrição: "Fortaleça sua mente! Tente lembrar 3 coisas boas (orbes) que aconteceram hoje."

    Exemplos para Calma:
    - Nome: "Sopro do Dragão Sereno". Descrição: "Controle sua energia. Inspire por 4s, segure por 7s, expire por 8s. Repita 3 vezes."
    - Nome: "Poção Sonora da Paz". Descrição: "Restaure sua mana. Faça uma pausa de 5 minutos para ouvir uma música relaxante."

    Retorne as missões em um formato JSON. O 'reminderType' deve ser 'game' ou 'alarm'. Seja criativo e mantenha o tom de um jogo.
    `;
}


export const getSuggestedTasks = async (power: CharacterPower): Promise<AiSuggestedTask[]> => {
    if(!API_KEY) return [];

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: generateMissionsPrompt(power),
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            reminderType: { type: Type.STRING }
                        },
                        required: ['name', 'description', 'reminderType']
                    }
                }
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result;

    } catch (error) {
        console.error("Error fetching suggested tasks from Gemini API:", error);
        return [];
    }
}