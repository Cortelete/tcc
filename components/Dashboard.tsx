import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, AdherenceStatus, AiInsight, Task, ReminderType, AiSuggestedTask } from '../types';
import { ICONS } from '../constants';
import TaskChart from './AdherenceChart';
import { getTaskInsights, getSuggestedTasks } from '../services/geminiService';
import GamifiedTaskModal from './GamifiedTaskModal';
import Mascot from './Mascot';

interface DashboardProps {
  user: User;
  onLogTask: (taskId: string, scheduledTime: Date, status: AdherenceStatus) => void;
  onAcceptMission: (mission: Omit<Task, 'id' | 'criticality' | 'frequencyHours' | 'startTime' | 'taskType' | 'dosage' | 'instructions' | 'category' | 'subcategory'>) => void;
}

const getScheduleForToday = (task: Task): Date[] => {
    const schedule: Date[] = [];
    const [startHour, startMinute] = task.startTime.split(':').map(Number);
    const now = new Date();
    if (task.frequencyHours < 24) {
      for (let h = 0; h < 24; h += task.frequencyHours) {
        const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
        scheduledDate.setHours(scheduledDate.getHours() + h);
        if (scheduledDate.getDate() === now.getDate()) {
            schedule.push(scheduledDate);
        }
      }
    } else {
        const dayFrequency = task.frequencyHours / 24;
        const today = new Date();
        today.setHours(0,0,0,0);
        const startDate = new Date('2024-01-01T00:00:00');
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays % dayFrequency === 0) {
            const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
            schedule.push(scheduledDate);
        }
    }
    return schedule.sort((a,b) => a.getTime() - b.getTime());
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogTask, onAcceptMission }) => {
    const [aiInsight, setAiInsight] = useState<AiInsight | null>(null);
    const [suggestedMissions, setSuggestedMissions] = useState<AiSuggestedTask[]>([]);
    const [isLoadingMissions, setIsLoadingMissions] = useState(true);
    const [gamifiedTask, setGamifiedTask] = useState<{task: Task, time: Date} | null>(null);
    const [showXp, setShowXp] = useState(false);
    const [mascotMessage, setMascotMessage] = useState<string | null>(null);

    const missionsAcceptedToday = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        if (user.dailyMissionAcceptances?.date === today) {
            return user.dailyMissionAcceptances.count;
        }
        return 0;
    }, [user.dailyMissionAcceptances]);

    const canAcceptMoreMissions = missionsAcceptedToday < 5;

    const fetchInsightsAndMissions = useCallback(async () => {
        setIsLoadingMissions(true);
        if(user.characterPower && user.characterPower !== 'patient') { // Patient power might have different logic later
            const missions = await getSuggestedTasks(user.characterPower);
            setSuggestedMissions(missions);
            if(missions.length > 0) {
                 setMascotMessage(`Olá, ${user.name}! Tenho novas missões para fortalecer seus poderes hoje. Vamos lá?`);
            } else {
                 setMascotMessage(`Uau, ${user.name}! Você já completou todas as missões de hoje. Descanse, herói!`);
            }
        } else {
            setMascotMessage(`Bem-vindo, ${user.name}! Estou aqui para te ajudar na sua jornada. Complete suas tarefas para ganhar XP!`);
        }
        setIsLoadingMissions(false);

        const insight = await getTaskInsights(user);
        setAiInsight(insight);
        
    }, [user.characterPower, user.name]);

    useEffect(() => {
        fetchInsightsAndMissions();
    }, [user.id, user.taskHistory.length, fetchInsightsAndMissions]);
    
    const getLogForScheduledTime = (taskId: string, scheduledTime: Date) => {
        return user.taskHistory.find(log => 
            log.taskId === taskId &&
            new Date(log.scheduledTime).getTime() === scheduledTime.getTime()
        );
    }
    
    const triggerXpAnimation = () => {
        setShowXp(true);
        setTimeout(() => setShowXp(false), 1500);
    }

    const handleRegisterClick = (task: Task, time: Date) => {
        if (task.reminderType === 'game') {
            setGamifiedTask({task, time});
        } else {
            triggerXpAnimation();
            onLogTask(task.id, time, AdherenceStatus.TAKEN);
        }
    }
    
    const handleAcceptMissionClick = (mission: AiSuggestedTask) => {
        if (!canAcceptMoreMissions) {
            setMascotMessage("Você é incrível, mas já aceitou missões suficientes por hoje! Foco nas que já tem.");
            return;
        }
        onAcceptMission(mission);
        setSuggestedMissions(prev => prev.filter(m => m.name !== mission.name));
        setMascotMessage("Excelente! Missão adicionada ao seu diário. Boa sorte, herói!");
    }

    const handleGameComplete = () => {
        if(gamifiedTask) {
            triggerXpAnimation();
            onLogTask(gamifiedTask.task.id, gamifiedTask.time, AdherenceStatus.TAKEN);
            setGamifiedTask(null);
        }
    }

    const getReminderIcon = (reminderType: ReminderType) => {
        const iconClass = "w-10 h-10 flex items-center justify-center rounded-full";
        switch(reminderType) {
            case 'sensitive': return <div className={`${iconClass} bg-sky-500/20 text-sky-300`}>{ICONS.sensitive}</div>;
            case 'loud': return <div className={`${iconClass} bg-amber-500/20 text-amber-300`}>{ICONS.loud}</div>;
            case 'call': return <div className={`${iconClass} bg-rose-500/20 text-rose-300`}>{ICONS.phone}</div>;
            case 'game': return <div className={`${iconClass} bg-violet-500/20 text-violet-300`}>{ICONS.game}</div>;
            case 'whatsapp': return <div className={`${iconClass} bg-emerald-500/20 text-emerald-300`}>{ICONS.whatsapp}</div>;
            default: return <div className={`${iconClass} bg-blue-500/20 text-blue-300`}>{ICONS.bell}</div>;
        }
    }

    const allTodayTasks = user.tasks
        .flatMap(task => getScheduleForToday(task).map(time => ({ task, time })))
        .sort((a, b) => a.time.getTime() - b.time.getTime());

    return (
        <div className="p-4 md:p-6 space-y-6 relative pb-20">
            {showXp && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500/80 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50 animate-bounce">+10 XP</div>}
            
            <Mascot message={mascotMessage} />

            {suggestedMissions.length > 0 && (
                <div className="glass-card p-4 rounded-2xl">
                    <h3 className="text-lg font-bold text-white/90 mb-3 flex items-center gap-2 px-2">{ICONS.brain} Missões Diárias do Sync ({5-missionsAcceptedToday} restantes)</h3>
                    {isLoadingMissions ? (
                        <div className="text-center p-4 text-white/60">Buscando novas missões...</div>
                    ) : (
                        <div className="space-y-4">
                            {suggestedMissions.map(mission => (
                                <div key={mission.name} className="mission-card mission-card-enhanced p-4 rounded-xl shadow-lg">
                                   <p className="font-bold text-lg text-fuchsia-300">{mission.name}</p>
                                   <p className="text-white/80 mb-4 text-sm">{mission.description}</p>
                                   <button 
                                        onClick={() => handleAcceptMissionClick(mission)} 
                                        disabled={!canAcceptMoreMissions}
                                        className="w-full text-sm bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold py-2 px-3 rounded-lg hover:from-fuchsia-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:scale-100"
                                    >
                                        {canAcceptMoreMissions ? 'Aceitar Missão' : 'Limite Atingido'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="glass-card p-4 rounded-2xl">
                <h3 className="text-lg font-bold text-white/90 mb-4 px-2">Quadro de Tarefas de Hoje</h3>
                <div className="space-y-3">
                    {allTodayTasks.length > 0 ? allTodayTasks.map(({ task, time }) => {
                        const log = getLogForScheduledTime(task.id, time);
                        const isPast = new Date() > time;
                        const isSoon = !isPast && (time.getTime() - new Date().getTime()) < 3600000; // Less than 1 hour

                        let status = AdherenceStatus.PENDING;
                        if(log) status = log.status;
                        else if(isPast) status = AdherenceStatus.MISSED;

                        const isMission = task.isMission;

                        return (
                           <div key={`${task.id}-${time.toISOString()}`} className="flex items-center justify-between p-3 rounded-xl bg-black/10">
                                <div className="flex items-center gap-4">
                                    {getReminderIcon(task.reminderType)}
                                    <div>
                                        <p className="font-semibold text-white/90 flex items-center gap-2">
                                            {task.name}
                                            {isSoon && status === AdherenceStatus.PENDING && (
                                                <span className="time-badge bg-amber-500/20 text-amber-300 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Breve
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-white/60">{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {task.description}</p>
                                    </div>
                                </div>
                                {status === AdherenceStatus.TAKEN ? (
                                    <button className="w-40 text-sm bg-green-500/20 text-green-300 font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed" disabled>
                                        {ICONS.check} {isMission ? "Missão Concluída" : "Concluído"}
                                    </button>
                                ) : status === AdherenceStatus.MISSED ? (
                                    <button onClick={() => handleRegisterClick(task, time)} className="w-40 text-sm bg-yellow-500/20 text-yellow-300 font-semibold py-2 px-3 rounded-lg hover:bg-yellow-500/30 transition-colors">
                                        Registrar Atraso
                                    </button>
                                ) : (
                                     isMission ? (
                                        <button onClick={() => handleRegisterClick(task, time)} className="w-40 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-2 px-3 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.5)] transform hover:scale-105">
                                            Missão Concluída!
                                        </button>
                                     ) : (
                                        <button onClick={() => handleRegisterClick(task, time)} className="w-40 text-sm bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                            Registrar
                                        </button>
                                     )
                                )}
                            </div>
                        );
                    }) : (
                        <p className="text-center text-white/60 py-4">Nenhuma tarefa para hoje. Que tal aceitar uma missão do Sync?</p>
                    )}
                </div>
            </div>
            {gamifiedTask && (
                <GamifiedTaskModal 
                    isOpen={!!gamifiedTask}
                    onClose={() => setGamifiedTask(null)}
                    taskName={gamifiedTask.task.name}
                    onComplete={handleGameComplete}
                />
            )}
        </div>
    );
};

export default Dashboard;