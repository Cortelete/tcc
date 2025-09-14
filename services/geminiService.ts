// FIX: Implement the geminiService to interact with the Google GenAI API.
import { GoogleGenAI, Type } from "@google/genai";
import { User, AiInsight, CharacterPower, AiSuggestedTask, ReminderType } from '../types';

// FIX: Initialize GoogleGenAI with a named apiKey parameter as per the coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes user task history to provide insights and recommendations.
 */
export async function getTaskInsights(user: User): Promise<AiInsight> {
    const prompt = `
        Analise o histórico de tarefas do seguinte usuário e forneça um insight e uma recomendação.
        O usuário é ${user.name}, tem ${user.age} anos.
        Seu poder principal é: ${user.characterPower}.
        Sua condição é: ${user.patientCondition || 'Não informada'}.
        Seus desafios diários são: "${user.anamnesis?.challenges}".
        Aqui estão algumas de suas tarefas atuais: ${JSON.stringify(user.tasks.map(t => ({ name: t.name, criticality: t.criticality })))}.
        Este é o histórico recente de conclusão (últimos 10 registros): ${JSON.stringify(user.taskHistory.slice(-10))}.

        Sua análise deve ser concisa, focando na aderência recente (ex: pontualidade, falhas).
        Sua recomendação deve ser uma dica prática e motivadora para ajudar o usuário a melhorar ou a manter o bom trabalho.
        Use uma linguagem encorajadora e positiva, falando diretamente com o usuário (ex: "Percebi que você...").
        Seja breve e direto ao ponto.
    `;

    try {
        // FIX: Use ai.models.generateContent as per the coding guidelines.
        const response = await ai.models.generateContent({
            // FIX: Use 'gemini-2.5-flash' model for general text tasks.
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
        
        // FIX: Access the text directly from the response object and parse it.
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
        // FIX: Use ai.models.generateContent for generating content.
        const response = await ai.models.generateContent({
            // FIX: Use 'gemini-2.5-flash' model for general text tasks.
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

        // FIX: Access the text directly and parse it.
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
