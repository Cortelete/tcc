import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AiInsight, CharacterPower, AiSuggestedTask, ReminderType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes user task history to provide insights and recommendations.
 */
export async function getTaskInsights(user: UserProfile): Promise<AiInsight> {
    const prompt = `
        Analise o histórico de tarefas do seguinte usuário e forneça um insight e uma recomendação.
        O usuário é ${user.name}.
        Seu poder principal é: ${user.characterPower}.
        Seus desafios diários são: "${user.anamnesis?.challenges || 'não especificado'}".
        Aqui estão algumas de suas tarefas atuais: ${JSON.stringify(user.tasks.map(t => ({ name: t.name, criticality: t.criticality })))}.
        Este é o histórico recente de conclusão (últimos 10 registros): ${JSON.stringify(user.taskHistory.slice(-10))}.

        Sua análise deve ser concisa, focando na aderência recente (ex: pontualidade, falhas).
        Sua recomendação deve ser uma dica prática e motivadora para ajudar o usuário a melhorar ou a manter o bom trabalho.
        Use uma linguagem encorajadora e positiva, falando diretamente com o usuário (ex: "Percebi que você...").
        Seja breve e direto ao ponto.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: {
                            type: Type.STRING,
                            description: "Análise concisa da aderência do usuário."
                        },
                        recommendation: {
                            type: Type.STRING,
                            description: "Recomendação acionável e encorajadora."
                        }
                    },
                    required: ["analysis", "recommendation"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("Error getting task insights from Gemini:", error);
        // Provide a fallback response on error
        return {
            analysis: "Não foi possível carregar a análise da IA no momento.",
            recommendation: "Continue focado em suas tarefas. Você está no caminho certo!"
        };
    }
}

/**
 * Suggests new daily tasks (missions) based on the user's selected power.
 */
export async function getSuggestedTasks(power: CharacterPower): Promise<AiSuggestedTask[]> {
    const powerDescriptions: Record<CharacterPower, string> = {
        focus: "foco e concentração",
        memory: "memória e lembrança de informações",
        calm: "calma, relaxamento e controle emocional",
        patient: "gerenciamento de rotinas de saúde e bem-estar"
    };

    const prompt = `
        Crie 3 sugestões de missões diárias curtas e envolventes para um usuário cujo poder principal é "${powerDescriptions[power]}".
        As missões devem ser práticas, simples e diretamente relacionadas ao desenvolvimento desse poder.
        
        - O nome da tarefa deve ser curto, criativo e motivador.
        - A descrição deve ser uma frase clara e concisa.
        - O reminderType deve ser um dos seguintes valores: 'alarm', 'sensitive', 'loud', 'call', 'game', 'whatsapp'. Escolha um que se encaixe na natureza da tarefa.

        Exemplos para 'foco': { name: "Foco de Monge", description: "Trabalhe por 25 minutos sem nenhuma distração.", reminderType: "game" }
        Exemplos para 'memória': { name: "Diário de um Herói", description: "Anote 3 coisas que você aprendeu hoje.", reminderType: "sensitive" }
        Exemplos para 'calma': { name: "Respiração do Dragão", description: "Faça 2 minutos de respiração profunda e lenta.", reminderType: "alarm" }
        Exemplos para 'patient': { name: "Check-up do Herói", description: "Verifique se seus medicamentos para amanhã estão organizados.", reminderType: "sensitive" }

        Retorne a resposta como uma lista de objetos JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: {
                                type: Type.STRING,
                                description: "Nome curto e motivador da missão."
                            },
                            description: {
                                type: Type.STRING,
                                description: "Descrição clara e breve da missão."
                            },
                            reminderType: {
                                type: Type.STRING,
                                enum: ['alarm', 'sensitive', 'loud', 'call', 'game', 'whatsapp'],
                                description: "Tipo de lembrete para a missão."
                            }
                        },
                        required: ["name", "description", "reminderType"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const result: AiSuggestedTask[] = JSON.parse(jsonText);
        // Ensure reminderType is valid.
        return result.map(task => ({ ...task, reminderType: task.reminderType as ReminderType }));

    } catch (error) {
        console.error("Error getting suggested tasks from Gemini:", error);
        // Return an empty array on error
        return [];
    }
}

/**
 * Generates a short motivational phrase for the user.
 */
export async function getMotivationalPhrase(user: UserProfile): Promise<string> {
    const prompt = `
        Crie uma frase motivacional curta e encorajadora para ${user.name}.
        O objetivo principal de ${user.name} é "${user.anamnesis?.mainGoal || 'não especificado'}".
        Seus desafios são: "${user.anamnesis?.challenges || 'não especificado'}".
        Seu poder principal é: ${user.characterPower}.
        A frase deve ser positiva, inspiradora e falar diretamente com ${user.name}. 
        Mantenha a frase com no máximo 20 palavras.
        Não inclua saudações como "Olá".
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting motivational phrase from Gemini:", error);
        return "Lembre-se do seu objetivo. Você é mais forte do que pensa!";
    }
}

/**
 * Generates a "thinking" phrase for the mascot. This is a non-API call for speed.
 */
export async function getThinkingPhrase(userName: string): Promise<string> {
    const phrases = [
        `Deixa eu ver, ${userName}...`,
        "Um momento, buscando algo especial para você...",
        `Hmm, o que temos aqui para o herói ${userName}?`,
        "Sincronizando pensamentos...",
        "Consultando os oráculos da produtividade...",
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
}


/**
 * Generates a check-in question for the user with multiple-choice options.
 */
export async function getCheckInQuestion(user: UserProfile): Promise<{ questionText: string; options: string[] }> {
    const prompt = `
        Crie uma pergunta de check-in rápida e gentil para o usuário ${user.name}, focando em seu bem-estar geral ou progresso em relação aos seus desafios ("${user.anamnesis?.challenges}").
        A pergunta deve ser de múltipla escolha. Forneça a pergunta e 3 ou 4 opções de resposta concisas.
        As opções devem cobrir uma gama de sentimentos (positivo, neutro, negativo).
        Exemplo de pergunta: "Como você está se sentindo hoje em relação à sua concentração?"
        Exemplo de opções: ["Muito focado!", "Normal, com altos e baixos.", "Um pouco disperso hoje."]
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questionText: {
                            type: Type.STRING,
                            description: "O texto da pergunta de check-in."
                        },
                        options: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            },
                            description: "Uma lista de 3 ou 4 opções de resposta."
                        }
                    },
                    required: ["questionText", "options"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error getting check-in question from Gemini:", error);
        return {
            questionText: "Como você está se sentindo hoje?",
            options: ["Estou bem!", "Mais ou menos.", "Preciso de um pouco de ajuda."]
        };
    }
}

/**
 * Analyzes the user's response to a check-in question and provides feedback.
 */
export async function analyzeCheckInResponse(user: UserProfile, question: string, answer: string): Promise<string> {
    const prompt = `
        O usuário ${user.name} respondeu a uma pergunta de check-in.
        Pergunta: "${question}"
        Resposta: "${answer}"
        Com base na resposta, forneça uma mensagem curta, empática e de apoio.
        Se a resposta for positiva, comemore com ele.
        Se a resposta for neutra, ofereça encorajamento.
        Se a resposta for negativa, ofereça uma dica gentil ou uma palavra de conforto, relacionada aos seus desafios ("${user.anamnesis?.challenges || 'não especificado'}").
        Mantenha a resposta com no máximo 30 palavras. Fale diretamente com o usuário.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error analyzing check-in response from Gemini:", error);
        return "Obrigado por compartilhar. Cada passo é importante na sua jornada!";
    }
}