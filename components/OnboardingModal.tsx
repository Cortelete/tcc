import React, { useState } from 'react';
import Modal from './Modal';
import { ICONS, SUGGESTED_ONBOARDING_TASKS } from '../constants';
import { CharacterPower, Task } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (onboardingData: {
    name: string;
    characterPower: CharacterPower;
    mainGoal: string;
    challenges: string;
    initialTasks: Omit<Task, 'id'>[];
  }) => void;
}

const PowerCard: React.FC<{
  icon: React.ReactNode;
  name: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ icon, name, description, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
      isSelected ? 'bg-violet-500/30 border-violet-400' : 'bg-black/20 border-transparent hover:border-violet-500'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 flex items-center justify-center text-violet-300">{icon}</div>
      <div>
        <h4 className="font-bold text-white/90">{name}</h4>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
  </div>
);

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [mainGoal, setMainGoal] = useState('');
  const [challenges, setChallenges] = useState('');
  const [characterPower, setCharacterPower] = useState<CharacterPower | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Omit<Task, 'id'>[]>([]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleTaskToggle = (task: Omit<Task, 'id'>) => {
    setSelectedTasks(prev => 
      prev.some(t => t.name === task.name) 
      ? prev.filter(t => t.name !== task.name) 
      : [...prev, task]
    );
  };
  
  const handleFinish = () => {
    if (name && characterPower && mainGoal && challenges) {
      onComplete({ name, characterPower, mainGoal, challenges, initialTasks: selectedTasks });
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !name.trim()) return true;
    if (step === 2 && !mainGoal.trim()) return true;
    if (step === 3 && !challenges.trim()) return true;
    if (step === 4 && !characterPower) return true;
    return false;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className="text-xl font-bold text-center mb-2 text-white">Bem-vindo(a) ao NeuroSync!</h3>
            <p className="text-center text-white/70 mb-6">Vamos começar sua jornada. Como podemos te chamar?</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Digite seu nome ou apelido"
              className="w-full glass-input p-3 rounded-lg text-center"
              autoFocus
            />
          </>
        );
      case 2:
        return (
          <>
            <h3 className="text-xl font-bold text-center mb-2 text-white">Qual é seu principal objetivo?</h3>
            <p className="text-center text-white/70 mb-6">O que você mais deseja alcançar com a nossa ajuda?</p>
            <textarea
              value={mainGoal}
              onChange={e => setMainGoal(e.target.value)}
              placeholder="Ex: Melhorar minha organização diária e não esquecer meus remédios."
              className="w-full glass-input p-3 rounded-lg h-28"
            />
          </>
        );
      case 3:
         return (
          <>
            <h3 className="text-xl font-bold text-center mb-2 text-white">Quais são seus maiores desafios?</h3>
            <p className="text-center text-white/70 mb-6">Nos conte um pouco sobre as dificuldades que você enfrenta.</p>
            <textarea
              value={challenges}
              onChange={e => setChallenges(e.target.value)}
              placeholder="Ex: Me distraio facilmente, tenho dificuldade para começar tarefas."
              className="w-full glass-input p-3 rounded-lg h-28"
            />
          </>
        );
      case 4:
        return (
          <>
            <h3 className="text-xl font-bold text-center mb-2 text-white">Escolha seu Poder Principal</h3>
            <p className="text-center text-white/70 mb-6">Qual área você gostaria de fortalecer primeiro?</p>
            <div className="space-y-3">
              <PowerCard icon={ICONS.power_focus} name="Foco" description="Para concentração e atenção." isSelected={characterPower === 'focus'} onSelect={() => setCharacterPower('focus')} />
              <PowerCard icon={ICONS.power_memory} name="Memória" description="Para lembrar informações e tarefas." isSelected={characterPower === 'memory'} onSelect={() => setCharacterPower('memory')} />
              <PowerCard icon={ICONS.power_calm} name="Calma" description="Para controle emocional e relaxamento." isSelected={characterPower === 'calm'} onSelect={() => setCharacterPower('calm')} />
              <PowerCard icon={ICONS.power_patient} name="Paciente" description="Jornada com suporte clínico." isSelected={characterPower === 'patient'} onSelect={() => setCharacterPower('patient')} />
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h3 className="text-xl font-bold text-center mb-2 text-white">Sugestões de Tarefas Iniciais</h3>
            <p className="text-center text-white/70 mb-6">Selecione algumas tarefas para começar. Você pode adicionar mais depois.</p>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {SUGGESTED_ONBOARDING_TASKS.map(task => (
                    <div key={task.name} onClick={() => handleTaskToggle(task)} className="flex items-center justify-between p-3 rounded-lg bg-black/20 cursor-pointer">
                        <div className="flex items-center gap-3">
                           <div className="text-violet-300">{task.icon}</div>
                           <div>
                               <p className="font-semibold text-white/90">{task.name}</p>
                               <p className="text-xs text-white/60">{task.description}</p>
                           </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedTasks.some(t => t.name === task.name) ? 'bg-violet-500 border-violet-400' : 'border-white/30'}`}>
                           {selectedTasks.some(t => t.name === task.name) && ICONS.check}
                        </div>
                    </div>
                ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title={`Configuração Inicial (${step}/5)`}>
      <div className="text-white">
        {renderStep()}
        <div className="mt-8 flex justify-between">
          <button onClick={handleBack} disabled={step === 1} className="py-2 px-4 rounded-md text-white/80 bg-slate-500/20 hover:bg-slate-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
            Voltar
          </button>
          {step < 5 ? (
            <button onClick={handleNext} disabled={isNextDisabled()} className="py-2 px-4 rounded-md text-white bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed">
              Avançar
            </button>
          ) : (
            <button onClick={handleFinish} className="py-2 px-4 rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
              Concluir
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingModal;
