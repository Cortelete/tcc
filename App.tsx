import React, { useState, useMemo, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { User, AdherenceStatus, TaskLog, Task, AiSuggestedTask, TaskCriticality, CharacterPower, ReminderType, PatientCondition } from './types';
import { ICONS, ACHIEVEMENTS } from './constants';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import AddTaskModal from './components/AddTaskModal';
import ProfilePage from './components/ProfilePage';
import Navigation from './components/Navigation';
import OnboardingModal from './components/OnboardingModal';
import Mascot from './components/Mascot';


const App: React.FC = () => {
    const [users, setUsers] = useLocalStorage<User[]>('neurosync-users', []);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [activeView, setActiveView] = useState<'dashboard' | 'profile'>('dashboard');
    const [mascotMessage, setMascotMessage] = useState<string | null>(null);
    
    useEffect(() => {
        // This is a simple auto-login mechanism for demonstration.
        // In a real app, you'd use session tokens.
        const lastUserId = localStorage.getItem('neurosync-lastUser');
        if (lastUserId) {
            const userToLogin = users.find(u => u.id === lastUserId);
            if (userToLogin) {
                setCurrentUser(userToLogin);
            }
        }
    }, [users]);
    
    const userLevel = useMemo(() => currentUser ? Math.floor(currentUser.xp / 100) : 0, [currentUser]);
    
    const updateCurrentUser = (updatedUser: User) => {
        setCurrentUser(updatedUser);
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleLogin = (username: string, password?: string) => {
        const userToLogin = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        // Simple login for demo - no password check if not set
        if (userToLogin && (!userToLogin.password || userToLogin.password === password)) {
            setCurrentUser(userToLogin);
            localStorage.setItem('neurosync-lastUser', userToLogin.id);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('neurosync-lastUser');
    };

    const awardXpAndAchievements = (currentUser: User, xp: number): User => {
        const updatedUser = { ...currentUser };
        
        const oldLevel = Math.floor(updatedUser.xp / 100);
        updatedUser.xp += xp;
        const newLevel = Math.floor(updatedUser.xp / 100);

        updatedUser.level = newLevel;

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
        if (!currentUser) return;
        
        const newUser = JSON.parse(JSON.stringify(currentUser));
        
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
        
        const xpToAward = currentUser.tasks.find(t => t.id === taskId)?.isMission ? 15 : 10;
        const updatedUser = awardXpAndAchievements(newUser, xpToAward);
        updateCurrentUser(updatedUser);
    };
    
    const handleAddTask = (taskData: Omit<Task, 'id'>) => {
        if (!currentUser) return;
        
        const newTask: Task = {
            ...taskData,
            id: `task-${new Date().getTime()}`
        };
        const updatedUser = {
            ...currentUser,
            tasks: [...currentUser.tasks, newTask]
        };
        updateCurrentUser(updatedUser);
        setIsAddTaskModalOpen(false);
    };

    const handleAcceptMission = (mission: Omit<Task, 'id' | 'criticality' | 'frequencyHours' | 'startTime' | 'taskType' | 'dosage' | 'instructions'>) => {
        if (!currentUser) return;

        const today = new Date().toISOString().split('T')[0];
        let acceptances = currentUser.dailyMissionAcceptances || { date: today, count: 0 };

        if (acceptances.date !== today) {
            acceptances = { date: today, count: 0 };
        }

        if (acceptances.count >= 5) {
            setMascotMessage("Limite de missões diárias atingido.");
            return;
        }

        const now = new Date();
        const startTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const taskData: Omit<Task, 'id'> = {
            ...mission,
            startTime,
            frequencyHours: 24,
            criticality: TaskCriticality.MEDIUM,
            taskType: 'generic',
            isMission: true,
        };
        
        const newTask: Task = {
            ...taskData,
            id: `mission-${new Date().getTime()}`
        };

        const updatedUser = {
            ...currentUser,
            tasks: [...currentUser.tasks, newTask],
            dailyMissionAcceptances: { ...acceptances, count: acceptances.count + 1 },
        };
        updateCurrentUser(updatedUser);
    }
    
    const handleCompleteOnboarding = (data: Omit<User, 'id'>) => {
        let newUser: User = {
            ...data,
            id: `user-${new Date().getTime()}`,
        };

        if (!newUser.achievements.includes('welcome_hero')) {
            newUser.achievements.push('welcome_hero');
        }
        newUser = awardXpAndAchievements(newUser, 50);
        
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        setIsRegistering(false);
        localStorage.setItem('neurosync-lastUser', newUser.id);
    };

    const renderContent = () => {
        if (!currentUser) {
            if (isRegistering) {
                return <OnboardingModal onComplete={handleCompleteOnboarding} onBackToLogin={() => setIsRegistering(false)} />;
            }
            return <Login onLogin={handleLogin} onSwitchToRegister={() => setIsRegistering(true)} />;
        }
    
        if (!currentUser.onboardingComplete) {
            // This case handles users who registered but didn't finish.
            // For this implementation, registration is one step.
            // We could expand this to a multi-step process later.
             return <OnboardingModal onComplete={handleCompleteOnboarding} onBackToLogin={() => setIsRegistering(false)} />;
        }
        
        return (
            <>
                <header className="sticky top-0 z-20 glass-card border-b-0 rounded-none">
                    <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <img src="/public/logo.png" alt="NeuroSync Logo" className="h-8 w-8"/>
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
                    {activeView === 'dashboard' && <Dashboard user={currentUser} onLogTask={handleLogTask} onAcceptMission={handleAcceptMission} setMascotMessage={setMascotMessage} />}
                    {activeView === 'profile' && <ProfilePage user={currentUser} />}
                </main>
                <Mascot systemMessage={mascotMessage} user={currentUser} />
                <Navigation activeView={activeView} setActiveView={setActiveView} onAddTaskClick={() => setIsAddTaskModalOpen(true)} />
                <AddTaskModal 
                    isOpen={isAddTaskModalOpen}
                    onClose={() => setIsAddTaskModalOpen(false)}
                    onAddTask={handleAddTask}
                    defaultReminderType={currentUser.defaultReminderType}
                />
            </>
        );
    };
    
    const mainClasses = `main-background font-sans text-white min-h-screen ${currentUser && currentUser.onboardingComplete ? 'pb-28' : ''}`;

    return (
        <div className={mainClasses}>
           {renderContent()}
        </div>
    );
};

export default App;