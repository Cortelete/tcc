import React, { useState, useEffect, useCallback } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
import { UserProfile, Task, AdherenceStatus, CharacterPower, Achievement, AiSuggestedTask, TaskCriticality } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import Navigation from './components/Navigation';
import AddTaskModal from './components/AddTaskModal';
import OnboardingModal from './components/OnboardingModal';
import { ACHIEVEMENTS } from './constants';
import Mascot from './components/Mascot';
import { ICONS } from './constants';

// --- SUPABASE CLIENT SETUP ---
// NOTE: These should be in environment variables (.env file)
const supabaseUrl = process.env.SUPABASE_URL || "https://ixbldbgybpgxakqvkjgn.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4YmxkYmd5YnBneGFrdmFramduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgxMDQ3MDgsImV4cCI6MjAzMzY4MDcwOH0.M3fA7x76h176TpR58s1y89Gn2A8bIsx0OoQnso2b5aM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* 
  Supabase Database Schema Notes:
  - `profiles`: Stores user data, linked to `auth.users` by `id`. Columns are snake_case (e.g., `character_power`).
  - `tasks`: Stores tasks for each user, linked by `user_id`.
  - `task_history`: Stores adherence logs, linked by `user_id`.
  - Row Level Security (RLS) should be enabled on all tables to ensure users can only access their own data.
*/
// --- END SUPABASE SETUP ---


