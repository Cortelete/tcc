import React, { useState, useEffect } from 'react';
import { getMotivationalPhrase, getCheckInQuestion, analyzeCheckInResponse } from '../services/geminiService';
import { User } from '../types';

interface Interaction {
    type: 'phrase' | 'question' | 'analysis';
    text: string;
    question?: {
        text: string;
        options: string[];
    };
    selectedOption?: string;
}

interface MascotProps {
  systemMessage: string | null;
  user: User;
}

const Mascot: React.FC<MascotProps> = ({ systemMessage, user }) => {
    const [interaction, setInteraction] = useState<Interaction | null>(null);
    const [typedMessage, setTypedMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [clickCount, setClickCount] = useState(() => {
        return parseInt(localStorage.getItem(`neurosync-mascot-clicks-${user.id}`) || '0', 10);
    });

    // Function to handle typing effect
    const typeMessage = (message: string) => {
        setTypedMessage("");
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < message.length) {
                setTypedMessage(prev => prev + message[i]);
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 30);
        return () => clearInterval(typingInterval);
    };

    // Effect to show system messages
    useEffect(() => {
        if (systemMessage) {
            setInteraction({ type: 'phrase', text: systemMessage });
        }
    }, [systemMessage]);
    
    // Effect to handle the typing and auto-hiding of messages
    useEffect(() => {
        let cleanupTyping = () => {};
        let hideTimeout: NodeJS.Timeout;

        if (interaction) {
            cleanupTyping = typeMessage(interaction.text);
            
            // Auto-hide phrases and analysis, but not questions
            if (interaction.type === 'phrase' || interaction.type === 'analysis') {
                hideTimeout = setTimeout(() => {
                    setInteraction(null);
                }, 8000); // Hide after 8 seconds
            }
        } else {
            setTypedMessage("");
        }

        return () => {
            cleanupTyping();
            clearTimeout(hideTimeout);
        };
    }, [interaction?.text]); // Re-run only when the text to be displayed changes

    const handleMascotClick = async () => {
        if (isLoading || (interaction && interaction.type === 'question')) return;

        setIsLoading(true);
        const newClickCount = clickCount + 1;
        
        try {
            if (newClickCount % 5 === 0) {
                // Ask a question
                const questionData = await getCheckInQuestion();
                setInteraction({
                    type: 'question',
                    text: questionData.questionText,
                    // FIX: The 'question' object requires a 'text' property, not 'questionText'.
                    // We map the properties from questionData to a new object.
                    question: {
                        text: questionData.questionText,
                        options: questionData.options,
                    },
                });
            } else {
                // Show a phrase
                const phrase = await getMotivationalPhrase(user.characterPower);
                setInteraction({ type: 'phrase', text: phrase });
            }
        } catch (error) {
            console.error("Error handling mascot click:", error);
            setInteraction({ type: 'phrase', text: "Oops, tive um curto-circuito! Tente de novo." });
        } finally {
            setClickCount(newClickCount);
            localStorage.setItem(`neurosync-mascot-clicks-${user.id}`, newClickCount.toString());
            setIsLoading(false);
        }
    };

    const handleOptionChange = (option: string) => {
        if (interaction && interaction.type === 'question') {
            setInteraction({ ...interaction, selectedOption: option });
        }
    };
    
    const handleQuestionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !interaction || !interaction.question || !interaction.selectedOption) return;
        
        setIsLoading(true);
        try {
            const analysis = await analyzeCheckInResponse(interaction.question.text, interaction.selectedOption, user);
            setInteraction({ type: 'analysis', text: analysis });
        } catch(error) {
             console.error("Error submitting answer:", error);
             setInteraction({ type: 'analysis', text: "Obrigado por compartilhar! Lembre-se de ser gentil consigo mesmo." });
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderBubbleContent = () => {
        if (!interaction) return null;

        if (interaction.type === 'question' && interaction.question) {
            return (
                <form onSubmit={handleQuestionSubmit}>
                    <p className="text-white/90 text-sm mb-3 font-semibold">{typedMessage}</p>
                    <div className="space-y-2">
                        {interaction.question.options.map(option => (
                            <label key={option} className="flex items-center gap-3 p-2.5 rounded-lg bg-black/20 hover:bg-black/40 cursor-pointer transition-colors">
                                <input
                                    type="radio"
                                    name="checkin-option"
                                    value={option}
                                    checked={interaction.selectedOption === option}
                                    onChange={() => handleOptionChange(option)}
                                    className="h-4 w-4 shrink-0 appearance-none rounded-full border-2 border-slate-500 checked:bg-violet-500 checked:border-violet-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-violet-500"
                                    required
                                />
                                <span className="text-sm text-white/80">{option}</span>
                            </label>
                        ))}
                    </div>
                    <button 
                        type="submit" 
                        disabled={!interaction.selectedOption || isLoading}
                        className="w-full mt-4 bg-violet-600 text-white font-semibold py-2 px-3 rounded-lg text-sm hover:bg-violet-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all"
                    >
                       {isLoading ? "Analisando..." : "Enviar"}
                    </button>
                </form>
            );
        }

        return <p className="text-white/90 text-sm">{typedMessage}</p>;
    };

  return (
    <div className="fixed bottom-24 right-4 z-40 w-64 sm:w-72" aria-live="polite">
      {interaction && (
        <div className="speech-bubble glass-card p-4 rounded-xl shadow-lg mb-4"
             style={{background: 'rgba(15, 23, 42, 0.8)'}}>
          {renderBubbleContent()}
        </div>
      )}
      <div 
        className="mascot-container w-24 h-24 ml-auto cursor-pointer relative"
        onClick={handleMascotClick}
        role="button"
        aria-label="Mascote Sync. Clique para uma dica."
      >
        {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full"><div className="w-8 h-8 border-4 border-t-transparent border-violet-400 rounded-full animate-spin"></div></div>}
        <img src="/mascot.png" alt="Mascote Sync" className="w-full h-full object-contain"/>
      </div>
    </div>
  );
};

export default Mascot;