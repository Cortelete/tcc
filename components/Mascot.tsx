import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ICONS } from '../constants';

interface MascotProps {
    user: User;
    systemMessage: string | null;
}

// FIX: Implement the Mascot component to display messages to the user.
const Mascot: React.FC<MascotProps> = ({ user, systemMessage }) => {
    const [message, setMessage] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Display system messages (e.g., from achievements) with higher priority.
        if (systemMessage) {
            setMessage(systemMessage);
            setIsVisible(true);

            // Set a timer to hide the message after a while.
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 6000); // Hide after 6 seconds

            return () => clearTimeout(timer);
        }
    }, [systemMessage]);
    
    // Effect for a generic welcome message if no system message is active.
    useEffect(() => {
        // Only run if there is no prioritized system message.
        if(!systemMessage) {
            const timer = setTimeout(() => {
                setMessage(`Olá, ${user.name}! Estou aqui para te ajudar a conquistar o dia!`);
                setIsVisible(true);
            }, 2000); // Show welcome message after 2 seconds on load.
            
            const hideTimer = setTimeout(() => {
                 setIsVisible(false);
            }, 8000); // Hide after 8 seconds (2s delay + 6s visible)

            return () => {
                clearTimeout(timer);
                clearTimeout(hideTimer);
            };
        }
    }, [user.name, systemMessage]);


    if (!message) {
        return null;
    }

    return (
        // Position the mascot component at the bottom of the screen.
        <div className={`fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
             aria-live="polite"
        >
            <div className="flex items-start gap-3 p-4 rounded-2xl shadow-2xl glass-card border-2 border-violet-500/50" style={{background: 'rgba(15, 23, 42, 0.9)'}}>
                <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-full flex items-center justify-center text-white">
                    {ICONS.mascot}
                </div>
                <div>
                    <h4 className="font-bold text-violet-300">Sync</h4>
                    <p className="text-sm text-white/90">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default Mascot;
