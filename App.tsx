import React, { useState, useCallback, useEffect } from 'react';
import { UserProfile, Task, AdherenceStatus, CharacterPower, Achievement, AiSuggestedTask, TaskCriticality, Anamnesis } from './types';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import Navigation from './components/Navigation';
import AddTaskModal from './components/AddTaskModal';
import OnboardingModal from './components/OnboardingModal';
import AppTour from './components/AppTour';
import { ACHIEVEMENTS, SUGGESTED_ONBOARDING_TASKS, MAP_NODES } from './constants';
import Mascot from './components/Mascot';
import useLocalStorage from './hooks/useLocalStorage';
import { ICONS } from './constants';
import Login from './components/Login';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useLocalStorage('isAuthenticated', false);
    const [currentUserProfile, setCurrentUserProfile] = useLocalStorage<UserProfile | null>('user-profile', null);
    const [hasSeenTour, setHasSeenTour] = useLocalStorage('hasSeenTour', false);
    
    const [activeView, setActiveView] = useState<'dashboard' | 'profile'>('dashboard');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [mascotMessage, setMascotMessage] = useState<string | null>(null);
    const [isTourActive, setIsTourActive] = useState(false);
    
    useEffect(() => {
        if (currentUserProfile && !hasSeenTour) {
            const timer = setTimeout(() => {
                setIsTourActive(true);
            }, 1000); // Delay to allow UI to render
            return () => clearTimeout(timer);
        }
    }, [currentUserProfile, hasSeenTour]);

    const handleTourComplete = () => {
        setIsTourActive(false);
        setHasSeenTour(true);
    };

    const checkAchievements = useCallback((user: UserProfile): { updatedUser: UserProfile, newAchievements: string[] } => {
        let newUser = { ...user };
        let newAchievements: string[] = [];

        ACHIEVEMENTS.forEach((achievement: Achievement) => {
            if (!newUser.achievements.includes(achievement.id) && achievement.condition(newUser)) {
                newUser.achievements = [...newUser.achievements, achievement.id];
                newAchievements.push(achievement.name);
            }
        });
        
        return { updatedUser: newUser, newAchievements };
    }, []);

    const handleOnboardingComplete = (data: {
        name: string;
        characterPower: CharacterPower;
        mainGoal: string;
        challenges: string;
        initialTasks: Omit<Task, 'id'>[];
    }) => {
        const initialTasksWithIds = data.initialTasks.map(task => ({
            ...task,
            id: crypto.randomUUID(),
        }));
        
        const newUser: UserProfile = {
            id: crypto.randomUUID(),
            name: data.name,
            characterPower: data.characterPower,
            anamnesis: { mainGoal: data.mainGoal, challenges: data.challenges },
            xp: 50,
            achievements: ['welcome_hero'],
            mapProgress: 1,
            tasks: initialTasksWithIds,
            taskHistory: [],
            dailyMissionAcceptances: {
                date: new Date().toISOString().split('T')[0],
                count: 0
            }
        };

        setCurrentUserProfile(newUser);
        setHasSeenTour(false); // Reset tour for new user
        setMascotMessage(`Bem-vindo(a), Herói ${data.name}! Sua jornada começa agora. Configurei suas primeiras tarefas.`);
    };

    const handleLogTask = (taskId: string, scheduledTime: Date, status: AdherenceStatus) => {
        if (!currentUserProfile) return;

        const newLog = { 
            taskId, 
            scheduledTime, 
            status, 
            actionTime: new Date() 
        };

        // Remove any existing log for this exact time to prevent duplicates
        const updatedHistory = currentUserProfile.taskHistory.filter(log => 
            !(log.taskId === taskId && new Date(log.scheduledTime).getTime() === scheduledTime.getTime())
        );
        updatedHistory.push(newLog);

        const xpGained = status === AdherenceStatus.TAKEN ? 10 : 0;
        const newXp = currentUserProfile.xp + xpGained;
        
        const oldLevel = Math.floor(currentUserProfile.xp / 100);
        const newLevel = Math.floor(newXp / 100);
        const newMapProgress = newLevel + 1;

        const profileWithNewLog = { 
            ...currentUserProfile, 
            xp: newXp, 
            taskHistory: updatedHistory,
            mapProgress: newMapProgress
        };
        const { updatedUser, newAchievements } = checkAchievements(profileWithNewLog);

        if (newLevel > oldLevel) {
            const newLocationIndex = Math.min(newMapProgress - 1, MAP_NODES.length - 1);
            const newLocation = MAP_NODES[newLocationIndex];
            setMascotMessage(`Incrível! Você avançou para ${newLocation.name} no seu mapa da jornada!`);
        } else if (newAchievements.length > 0) {
            setMascotMessage(`Uau! Você desbloqueou: ${newAchievements.join(', ')}!`);
        }
        
        setCurrentUserProfile(updatedUser);
    };

    const handleAddTask = (task: Omit<Task, 'id'>) => {
        if (!currentUserProfile) return;
        
        const newTask: Task = { ...task, id: crypto.randomUUID() };
        setCurrentUserProfile(prev => prev ? { ...prev, tasks: [...prev.tasks, newTask] } : null);
        setIsAddTaskModalOpen(false);
    };
    
    const handleAcceptMission = (mission: AiSuggestedTask) => {
        if (!currentUserProfile) return;

        const newMission: Omit<Task, 'id'> = {
            ...mission,
            startTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            frequencyHours: 24,
            criticality: TaskCriticality.LOW,
            taskType: 'generic',
            isMission: true,
        };
        handleAddTask(newMission); // Re-use the add task logic

        const today = new Date().toISOString().split('T')[0];
        const acceptances = currentUserProfile.dailyMissionAcceptances?.date === today 
            ? currentUserProfile.dailyMissionAcceptances 
            : { date: today, count: 0 };
        const newAcceptances = { ...acceptances, count: acceptances.count + 1 };
        
        setCurrentUserProfile(prev => prev ? { ...prev, dailyMissionAcceptances: newAcceptances } : null);
    };
    
    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setCurrentUserProfile(null);
        setIsAuthenticated(false);
        setHasSeenTour(false);
    };

    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    if (!currentUserProfile) {
        return <OnboardingModal isOpen={true} onComplete={handleOnboardingComplete} />;
    }

    return (
        <div className="main-background min-h-screen font-sans">
            <main className="max-w-4xl mx-auto">
                <header className="p-4 md:p-6 flex justify-between items-center text-white">
                    <div className="flex flex-col">
                        <span className="text-sm text-white/60">
                           Bem-vindo(a) de volta,
                        </span>
                        <h1 className="text-2xl font-bold">
                            {currentUserProfile.name}
                        </h1>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 p-2 px-3 rounded-lg text-white/70 bg-slate-500/10 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                        aria-label="Sair"
                    >
                        {ICONS.logout}
                        <span className="hidden sm:inline text-sm font-medium">Sair</span>
                    </button>
                </header>

                {activeView === 'dashboard' && (
                    <Dashboard 
                        user={currentUserProfile} 
                        onLogTask={handleLogTask} 
                        onAcceptMission={handleAcceptMission}
                        setMascotMessage={setMascotMessage}
                        isCaregiverMode={false} // Caregiver mode removed in SPA version
                    />
                )}
                {activeView === 'profile' && <ProfilePage user={currentUserProfile} />}
            </main>
            
            <Mascot user={currentUserProfile} systemMessage={mascotMessage} />

            <Navigation
                activeView={activeView}
                setActiveView={setActiveView}
                onAddTaskClick={() => setIsAddTaskModalOpen(true)}
            />

            <AddTaskModal
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
                onAddTask={handleAddTask}
                defaultReminderType={currentUserProfile.characterPower === 'patient' ? 'call' : 'alarm'}
            />
            
            {isTourActive && <AppTour onComplete={handleTourComplete} />}
        </div>
    );
};

export default App;