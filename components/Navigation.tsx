import React from 'react';
import { ICONS } from '../constants';

interface NavigationProps {
  activeView: 'dashboard' | 'profile';
  setActiveView: (view: 'dashboard' | 'profile') => void;
  onAddTaskClick: () => void;
}

const NavButton: React.FC<{
    icon: React.ReactNode; 
    label: string; 
    isActive: boolean; 
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full transition-colors duration-300 ${isActive ? 'text-fuchsia-400' : 'text-white/60 hover:text-white'}`}
    >
        {icon}
        <span className="text-xs font-medium">{label}</span>
    </button>
);

const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView, onAddTaskClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 px-4 z-30 max-w-4xl mx-auto">
        <div className="relative h-full flex items-center justify-around glass-card rounded-t-2xl md:rounded-2xl md:mb-4">
            <NavButton
                icon={ICONS.tasks}
                label="Tarefas"
                isActive={activeView === 'dashboard'}
                onClick={() => setActiveView('dashboard')}
            />
             <div className="w-16 h-16">
                 <button
                    onClick={onAddTaskClick}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
                    aria-label="Adicionar Nova Tarefa"
                >
                    {ICONS.plus}
                </button>
            </div>
            <NavButton
                icon={ICONS.user}
                label="Perfil"
                isActive={activeView === 'profile'}
                onClick={() => setActiveView('profile')}
            />
        </div>
    </div>
  );
};

export default Navigation;