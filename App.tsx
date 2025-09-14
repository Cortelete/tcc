import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { User, Task, AdherenceStatus, ReminderType, CharacterPower, Achievement, AiSuggestedTask, TaskCriticality } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import Navigation from './components/Navigation';
import AddTaskModal from './components/AddTaskModal';
import OnboardingModal from './components/OnboardingModal';
import { ACHIEVEMENTS } from './constants';
import Mascot from './components/Mascot';
import { ICONS } from './constants';


const App: React.FC = () => {
    const [users, setUsers] = useLocalStorage<User[]>('neurosync-users', []);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeView, setActiveView] = useState<'dashboard' | 'profile'>('dashboard');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [mascotMessage, setMascotMessage] = useState<string | null>(null);
    
    const [needsOnboarding, setNeedsOnboarding] = useState(false);
    const [tempUserForOnboarding, setTempUserForOnboarding] = useState<{ id: string; name: string } | null>(null);

    const checkAchievements = useCallback((user: User): User => {
        let newUser = { ...user };
        let newAchievements: string[] = [];

        ACHIEVEMENTS.forEach((achievement: Achievement) => {
            if (!newUser.achievements.includes(achievement.id) && achievement.condition(newUser)) {
                newUser.achievements = [...newUser.achievements, achievement.id];
                newAchievements.push(achievement.name);
            }
        });

        if (newAchievements.length > 0) {
            setMascotMessage(`Uau! Você desbloqueou a conquista: ${newAchievements.join(', ')}!`);
        }
        return newUser;
    }, []);

    const updateUser = useCallback((updatedUser: User) => {
        const userWithAchievements = checkAchievements(updatedUser);
        setCurrentUser(userWithAchievements);
        setUsers(prevUsers => prevUsers.map(u => u.id === userWithAchievements.id ? userWithAchievements : u));
    }, [setUsers, checkAchievements]);

    useEffect(() => {
        const loggedInUserId = localStorage.getItem('neurosync-logged-in');
        if (loggedInUserId) {
            const user = users.find(u => u.id === loggedInUserId);
            if (user) {
                if (user.characterPower) {
                    setCurrentUser(user);
                } else {
                    setTempUserForOnboarding({ id: user.id, name: user.name });
                    setNeedsOnboarding(true);
                }
            }
        }
    }, [users]);

    const handleAuth = (username: string, password?: string): boolean => {
        if (!username.trim()) return false;
        const user = users.find(u => u.name.toLowerCase() === username.toLowerCase());
        
        if (user) {
            // User exists, log them in.
            localStorage.setItem('neurosync-logged-in', user.id);
            if (user.characterPower) {
                setCurrentUser(user);
            } else {
                setTempUserForOnboarding({ id: user.id, name: user.name });
                setNeedsOnboarding(true);
            }
            return true;
        } else {
            // User does not exist, register them.
            const newUser: User = {
                id: `user_${Date.now()}`,
                name: username,
                characterPower: null,
                anamnesis: null,
                tasks: [],
                taskHistory: [],
                xp: 0,
                achievements: [],
                mapProgress: 0
            };
            setUsers([...users, newUser]);
            localStorage.setItem('neurosync-logged-in', newUser.id);
            setTempUserForOnboarding({ id: newUser.id, name: newUser.name });
            setNeedsOnboarding(true);
            return true;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('neurosync-logged-in');
        setCurrentUser(null);
    };

    const handleOnboardingComplete = (data: {
        name: string;
        characterPower: CharacterPower;
        mainGoal: string;
        challenges: string;
        initialTasks: Omit<Task, 'id'>[];
    }) => {
        const userId = tempUserForOnboarding!.id;
        const tasksWithIds = data.initialTasks.map(task => ({
            ...task,
            id: `task_${Date.now()}_${Math.random()}`
        }));

        const userToUpdate = users.find(u => u.id === userId);
        if(!userToUpdate) return;

        const updatedUser: User = {
            ...userToUpdate,
            name: data.name,
            characterPower: data.characterPower,
            anamnesis: { mainGoal: data.mainGoal, challenges: data.challenges },
            tasks: tasksWithIds,
            taskHistory: [],
            xp: 50,
            achievements: ['welcome_hero'],
            mapProgress: 1,
        };
        
        updateUser(updatedUser);
        setNeedsOnboarding(false);
        setTempUserForOnboarding(null);
        setMascotMessage(`Bem-vindo(a), Herói ${data.name}! Sua jornada começa agora. Completei suas primeiras tarefas.`);
    };

    const handleLogTask = (taskId: string, scheduledTime: Date, status: AdherenceStatus) => {
        if (!currentUser) return;
        const newLog = { taskId, scheduledTime: scheduledTime.toISOString(), status, actionTime: new Date().toISOString() };
        
        const existingLogIndex = currentUser.taskHistory.findIndex(log => 
            log.taskId === taskId && 
            new Date(log.scheduledTime).getTime() === scheduledTime.getTime()
        );

        let updatedHistory;
        if (existingLogIndex > -1) {
            updatedHistory = [...currentUser.taskHistory];
            updatedHistory[existingLogIndex] = newLog;
        } else {
            updatedHistory = [...currentUser.taskHistory, newLog];
        }

        const xpGained = status === AdherenceStatus.TAKEN ? 10 : 0;
        const newXp = currentUser.xp + xpGained;

        const updatedUser = {
            ...currentUser,
            taskHistory: updatedHistory,
            xp: newXp
        };
        updateUser(updatedUser);
    };

    const handleAddTask = (task: Omit<Task, 'id'>) => {
        if (!currentUser) return;
        const newTask: Task = {
            ...task,
            id: `task_${Date.now()}`
        };
        const updatedUser = {
            ...currentUser,
            tasks: [...currentUser.tasks, newTask]
        };
        updateUser(updatedUser);
        setIsAddTaskModalOpen(false);
    };

    const handleAcceptMission = (mission: AiSuggestedTask) => {
        if (!currentUser) return;

        const today = new Date().toISOString().split('T')[0];
        const acceptances = currentUser.dailyMissionAcceptances?.date === today 
            ? currentUser.dailyMissionAcceptances 
            : { date: today, count: 0 };
        
        if (acceptances.count >= 5) return;

        const newMission: Task = {
            ...mission,
            id: `mission_${Date.now()}`,
            startTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            frequencyHours: 24,
            criticality: TaskCriticality.LOW,
            taskType: 'generic',
            isMission: true,
        };
        const updatedUser = {
            ...currentUser,
            tasks: [...currentUser.tasks, newMission],
            dailyMissionAcceptances: { ...acceptances, count: acceptances.count + 1 }
        };
        updateUser(updatedUser);
    };

    if (!currentUser) {
        if (needsOnboarding && tempUserForOnboarding) {
            return <OnboardingModal isOpen={true} onComplete={handleOnboardingComplete} />;
        }
        return <Login onLogin={handleAuth} onSwitchToRegister={() => alert("Para criar uma conta, basta digitar um novo nome de usuário e clicar em 'Entrar'. A senha é opcional.")} />;
    }

    return (
        <div className="main-background min-h-screen font-sans">
            <main className="max-w-4xl mx-auto">
                <header className="p-4 md:p-6 flex justify-between items-center text-white">
                    <div className="flex flex-col">
                        <span className="text-sm text-white/60">Bem-vindo(a) de volta,</span>
                        <h1 className="text-2xl font-bold">{currentUser.name}</h1>
                    </div>
                    <button onClick={handleLogout} className="text-white/60 hover:text-white flex items-center gap-2 p-2 rounded-lg hover:bg-white/10">
                       {ICONS.logout} Sair
                    </button>
                </header>

                {activeView === 'dashboard' && (
                    <Dashboard 
                        user={currentUser} 
                        onLogTask={handleLogTask} 
                        onAcceptMission={handleAcceptMission}
                        setMascotMessage={setMascotMessage}
                    />
                )}
                {activeView === 'profile' && <ProfilePage user={currentUser} />}

                <Mascot user={currentUser} systemMessage={mascotMessage} />
            </main>
            
            <Navigation 
                activeView={activeView} 
                setActiveView={setActiveView} 
                onAddTaskClick={() => setIsAddTaskModalOpen(true)}
            />

            <AddTaskModal
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
                onAddTask={handleAddTask}
                defaultReminderType="alarm"
            />
        </div>
    );
};

export default App;