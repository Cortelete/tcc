import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { getMotivationalPhrase, getCheckInQuestion, analyzeCheckInResponse, getThinkingPhrase } from '../services/geminiService';

interface MascotProps {
    user: UserProfile;
    systemMessage: string | null;
}

type Interaction = {
    type: 'phrase' | 'question' | 'thinking';
    message: string;
    question?: {
        text: string;
        options: string[];
    };
};

const Mascot: React.FC<MascotProps> = ({ user, systemMessage }) => {
    const [interaction, setInteraction] = useState<Interaction | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const clickCount = useRef(0);
    const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearInteraction = () => {
        if (interactionTimeout.current) {
            clearTimeout(interactionTimeout.current);
        }
        interactionTimeout.current = setTimeout(() => {
            setInteraction(null);
        }, 8000); // Hide message after 8 seconds of inactivity
    };
    
    useEffect(() => {
        if (systemMessage) {
            setInteraction({ type: 'phrase', message: systemMessage });
            clearInteraction();
        }
    }, [systemMessage]);

    const handleMascotClick = async () => {
        if (isLoading) return;

        setIsLoading(true);
        clickCount.current += 1;

        // Step 1: Show immediate "thinking" message
        const thinkingPhrase = await getThinkingPhrase(user.name);
        setInteraction({ type: 'thinking', message: thinkingPhrase });

        // Clear any existing timeout
        if (interactionTimeout.current) clearTimeout(interactionTimeout.current);

        try {
            // Step 2: Fetch the complete response in the background
            if (clickCount.current % 5 === 0) {
                // Every 5th click, ask a check-in question
                const questionData = await getCheckInQuestion(user);
                setInteraction({
                    type: 'question',
                    message: questionData.questionText,
                    question: {
                        text: questionData.questionText,
                        options: questionData.options,
                    },
                });
            } else {
                // Otherwise, get a motivational phrase
                const phrase = await getMotivationalPhrase(user);
                setInteraction({ type: 'phrase', message: phrase });
            }
        } catch (error) {
            console.error("Error with mascot interaction:", error);
            setInteraction({ type: 'phrase', message: "Desculpe, tive um probleminha para me conectar. Tente novamente em um instante!" });
        } finally {
            setIsLoading(false);
            clearInteraction();
        }
    };

    const handleOptionClick = async (option: string) => {
        if (isLoading || !interaction || interaction.type !== 'question') return;

        setIsLoading(true);
        setInteraction({ type: 'thinking', message: "Entendi, obrigado por compartilhar. Analisando..." });
        
        if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
        
        try {
            const analysis = await analyzeCheckInResponse(user, interaction.question.text, option);
            setInteraction({ type: 'phrase', message: analysis });
        } catch (error) {
             console.error("Error analyzing check-in response:", error);
             setInteraction({ type: 'phrase', message: "Obrigado pelo seu feedback. Continue firme!" });
        } finally {
            setIsLoading(false);
            clearInteraction();
        }
    };


    return (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end mascot-container">
           {interaction && (
                <div className="w-64 md:w-80 mb-2 speech-bubble" aria-live="polite">
                     <div className="p-4 rounded-2xl shadow-2xl glass-card border-2 border-violet-500/50" style={{background: 'rgba(15, 23, 42, 0.9)'}}>
                        <p className="text-sm text-white/90">{interaction.message}</p>
                        {interaction.type === 'question' && interaction.question && (
                            <div className="mt-3 space-y-2">
                                {interaction.question.options.map(option => (
                                    <button 
                                        key={option}
                                        onClick={() => handleOptionClick(option)}
                                        className="w-full text-left text-sm bg-black/30 hover:bg-violet-500/30 p-2 rounded-lg transition-colors"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                         {interaction.type === 'thinking' && (
                            <div className="flex justify-center items-center gap-1.5 mt-2">
                                <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></span>
                                <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                            </div>
                         )}
                    </div>
                </div>
            )}
            <button 
                onClick={handleMascotClick} 
                disabled={isLoading}
                className="w-20 h-20 md:w-24 md:h-24 cursor-pointer drop-shadow-lg hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:ring-opacity-50 rounded-full"
                aria-label="Mascote Sync, clique para uma dica"
            >
                <img src="/mascot.png" alt="Mascote Sync" />
            </button>
        </div>
    );
};

export default Mascot;