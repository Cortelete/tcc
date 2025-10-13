import React, { useState, useLayoutEffect, useCallback } from 'react';

type TourStep = {
  elementId?: string;
  title: string;
  content: string;
  placement: 'center' | 'top-center' | 'bottom-center' | 'left-center';
  highlightPadding?: number;
};

const tourSteps: TourStep[] = [
  {
    title: 'Bem-vindo(a) à sua Jornada!',
    content: 'Vamos fazer um tour rápido para você conhecer as principais ferramentas que te ajudarão a conquistar seus objetivos.',
    placement: 'center',
  },
  {
    elementId: 'tasks-board',
    title: 'Seu Quadro de Tarefas',
    content: 'Aqui você verá todas as suas tarefas e missões do dia. Complete-as para ganhar XP e progredir na sua jornada!',
    placement: 'top-center',
    highlightPadding: 10,
  },
  {
    elementId: 'add-task-button',
    title: 'Adicionar Novas Tarefas',
    content: 'Clique neste botão a qualquer momento para adicionar novas tarefas, como tomar um medicamento ou fazer uma pausa.',
    placement: 'top-center',
    highlightPadding: 15,
  },
  {
    elementId: 'profile-button',
    title: 'Acompanhe seu Progresso',
    content: 'Acesse seu perfil para ver seu nível, conquistas desbloqueadas e o seu progresso no Mapa da Jornada.',
    placement: 'top-center',
     highlightPadding: 10,
  },
  {
    elementId: 'mascot-button',
    title: 'Seu Assistente Pessoal, Sync',
    content: 'Este é o Sync! Clique nele sempre que precisar de uma dica, motivação ou apenas uma palavra de apoio.',
    placement: 'left-center',
     highlightPadding: 15,
  },
  {
    title: 'Tudo Pronto!',
    content: 'Você completou o tour e está pronto para começar. Lembre-se, cada passo na direção certa é uma vitória. Boa jornada, herói!',
    placement: 'center',
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface AppTourProps {
  onComplete: () => void;
}

const AppTour: React.FC<AppTourProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<Rect | null>(null);

  const currentStep = tourSteps[stepIndex];

  const calculateRect = useCallback(() => {
    if (!currentStep.elementId) {
      setHighlightRect(null);
      return;
    }
    const element = document.getElementById(currentStep.elementId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = currentStep.highlightPadding || 5;
      setHighlightRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    }
  }, [currentStep]);

  useLayoutEffect(() => {
    calculateRect();
    window.addEventListener('resize', calculateRect);
    return () => window.removeEventListener('resize', calculateRect);
  }, [calculateRect]);

  const handleNext = () => {
    if (stepIndex < tourSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const getModalPosition = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (highlightRect) {
      const modalOffset = 16; // Space between highlight and modal
      switch (currentStep.placement) {
        case 'top-center':
          style.top = `${highlightRect.top - modalOffset}px`;
          style.left = `${highlightRect.left + highlightRect.width / 2}px`;
          style.transform = 'translate(-50%, -100%)';
          break;
        case 'bottom-center':
          style.top = `${highlightRect.top + highlightRect.height + modalOffset}px`;
          style.left = `${highlightRect.left + highlightRect.width / 2}px`;
          style.transform = 'translate(-50%, 0)';
          break;
        case 'left-center':
           style.top = `${highlightRect.top + highlightRect.height / 2}px`;
           style.left = `${highlightRect.left - modalOffset}px`;
           style.transform = 'translate(-100%, -50%)';
           break;
        default:
          style.top = '50%';
          style.left = '50%';
          style.transform = 'translate(-50%, -50%)';
      }
    } else {
      style.top = '50%';
      style.left = '50%';
      style.transform = 'translate(-50%, -50%)';
    }
    return style;
  };

  return (
    <div className="fixed inset-0 z-[1000]">
      <div
        className="tour-highlight-wrapper"
        style={
          highlightRect
            ? {
                top: `${highlightRect.top}px`,
                left: `${highlightRect.left}px`,
                width: `${highlightRect.width}px`,
                height: `${highlightRect.height}px`,
                borderRadius: currentStep.elementId?.includes('button') ? '9999px' : '12px',
              }
            : {
                top: '50%',
                left: '50%',
                width: 0,
                height: 0,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              }
        }
      />
      <div className="tour-modal glass-card p-5 rounded-xl" style={getModalPosition()}>
        <h3 className="text-xl font-bold text-white/90 mb-2">{currentStep.title}</h3>
        <p className="text-white/80">{currentStep.content}</p>
        <div className="flex justify-between items-center mt-4">
          <button onClick={onComplete} className="text-sm text-white/60 hover:text-white">
            Pular Tour
          </button>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="py-2 px-4 rounded-md text-white/80 bg-slate-500/20 hover:bg-slate-500/30"
              >
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              className="py-2 px-4 rounded-md text-white bg-violet-600 hover:bg-violet-700"
            >
              {stepIndex === tourSteps.length - 1 ? 'Começar Jornada' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppTour;
