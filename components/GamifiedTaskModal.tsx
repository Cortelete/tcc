import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { ICONS } from '../constants';

interface GamifiedTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  taskName: string;
}

const COLORS = ['#f43f5e', '#3b82f6', '#f59e0b', '#34d399']; // rose, blue, amber, emerald
const SEQUENCE_LENGTH = 4;

const GamifiedTaskModal: React.FC<GamifiedTaskModalProps> = ({ isOpen, onClose, onComplete, taskName }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [status, setStatus] = useState<'watching' | 'playing' | 'won' | 'lost'>('watching');
  const [activeButton, setActiveButton] = useState<number | null>(null);

  const generateSequence = useCallback(() => {
    const newSequence = Array.from({ length: SEQUENCE_LENGTH }, () => Math.floor(Math.random() * COLORS.length));
    setSequence(newSequence);
    setPlayerSequence([]);
    setStatus('watching');
  }, []);

  useEffect(() => {
    if (isOpen) {
      generateSequence();
    }
  }, [isOpen, generateSequence]);

  useEffect(() => {
    if (status === 'watching' && sequence.length > 0) {
      let i = 0;
      const interval = setInterval(() => {
        setActiveButton(sequence[i]);
        i++;
        if (i >= sequence.length) {
          clearInterval(interval);
          setTimeout(() => {
              setActiveButton(null);
              setStatus('playing');
          }, 500);
        } else {
             setTimeout(() => setActiveButton(null), 400);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [status, sequence]);

  const handlePlayerClick = (index: number) => {
    if (status !== 'playing') return;

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setStatus('lost');
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      setStatus('won');
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'watching':
        return 'Observe a sequência...';
      case 'playing':
        return 'Sua vez! Repita a sequência.';
      case 'won':
        return 'Excelente! Tarefa concluída!';
      case 'lost':
        return 'Ops! Tente novamente.';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Desafio: ${taskName}`}>
      <div className="text-center">
        <p className="text-lg font-semibold mb-4 text-white/80">{getStatusMessage()}</p>
        <div className="grid grid-cols-2 gap-4 my-6 max-w-xs mx-auto">
          {COLORS.map((color, index) => (
            <button
              key={index}
              onClick={() => handlePlayerClick(index)}
              className={`h-24 w-24 rounded-full transition-all duration-200 border-2 border-white/20 ${activeButton === index ? 'opacity-100 scale-110 shadow-lg' : 'opacity-70'}`}
              style={{ backgroundColor: color }}
              disabled={status !== 'playing'}
              aria-label={`Botão de cor ${index + 1}`}
            />
          ))}
        </div>
        {status === 'won' && (
          <button onClick={onComplete} className="mt-4 w-full bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 flex items-center justify-center gap-2 transition-all">
            {ICONS.check} Confirmar Conclusão
          </button>
        )}
        {status === 'lost' && (
          <button onClick={generateSequence} className="mt-4 w-full bg-violet-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-600 transition-all">
            Tentar Novamente
          </button>
        )}
      </div>
    </Modal>
  );
};

export default GamifiedTaskModal;