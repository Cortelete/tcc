import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';

interface MascotProps {
  message: string | null;
}

const Mascot: React.FC<MascotProps> = ({ message }) => {
    const [showMessage, setShowMessage] = useState(false);
    const [typedMessage, setTypedMessage] = useState("");

    useEffect(() => {
        if (message) {
            setShowMessage(true);
            setTypedMessage(""); // Reset
            let i = 0;
            const typingInterval = setInterval(() => {
                setTypedMessage(prev => prev + message[i]);
                i++;
                if (i >= message.length) {
                    clearInterval(typingInterval);
                }
            }, 30);

            const hideTimeout = setTimeout(() => {
                setShowMessage(false);
            }, 8000); // Hide after 8 seconds

            return () => {
                clearInterval(typingInterval);
                clearTimeout(hideTimeout);
            };
        }
    }, [message]);

  return (
    <div className="fixed bottom-24 right-4 z-40 w-64">
      {showMessage && (
        <div className="speech-bubble glass-card p-4 rounded-xl shadow-lg mb-4"
             style={{background: 'rgba(15, 23, 42, 0.8)'}}>
          <p className="text-white/90 text-sm">{typedMessage}</p>
        </div>
      )}
      <div className="mascot-container w-24 h-24 ml-auto text-white">
        {ICONS.mascot}
      </div>
    </div>
  );
};

export default Mascot;