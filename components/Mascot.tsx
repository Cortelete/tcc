import React, { useState, useEffect } from 'react';
import { getMotivationalPhrase } from '../services/geminiService';
import { User } from '../types';

interface MascotProps {
  systemMessage: string | null;
  user: User;
}

const Mascot: React.FC<MascotProps> = ({ systemMessage, user }) => {
    const [displayMessage, setDisplayMessage] = useState<string | null>(null);
    const [typedMessage, setTypedMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const showAndTypeMessage = (message: string) => {
        setDisplayMessage(message);
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

        const hideTimeout = setTimeout(() => {
            setDisplayMessage(null);
        }, 8000); // Hide after 8 seconds

        return () => {
            clearInterval(typingInterval);
            clearTimeout(hideTimeout);
        };
    };

    useEffect(() => {
        if (systemMessage) {
            const cleanup = showAndTypeMessage(systemMessage);
            return cleanup;
        }
    }, [systemMessage]);
    
    const handleClick = async () => {
        if (isLoading) return;
        setIsLoading(true);
        const phrase = await getMotivationalPhrase(user.characterPower);
        setIsLoading(false);
        showAndTypeMessage(phrase);
    }

  return (
    <div className="fixed bottom-24 right-4 z-40 w-64" aria-live="polite">
      {displayMessage && (
        <div className="speech-bubble glass-card p-4 rounded-xl shadow-lg mb-4"
             style={{background: 'rgba(15, 23, 42, 0.8)'}}>
          <p className="text-white/90 text-sm">{typedMessage}</p>
        </div>
      )}
      <div 
        className="mascot-container w-24 h-24 ml-auto cursor-pointer"
        onClick={handleClick}
        role="button"
        aria-label="Mascote Sync. Clique para uma dica."
      >
        <img src="/mascot.png" alt="Mascote Sync" className="w-full h-full object-contain"/>
      </div>
    </div>
  );
};

export default Mascot;