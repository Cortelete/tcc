import React, { useState, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { User, AdherenceStatus, TaskLog, Task, AiSuggestedTask, TaskCriticality, CharacterPower, ReminderType, PatientCondition } from './types';
import { INITIAL_USER_DATA, ICONS, ACHIEVEMENTS } from './constants';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import AddTaskModal from './components/AddTaskModal';
import ProfilePage from './components/ProfilePage';
import Navigation from './components/Navigation';
import OnboardingModal from './components/OnboardingModal';


const App: React.FC = () => {
    const [user, setUser] = useLocalStorage<User>('userData', INITIAL_USER_DATA);
    const [onboardingComplete, setOnboardingComplete] = useLocalStorage('onboardingComplete', false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [activeView, setActiveView] = useState<'dashboard' | 'profile'>('dashboard');
    
    const userLevel = useMemo(() => Math.floor(user.xp / 100), [user.xp]);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        // Optional: Reset user data on logout
        // setUser(INITIAL_USER_DATA);
        // setOnboardingComplete(false);
    };

    const awardXpAndAchievements = (currentUser: User, xp: number): User => {
        const updatedUser = { ...currentUser };
        
        const oldLevel = Math.floor(updatedUser.xp / 100);
        updatedUser.xp += xp;
        const newLevel = Math.floor(updatedUser.xp / 100);

        updatedUser.level = newLevel;

        // Advance on map every 2 levels
        if (newLevel > oldLevel && newLevel % 2 === 0) {
            updatedUser.mapProgress = (updatedUser.mapProgress || 0) + 1;
        }

        ACHIEVEMENTS.forEach(achievement => {
            if (!updatedUser.achievements.includes(achievement.id) && achievement.condition(updatedUser)) {
                updatedUser.achievements.push(achievement.id);
            }
        });

        return updatedUser;
    };

    const handleLogTask = (taskId: string, scheduledTime: Date, status: AdherenceStatus) => {
        setUser(prevUser => {
            const newUser = JSON.parse(JSON.stringify(prevUser));
            
            const newLog: TaskLog = {
                taskId,
                scheduledTime,
                status,
                actionTime: new Date()
            };

            const existingLogIndex = newUser.taskHistory.findIndex((log: TaskLog) => 
                log.taskId === taskId && new Date(log.scheduledTime).getTime() === scheduledTime.getTime()
            );

            if (existingLogIndex !== -1) {
                newUser.taskHistory[existingLogIndex] = newLog;
            } else {
                newUser.taskHistory.push(newLog);
            }
            
            newUser.taskHistory.sort((a: TaskLog, b: TaskLog) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());
            
            const xpToAward = prevUser.tasks.find(t => t.id === taskId)?.isMission ? 15 : 10;
            return awardXpAndAchievements(newUser, xpToAward);
        });
    };
    
    const handleAddTask = (taskData: Omit<Task, 'id'>) => {
        setUser(prevUser => {
            const newUser = {...prevUser};
            const newTask: Task = {
                ...taskData,
                id: `task-${new Date().getTime()}`
            };
            newUser.tasks.push(newTask);
            return newUser;
        });
        setIsAddTaskModalOpen(false);
    };

    const handleAcceptMission = (mission: Omit<Task, 'id' | 'criticality' | 'frequencyHours' | 'startTime' | 'taskType' | 'dosage' | 'instructions'>) => {
        setUser(prevUser => {
            const today = new Date().toISOString().split('T')[0];
            let acceptances = prevUser.dailyMissionAcceptances || { date: today, count: 0 };

            if (acceptances.date !== today) {
                acceptances = { date: today, count: 0 };
            }

            if (acceptances.count >= 5) {
                console.log("Limite de missões diárias atingido.");
                return prevUser;
            }

            const now = new Date();
            const startTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const taskData: Omit<Task, 'id'> = {
                ...mission,
                startTime,
                frequencyHours: 24, // Missions are for today
                criticality: TaskCriticality.MEDIUM,
                taskType: 'generic',
                isMission: true,
            };
            
            const newTask: Task = {
                ...taskData,
                id: `mission-${new Date().getTime()}`
            };

            return {
                ...prevUser,
                tasks: [...prevUser.tasks, newTask],
                dailyMissionAcceptances: { ...acceptances, count: acceptances.count + 1 },
            };
        });
    }
    
    const handleCompleteOnboarding = (data: {
        name: string, 
        power: CharacterPower, 
        tasks: Omit<Task, 'id'>[], 
        reminderType: ReminderType,
        patientCondition?: PatientCondition,
        hasMedicalReport?: boolean,
    }) => {
        setUser(prevUser => {
            let updatedUser: User = {
                ...prevUser,
                name: data.name,
                characterPower: data.power,
                defaultReminderType: data.reminderType,
                tasks: [...prevUser.tasks, ...data.tasks.map((t, i) => ({...t, id: `onboarding-task-${i}`}))],
                achievements: [...prevUser.achievements],
                patientCondition: data.patientCondition,
                hasMedicalReport: data.hasMedicalReport,
            };
            if (!updatedUser.achievements.includes('welcome_hero')) {
                updatedUser.achievements = [...updatedUser.achievements, 'welcome_hero'];
            }
            updatedUser = awardXpAndAchievements(updatedUser, 50);
            return updatedUser;
        });
        setOnboardingComplete(true);
    };

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} />;
    }
    
    if (!onboardingComplete) {
        return <OnboardingModal user={user} onComplete={handleCompleteOnboarding} />
    }
    
    return (
        <div className="main-background font-sans text-white pb-28 min-h-screen">
            <header className="sticky top-0 z-20 glass-card border-b-0 rounded-none">
                <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-violet-400">{ICONS.brain}</span>
                        <h1 className="text-xl font-bold text-white">NeuroSync AI</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-semibold glass-card px-3 py-1 rounded-full border-0">
                            Nível {userLevel}
                        </div>
                         <button onClick={handleLogout} className="text-white/80 hover:text-rose-400" aria-label="Sair">
                            {ICONS.logout}
                        </button>
                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto relative">
                {activeView === 'dashboard' && <Dashboard user={user} onLogTask={handleLogTask} onAcceptMission={handleAcceptMission} />}
                {activeView === 'profile' && <ProfilePage user={user} />}
            </main>
            <Navigation activeView={activeView} setActiveView={setActiveView} onAddTaskClick={() => setIsAddTaskModalOpen(true)} />
            <AddTaskModal 
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
                onAddTask={handleAddTask}
                defaultReminderType={user.defaultReminderType}
            />
        </div>
    );
};

export default App;