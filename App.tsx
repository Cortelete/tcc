
import React, { useState, useCallback, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { User, AdherenceStatus, Task, AiSuggestedTask, TaskCriticality } from './types';
import { ACHIEVEMENTS, ICONS } from './constants';
import Login from './components/Login';
import OnboardingModal from './components/OnboardingModal';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import Navigation from './components/Navigation';
import AddTaskModal from './components/AddTaskModal';
import Mascot from './components/Mascot';

const App: React.FC = () => {
    const [users, setUsers] = useLocalStorage<User[]>('neurosync-users', []);
    const [currentUser, setCurrentUser] = useLocalStorage<User | null>('neurosync-currentUser', null);
    const [view, setView] = useState<'login' | 'register'>('login');
    const [activeAppView, setActiveAppView] = useState<'dashboard' | 'profile'>('dashboard');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [mascotMessage, setMascotMessage] = useState<string | null>(null);

    useEffect(() => {
        const testUserExists = users.some(u => u.username === 'teste');
        if (!testUserExists) {
            const testUser: User = {
                id: 'user-teste',
                username: 'teste',
                password: 'teste',
                fullName: 'Usuário de Teste',
                name: 'Teste',
                age: 25,
                characterPower: 'focus',
                tasks: [
                     { id: 'task-1', name: 'Beber Água', description: 'Manter a hidratação', startTime: '08:00', frequencyHours: 2, criticality: TaskCriticality.LOW, reminderType: 'sensitive', taskType: 'generic' },
                     { id: 'task-2', name: 'Meditar', description: '5 minutos de mindfulness', startTime: '07:30', frequencyHours: 24, criticality: TaskCriticality.MEDIUM, reminderType: 'alarm', taskType: 'generic' }
                ],
                defaultReminderType: 'alarm',
                xp: 120,
                level: 1,
                achievements: ['welcome_hero', 'first_step'],
                taskHistory: [],
                mapProgress: 0,
                onboardingComplete: true,
            };
            setUsers(prevUsers => [...prevUsers, testUser]);
        }
    }, []);


    const updateUser = useCallback((updatedUser: User) => {
        let newAchievementsFound = false;
        ACHIEVEMENTS.forEach(ach => {
            if (!updatedUser.achievements.includes(ach.id) && ach.condition(updatedUser)) {
                updatedUser.achievements.push(ach.id);
                if (!newAchievementsFound) {
                    setMascotMessage(`Nova conquista: ${ach.name}!`);
                    newAchievementsFound = true;
                }
            }
        });

        const newMapProgress = Math.floor(updatedUser.xp / 250);
        if (newMapProgress > (updatedUser.mapProgress || 0)) {
            updatedUser.mapProgress = newMapProgress;
            if (!newAchievementsFound) { // Don't overwrite achievement message
                 setMascotMessage(`Você avançou no Mapa da Jornada!`);
            }
        }

        setCurrentUser(updatedUser);
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    }, [setCurrentUser, setUsers]);

    const handleLogin = (username: string, password?: string): boolean => {
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === (password || ''));
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setView('login');
    };

    const handleRegister = (newUserData: Omit<User, 'id'>) => {
        const newUser: User = {
            ...newUserData,
            id: `user-${new Date().getTime()}`,
            xp: 50,
            achievements: ['welcome_hero']
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
    };

    const handleLogTask = (taskId: string, scheduledTime: Date, status: AdherenceStatus) => {
        if (!currentUser) return;
        const newLog = { taskId, scheduledTime, status, actionTime: new Date() };
        let updatedUser = { ...currentUser, taskHistory: [...currentUser.taskHistory, newLog] };
        if (status === AdherenceStatus.TAKEN) {
            updatedUser.xp += 10;
        }
        updateUser(updatedUser);
    };

    const handleAddTask = (task: Omit<Task, 'id'>) => {
        if (!currentUser) return;
        const newTask: Task = { ...task, id: `task-${new Date().getTime()}` };
        const updatedUser = { ...currentUser, tasks: [...currentUser.tasks, newTask] };
        updateUser(updatedUser);
        setIsAddTaskModalOpen(false);
    };
    
    const handleAcceptMission = (mission: AiSuggestedTask) => {
        if (!currentUser) return;
        const newMission: Task = {
            id: `mission-${new Date().getTime()}`,
            name: mission.name,
            description: mission.description,
            frequencyHours: 24,
            startTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'}),
            criticality: TaskCriticality.MEDIUM,
            reminderType: mission.reminderType,
            taskType: 'generic',
            isMission: true,
        };
        
        const today = new Date().toISOString().split('T')[0];
        let acceptances = currentUser.dailyMissionAcceptances;

        if (acceptances?.date === today) {
            acceptances.count += 1;
        } else {
            acceptances = { date: today, count: 1 };
        }

        const updatedUser = { 
            ...currentUser, 
            tasks: [...currentUser.tasks, newMission],
            dailyMissionAcceptances: acceptances
        };
        updateUser(updatedUser);
    };

    if (!currentUser) {
        if (view === 'register') {
            return <OnboardingModal onComplete={handleRegister} onBackToLogin={() => setView('login')} />;
        }
        return <Login onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />;
    }

    return (
        <div className="bg-slate-900 text-white min-h-screen font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="p-4 flex justify-between items-center md:pt-6 md:px-6">
                    <div>
                        <h1 className="text-xl font-bold">Olá, {currentUser.name}!</h1>
                        <p className="text-sm text-white/60">Pronto para sua jornada de hoje?</p>
                    </div>
                     <button onClick={handleLogout} className="text-white/60 hover:text-white transition-colors p-2 rounded-full bg-black/20" aria-label="Sair">
                        {ICONS.logout}
                    </button>
                </header>

                <main>
                    {activeAppView === 'dashboard' ? (
                        <Dashboard
                            user={currentUser}
                            onLogTask={handleLogTask}
                            onAcceptMission={handleAcceptMission}
                            setMascotMessage={setMascotMessage}
                        />
                    ) : (
                        <ProfilePage user={currentUser} />
                    )}
                </main>
                
                <Mascot user={currentUser} systemMessage={mascotMessage} />

                <Navigation
                    activeView={activeAppView}
                    setActiveView={setActiveAppView}
                    onAddTaskClick={() => setIsAddTaskModalOpen(true)}
                />

                <AddTaskModal
                    isOpen={isAddTaskModalOpen}
                    onClose={() => setIsAddTaskModalOpen(false)}
                    onAddTask={handleAddTask}
                    defaultReminderType={currentUser.defaultReminderType}
                />
            </div>
        </div>
    );
};

export default App;