const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [activeView, setActiveView] = useState<'dashboard' | 'profile'>('dashboard');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [mascotMessage, setMascotMessage] = useState<string | null>(null);
    const [isCaregiverMode, setIsCaregiverMode] = useState(false);
    
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    // Fetch all user data (profile, tasks, history) in one go
    const fetchFullUserProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        return null;
      }
      
      if (!profileData) {
        // This is a new user who has signed up but not completed onboarding.
        setNeedsOnboarding(true);
        return null;
      }

      const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*').eq('user_id', user.id);
      const { data: historyData, error: historyError } = await supabase.from('task_history').select('*').eq('user_id', user.id);

      if (tasksError || historyError) {
        console.error('Error fetching tasks or history:', tasksError || historyError);
        // Return profile with empty arrays on error
      }
      
      // Map DB snake_case to app camelCase
      return {
        id: profileData.id,
        name: profileData.name,
        characterPower: profileData.character_power,
        anamnesis: profileData.anamnesis,
        xp: profileData.xp,
        achievements: profileData.achievements || [],
        mapProgress: profileData.map_progress,
        dailyMissionAcceptances: profileData.daily_mission_acceptances,
        tasks: (tasksData || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            startTime: t.start_time,
            frequencyHours: t.frequency_hours,
            criticality: t.criticality,
            reminderType: t.reminder_type,
            taskType: t.task_type,
            dosage: t.dosage,
            instructions: t.instructions,
            category: t.category,
            subcategory: t.subcategory,
            isMission: t.is_mission,
        })),
        taskHistory: (historyData || []).map((h: any) => ({
            taskId: h.task_id,
            scheduledTime: h.scheduled_time,
            status: h.status,
            actionTime: h.action_time,
        })),
      };
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchFullUserProfile(session.user).then(profile => {
                    if (profile) setCurrentUserProfile(profile);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                setLoading(true);
                 fetchFullUserProfile(session.user).then(profile => {
                    if (profile) setCurrentUserProfile(profile);
                    setLoading(false);
                });
            } else {
                setCurrentUserProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchFullUserProfile]);

    const handleAuth = async (mode: 'signIn' | 'signUp', email: string, password: string, username?: string): Promise<{ success: boolean; error?: string }> => {
        let authResponse;
        if (mode === 'signUp') {
            authResponse = await supabase.auth.signUp({ email, password });
            if (authResponse.data.user && !authResponse.error) {
                // Create a basic profile entry for the new user
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: authResponse.data.user.id,
                    name: username,
                    xp: 0,
                    achievements: [],
                    map_progress: 0,
                });
                if (profileError) {
                    console.error("Failed to create profile:", profileError);
                    return { success: false, error: "Falha ao criar perfil." };
                }
            }
        } else {
            authResponse = await supabase.auth.signInWithPassword({ email, password });
        }

        if (authResponse.error) {
            return { success: false, error: "Usuário ou senha inválidos." };
        }
        return { success: true };
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setCurrentUserProfile(null);
        setIsCaregiverMode(false);
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

    const handleOnboardingComplete = async (data: {
        name: string;
        characterPower: CharacterPower;
        mainGoal: string;
        challenges: string;
        initialTasks: Omit<Task, 'id'>[];
    }) => {
        if (!session?.user) return;
        
        const { error: profileError } = await supabase.from('profiles').update({
            name: data.name,
            character_power: data.characterPower,
            anamnesis: { mainGoal: data.mainGoal, challenges: data.challenges },
            xp: 50,
            achievements: ['welcome_hero'],
            map_progress: 1,
        }).eq('id', session.user.id);
        
        if (profileError) return console.error("Onboarding profile update failed:", profileError);

        const tasksToInsert = data.initialTasks.map(task => ({
            ...task,
            user_id: session.user.id,
            start_time: task.startTime,
            frequency_hours: task.frequencyHours,
            reminder_type: task.reminderType,
            task_type: task.taskType,
        }));

        if (tasksToInsert.length > 0) {
            const { error: tasksError } = await supabase.from('tasks').insert(tasksToInsert);
            if (tasksError) return console.error("Onboarding tasks insert failed:", tasksError);
        }

        const profile = await fetchFullUserProfile(session.user);
        if (profile) setCurrentUserProfile(profile);
        setNeedsOnboarding(false);
        setMascotMessage(`Bem-vindo(a), Herói ${data.name}! Sua jornada começa agora. Completei suas primeiras tarefas.`);
    };

    const handleLogTask = async (taskId: string, scheduledTime: Date, status: AdherenceStatus) => {
        if (!currentUserProfile) return;
        const newLog = { 
            user_id: currentUserProfile.id,
            task_id: taskId, 
            scheduled_time: scheduledTime.toISOString(), 
            status, 
            action_time: new Date().toISOString() 
        };

        const { error } = await supabase.from('task_history').upsert(newLog, { onConflict: 'user_id,task_id,scheduled_time' });
        if (error) return console.error('Error logging task:', error);
        
        const xpGained = status === AdherenceStatus.TAKEN ? 10 : 0;
        const newXp = currentUserProfile.xp + xpGained;
        
        const { updatedUser, newAchievements } = checkAchievements({ ...currentUserProfile, xp: newXp, taskHistory: [...currentUserProfile.taskHistory, { taskId, scheduledTime, status, actionTime: newLog.action_time }]});

        const { error: profileError } = await supabase.from('profiles').update({
            xp: updatedUser.xp,
            achievements: updatedUser.achievements,
        }).eq('id', currentUserProfile.id);
        if (profileError) return console.error('Error updating profile XP:', profileError);

        if (newAchievements.length > 0) {
            setMascotMessage(`Uau! Você desbloqueou: ${newAchievements.join(', ')}!`);
        }
        
        setCurrentUserProfile(updatedUser);
    };

    const handleAddTask = async (task: Omit<Task, 'id'>) => {
        if (!currentUserProfile) return;
        const taskToInsert = { ...task, user_id: currentUserProfile.id, start_time: task.startTime, frequency_hours: task.frequencyHours, reminder_type: task.reminderType, task_type: task.taskType };
        
        const { data, error } = await supabase.from('tasks').insert(taskToInsert).select().single();
        if (error || !data) return console.error('Error adding task:', error);
        
        const newTask: Task = { ...task, id: data.id };
        setCurrentUserProfile(prev => prev ? { ...prev, tasks: [...prev.tasks, newTask] } : null);
        setIsAddTaskModalOpen(false);
    };
    
    const handleAcceptMission = async (mission: AiSuggestedTask) => {
        if (!currentUserProfile) return;

        const newMission: Omit<Task, 'id'> = {
            ...mission,
            startTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            frequencyHours: 24,
            criticality: TaskCriticality.LOW,
            taskType: 'generic',
            isMission: true,
        };
        await handleAddTask(newMission); // Re-use the add task logic

        const today = new Date().toISOString().split('T')[0];
        const acceptances = currentUserProfile.dailyMissionAcceptances?.date === today 
            ? currentUserProfile.dailyMissionAcceptances 
            : { date: today, count: 0 };
        const newAcceptances = { ...acceptances, count: acceptances.count + 1 };
        
        const { error } = await supabase.from('profiles').update({ daily_mission_acceptances: newAcceptances }).eq('id', currentUserProfile.id);
        if(error) return console.error("Error updating mission acceptances:", error);

        setCurrentUserProfile(prev => prev ? { ...prev, dailyMissionAcceptances: newAcceptances } : null);
    };


    if (loading) {
        return <div className="main-background min-h-screen flex items-center justify-center text-white text-xl">Carregando...</div>;
    }

    if (!session) {
        return <Login onAuth={handleAuth} />;
    }

    if (needsOnboarding) {
        return <OnboardingModal isOpen={true} onComplete={handleOnboardingComplete} />;
    }
    
    if (!currentUserProfile) {
        // This can happen briefly while profile is loading or if something went wrong
        return <div className="main-background min-h-screen flex items-center justify-center text-white text-xl">Carregando perfil...</div>;
    }

    return (
        <div className="main-background min-h-screen font-sans">
            <main className="max-w-4xl mx-auto">
                <header className="p-4 md:p-6 flex justify-between items-center text-white">
                    <div className="flex flex-col">
                        <span className="text-sm text-white/60">
                            {isCaregiverMode ? `Monitorando ${currentUserProfile.name}` : 'Bem-vindo(a) de volta,'}
                        </span>
                        <h1 className="text-2xl font-bold">
                            {isCaregiverMode ? 'Painel do Cuidador' : currentUserProfile.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCaregiverMode(!isCaregiverMode)}
                            className={`p-2 rounded-lg transition-colors ${isCaregiverMode ? 'bg-cyan-500/30 text-cyan-300' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                            title={isCaregiverMode ? "Sair do Modo Cuidador" : "Entrar no Modo Cuidador"}
                            aria-label="Alternar modo cuidador"
                        >
                           {ICONS.caregiver}
                        </button>
                        <button onClick={handleLogout} className="text-white/60 hover:text-white flex items-center gap-2 p-2 rounded-lg hover:bg-white/10">
                           {ICONS.logout} Sair
                        </button>
                    </div>
                </header>

                {activeView === 'dashboard' && (
                    <Dashboard 
                        user={currentUserProfile} 
                        onLogTask={handleLogTask} 
                        onAcceptMission={handleAcceptMission}
                        setMascotMessage={setMascotMessage}
                        isCaregiverMode={isCaregiverMode}
                    />
                )}
                {activeView === 'profile' && <ProfilePage user={currentUserProfile} />}

                <Mascot user={currentUserProfile} systemMessage={mascotMessage} />
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