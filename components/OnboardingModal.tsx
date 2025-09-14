import React, { useState } from 'react';
import { ICONS, SUGGESTED_ONBOARDING_TASKS } from '../constants';
import { User, CharacterPower, ReminderType, Task, TaskCriticality, PatientCondition } from '../types';

interface OnboardingModalProps {
  user: User;
  onComplete: (data: {
      name: string, 
      power: CharacterPower, 
      tasks: Omit<Task, 'id'>[], 
      reminderType: ReminderType,
      patientCondition?: PatientCondition,
      hasMedicalReport?: boolean
    }) => void;
}

const PowerCard: React.FC<{icon: JSX.Element, title: string, description: string, isSelected: boolean, onClick: () => void}> = 
({ icon, title, description, isSelected, onClick }) => (
    <div onClick={onClick} className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${isSelected ? 'bg-violet-500/40 ring-2 ring-violet-400' : 'bg-white/10 hover:bg-white/20'}`}>
        <div className="flex items-center gap-4">
            <div className={`${isSelected ? 'text-violet-300' : 'text-white/80'}`}>{icon}</div>
            <div>
                <h3 className="font-bold text-lg text-white">{title}</h3>
                <p className="text-sm text-white/70">{description}</p>
            </div>
        </div>
    </div>
);


const OnboardingModal: React.FC<OnboardingModalProps> = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState(user.name);
    const [power, setPower] = useState<CharacterPower | null>(null);
    const [tasks, setTasks] = useState<Omit<Task, 'id'>[]>([]);
    
    // State for Step 2
    const [medName, setMedName] = useState('');
    const [medTime, setMedTime] = useState('08:00');
    const [medDosage, setMedDosage] = useState('');
    const [customTaskName, setCustomTaskName] = useState('');
    
    const [reminderType, setReminderType] = useState<ReminderType>('alarm');
    const [patientCondition, setPatientCondition] = useState<PatientCondition>('tdah');
    const [hasMedicalReport, setHasMedicalReport] = useState(false);

    const handleToggleSuggestedTask = (suggestedTask: Omit<Task, 'id'>) => {
        setTasks(prev => {
            const isAlreadyAdded = prev.some(task => task.name === suggestedTask.name);
            if (isAlreadyAdded) {
                return prev.filter(task => task.name !== suggestedTask.name);
            } else {
                return [...prev, suggestedTask];
            }
        });
    };

    const handleAddMedication = (e: React.FormEvent) => {
        e.preventDefault();
        if(!medName.trim()) return;
        const newMed: Omit<Task, 'id'> = {
            name: medName,
            description: `Medicamento: ${medDosage}`,
            startTime: medTime,
            frequencyHours: 24, // Default, can be changed later
            criticality: TaskCriticality.HIGH,
            reminderType: 'loud',
            taskType: 'medication',
            dosage: medDosage
        };
        setTasks(prev => [...prev, newMed]);
        setMedName('');
        setMedDosage('');
        setMedTime('08:00');
    };

    const handleAddCustomTask = (e: React.FormEvent) => {
        e.preventDefault();
        if(!customTaskName.trim()) return;
        const newTask: Omit<Task, 'id'> = {
            name: customTaskName,
            description: 'Tarefa inicial',
            startTime: '09:00',
            frequencyHours: 24,
            criticality: TaskCriticality.MEDIUM,
            reminderType: 'alarm',
            taskType: 'generic'
        };
        setTasks(prev => [...prev, newTask]);
        setCustomTaskName('');
    };
    
    const handleRemoveTask = (indexToRemove: number) => {
        setTasks(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    
    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-2">Crie seu Herói da Rotina</h2>
                        <p className="text-center text-white/70 mb-6">Vamos começar personalizando sua jornada.</p>
                        <div className="mb-6">
                            <label htmlFor="hero-name" className="block text-sm font-medium text-white/70 mb-1">Nome do Herói</label>
                            <input type="text" id="hero-name" value={name} onChange={e => setName(e.target.value)} className="w-full glass-input px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Escolha seu Poder Principal</label>
                            <div className="space-y-3">
                                <PowerCard icon={ICONS.power_focus} title="Foco" description="Para missões que exigem concentração." isSelected={power === 'focus'} onClick={() => setPower('focus')} />
                                <PowerCard icon={ICONS.power_memory} title="Memória" description="Para lembrar de detalhes importantes." isSelected={power === 'memory'} onClick={() => setPower('memory')} />
                                <PowerCard icon={ICONS.power_calm} title="Calma" description="Para manter a serenidade em desafios." isSelected={power === 'calm'} onClick={() => setPower('calm')} />
                                <PowerCard icon={ICONS.power_patient} title="Paciente" description="Para suporte clínico personalizado." isSelected={power === 'patient'} onClick={() => setPower('patient')} />
                            </div>
                        </div>
                        {power === 'patient' && (
                            <div className="mt-4 p-4 bg-black/20 rounded-lg space-y-4">
                                <div>
                                    <label htmlFor="condition" className="block text-sm font-medium text-white/70 mb-1">Condição</label>
                                    <select id="condition" value={patientCondition} onChange={e => setPatientCondition(e.target.value as PatientCondition)} className="w-full glass-input p-2 rounded-md">
                                        <option value="tdah">TDAH</option>
                                        <option value="tea">TEA (Transtorno do Espectro Autista)</option>
                                        <option value="superdotacao">Superdotação/Altas Habilidades</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>
                                <div className="flex items-start gap-2">
                                    <input type="checkbox" id="medical-report" checked={hasMedicalReport} onChange={e => setHasMedicalReport(e.target.checked)} className="mt-1 h-4 w-4 rounded bg-gray-700 border-gray-600 text-violet-600 focus:ring-violet-500"/>
                                    <label htmlFor="medical-report" className="text-sm text-white/70">
                                        Confirmo que possuo um laudo profissional para a condição selecionada.
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 2:
                 return (
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-2">Mapeando a Jornada</h2>
                        <p className="text-center text-white/70 mb-4">Monte sua rotina inicial para começar a aventura.</p>
                        <div className="bg-yellow-500/20 text-yellow-200 text-sm p-3 rounded-lg mb-4">
                           <b>Atenção:</b> NeuroSync AI é uma ferramenta de suporte. Siga sempre a orientação de profissionais da saúde.
                        </div>

                        {/* Sugestões Rápidas */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-white/80 mb-2">Sugestões Rápidas</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {SUGGESTED_ONBOARDING_TASKS.map(task => {
                                    const isSelected = tasks.some(t => t.name === task.name);
                                    return (
                                        <button type="button" key={task.name} onClick={() => handleToggleSuggestedTask(task)} className={`flex items-center gap-2 p-2 rounded-lg transition-all text-left ${isSelected ? 'bg-violet-500/40 ring-1 ring-violet-400' : 'bg-black/20 hover:bg-black/40'}`}>
                                            {task.icon} <span className="text-sm">{task.name}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Adicionar Medicamento */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-white/80 mb-2">Adicionar Medicamento</h3>
                            <form onSubmit={handleAddMedication} className="p-3 bg-black/20 rounded-lg space-y-2">
                                <input type="text" value={medName} onChange={e => setMedName(e.target.value)} placeholder="Nome do remédio" className="w-full text-sm glass-input px-3 py-2 rounded-md" required/>
                                <div className="flex gap-2">
                                    <input type="time" value={medTime} onChange={e => setMedTime(e.target.value)} className="w-1/2 text-sm glass-input px-3 py-2 rounded-md" required/>
                                    <input type="text" value={medDosage} onChange={e => setMedDosage(e.target.value)} placeholder="Dosagem" className="w-1/2 text-sm glass-input px-3 py-2 rounded-md" />
                                </div>
                                <button type="submit" className="w-full bg-violet-600 text-white font-bold text-sm py-2 rounded-lg hover:bg-violet-700">Adicionar Remédio</button>
                            </form>
                        </div>
                         {/* Adicionar Outra Tarefa */}
                        <div className="mb-4">
                             <h3 className="font-semibold text-white/80 mb-2">Adicionar Outra Tarefa</h3>
                             <form onSubmit={handleAddCustomTask} className="flex gap-2">
                                <input type="text" value={customTaskName} onChange={e => setCustomTaskName(e.target.value)} placeholder="Ex: Organizar a mesa" className="flex-grow text-sm glass-input px-3 py-2 rounded-lg" />
                                <button type="submit" className="bg-violet-600 text-white font-bold p-2 rounded-lg hover:bg-violet-700">{ICONS.plus}</button>
                            </form>
                        </div>
                        
                        {/* Lista */}
                        <div>
                            <h3 className="font-semibold text-white/80 mb-2">Sua Lista Inicial ({tasks.length})</h3>
                             <div className="space-y-2">
                                {tasks.length > 0 ? tasks.map((task, index) => (
                                    <div key={index} className="bg-black/20 p-2 rounded-lg flex justify-between items-center">
                                        <span className="text-sm">{task.taskType === 'medication' ? ICONS.pill : ''}{task.name}</span>
                                        <button type="button" onClick={() => handleRemoveTask(index)} className="text-red-400 hover:text-red-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                )) : <p className="text-center text-sm text-white/60 p-3">Sua lista está vazia.</p>}
                            </div>
                        </div>

                    </div>
                );
            case 3:
                return (
                     <div>
                        <h2 className="text-2xl font-bold text-center mb-2">Configurando Alertas</h2>
                        <p className="text-center text-white/70 mb-6">Qual estilo de lembrete funciona melhor para você?</p>
                         <div className="space-y-3">
                            <PowerCard icon={ICONS.sensitive} title="Sutil" description="Notificações gentis e discretas." isSelected={reminderType === 'sensitive'} onClick={() => setReminderType('sensitive')} />
                            <PowerCard icon={ICONS.bell} title="Padrão" description="Um alarme balanceado para o dia a dia." isSelected={reminderType === 'alarm'} onClick={() => setReminderType('alarm')} />
                            <PowerCard icon={ICONS.loud} title="Forte" description="Alertas insistentes para tarefas críticas." isSelected={reminderType === 'loud'} onClick={() => setReminderType('loud')} />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">Missão Iniciada!</h2>
                        <div className="inline-block bg-green-500/20 text-green-300 p-4 rounded-full mb-4">
                           {ICONS.welcome}
                        </div>
                        <p className="text-lg text-white/80 mb-2">Você completou a configuração e ganhou:</p>
                        <p className="text-2xl font-bold text-green-400 mb-6">+50 XP</p>
                        <p className="text-white/70">Sua jornada para dominar sua rotina começa agora. Estamos com você!</p>
                    </div>
                )
        }
    }

    const canProceed = () => {
        if (step === 1) {
            if (!name.trim() || !power) return false;
            if (power === 'patient' && !hasMedicalReport) return false;
            return true;
        }
        if (step === 2) {
            return tasks.length > 0;
        }
        return true;
    }

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);
    const handleComplete = () => {
        if(power) {
            onComplete({
                name, 
                power, 
                tasks, 
                reminderType, 
                patientCondition: power === 'patient' ? patientCondition : undefined, 
                hasMedicalReport: power === 'patient' ? hasMedicalReport : undefined
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-md">
                 <div className="glass-card rounded-2xl shadow-2xl border-0 flex flex-col max-h-[90vh]">
                    <div className="p-6 overflow-y-auto">
                        {renderStep()}
                    </div>
                    <div className="p-6 pt-0 shrink-0">
                        <div className="flex gap-3 justify-between items-center">
                            {step > 1 && step < 4 && <button onClick={handleBack} className="py-2 px-4 rounded-lg text-white/70 hover:text-white">Voltar</button>}
                            {step === 1 && <div />}
                            {step < 4 && <button onClick={handleNext} disabled={!canProceed()} className="flex-grow bg-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-700 disabled:bg-gray-500 disabled:cursor-not-allowed">Próximo</button>}
                            {step === 4 && <button onClick={handleComplete} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700">Começar a Jornada!</button>}
                        </div>
                    </div>
                 </div>
                 <div className="w-full h-2 bg-black/20 rounded-full mt-4 overflow-hidden">
                    <div className="h-2 bg-violet-500 rounded-full transition-all duration-500" style={{width: `${(step/4)*100}%`}}></div>
                 </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
