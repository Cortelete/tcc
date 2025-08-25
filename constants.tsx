import React from 'react';
import { User, TaskCriticality, AdherenceStatus, Achievement, Task } from './types';

export const ICONS = {
    user: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    pill: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10H4.222a2.222 2.222 0 00-1.055.27l-1.91 1.037a2.222 2.222 0 00-.98 1.954v0a2.222 2.222 0 002.222 2.222h10.556a2.222 2.222 0 002.222-2.222v-2.223a2.222 2.222 0 00-2.222-2.222z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l2.11-7.585a2.222 2.222 0 014.136 1.15L18 10" /></svg>,
    clock: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    check: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    close: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    plus: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
    bell: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    brain: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.874 15.632c-1.012-1.23-1.624-2.753-1.624-4.385C3.25 8.127 5.922 5.5 9.25 5.5s6 2.627 6 5.747c0 1.632-.612 3.155-1.624 4.385m-9.752 0c.23.278.473.543.725.793m9.027-.793c-.252-.25-.495-.515-.725-.793m-8.302 0c2.4-2.825 6.01-2.825 8.302 0m-8.302 0c-1.385 1.62-1.385 4.013 0 5.633m8.302 0c1.385-1.62 1.385-4.013 0-5.633" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5v-2.5m0 0V15m0 1-2.5-1.5m2.5 1.5L14.5 15M9 13H7.5m9.5 0H15m-5.626-6.368L10.5 8m3-1.368L13.5 8" /></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    tasks: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    game: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    phone: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    sensitive: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    loud: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>,
    whatsapp: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    trophy: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>,
    first_step: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    morning: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    perfect_week: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
    welcome: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.252A5.481 5.481 0 006.75 11.75c0 3.023 2.477 5.498 5.5 5.498s5.5-2.475 5.5-5.498c0-1.594-.67-3.033-1.75-4.048" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 11.75v.007" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.252a5.481 5.481 0 015.498 5.498c0 .412-.047.813-.138 1.202" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.252A5.481 5.481 0 006.75 11.75c0 .412.047.813.138 1.202" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 15.25a3 3 0 10-6 0v1.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-1.5z" /></svg>,
    power_focus: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l4 4" /></svg>,
    power_memory: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    power_calm: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    power_patient: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>,
    mascot: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="50" cy="50" r="40" stroke="#FFF" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="45" r="5" stroke="#FFF" fill="#FFF"/><circle cx="60" cy="45" r="5" stroke="#FFF" fill="#FFF"/><path d="M40 60 Q50 70 60 60" stroke="#FFF"/><path d="M20 50 A30 30 0 0 1 80 50" stroke="#FFF" fill="none" strokeDasharray="5 5"/><path d="M48 20 A20 20 0 0 1 52 20" stroke="#FFF" fill="#FFF" /></svg>,
    water: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4H7zm0 0a4 4 0 004-4V5" /></svg>,
    meditate: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m-4-5v5m0 0V7m0 5a2 2 0 100-4 2 2 0 000 4z" /><path d="M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>,
    pause: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18v-6a6 6 0 1112 0v6" /><path d="M6 12H5a3 3 0 00-3 3v2a3 3 0 003 3h1" /><path d="M18 12h1a3 3 0 013 3v2a3 3 0 01-3 3h-1" /></svg>,
    stretch: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /><path d="M3 10h18M3 14h18" /></svg>,
};

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'welcome_hero',
        name: 'Boas-Vindas, Herói!',
        description: 'Complete a configuração inicial.',
        icon: ICONS.welcome,
        condition: (user: User) => true // Awarded manually
    },
    {
        id: 'first_step',
        name: 'Primeiro Passo',
        description: 'Conclua sua primeira tarefa.',
        icon: ICONS.first_step,
        condition: (user: User) => user.taskHistory.filter(t => t.status === AdherenceStatus.TAKEN).length >= 1
    },
    {
        id: 'morning_person',
        name: 'Madrugador',
        description: 'Conclua 3 tarefas antes das 9h.',
        icon: ICONS.morning,
        condition: (user: User) => {
            return user.taskHistory.filter(log => {
                const time = new Date(log.actionTime || log.scheduledTime);
                return log.status === AdherenceStatus.TAKEN && time.getHours() < 9;
            }).length >= 3;
        }
    },
    {
        id: 'perfect_week',
        name: 'Semana Perfeita',
        description: 'Conclua todas as tarefas agendadas por 7 dias seguidos.',
        icon: ICONS.perfect_week,
        condition: (user: User) => {
             // This is a simplified logic for demonstration
            const last7daysLogs = user.taskHistory.filter(log => {
                const logDate = new Date(log.scheduledTime);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - logDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            });
            const missed = last7daysLogs.some(log => log.status === AdherenceStatus.MISSED);
            return !missed && last7daysLogs.length > 5; // Example condition
        }
    }
];

export const SUGGESTED_ONBOARDING_TASKS: Omit<Task, 'id'>[] = [
    { 
        name: 'Beber Água', 
        description: 'Manter a hidratação', 
        icon: ICONS.water,
        startTime: '08:00',
        frequencyHours: 2,
        criticality: TaskCriticality.LOW,
        reminderType: 'sensitive',
        taskType: 'generic'
    },
    { 
        name: 'Meditar', 
        description: '5 minutos de mindfulness', 
        icon: ICONS.meditate,
        startTime: '07:30',
        frequencyHours: 24,
        criticality: TaskCriticality.MEDIUM,
        reminderType: 'alarm',
        taskType: 'generic'
    },
    { 
        name: 'Fazer Pausa', 
        description: 'Pausa para recarregar', 
        icon: ICONS.pause,
        startTime: '15:00',
        frequencyHours: 4,
        criticality: TaskCriticality.LOW,
        reminderType: 'sensitive',
        taskType: 'generic'
    },
     { 
        name: 'Alongar', 
        description: 'Movimentar o corpo', 
        icon: ICONS.stretch,
        startTime: '10:00',
        frequencyHours: 3,
        criticality: TaskCriticality.LOW,
        reminderType: 'alarm',
        taskType: 'generic'
    },
]


export const INITIAL_USER_DATA: User = {
  id: 'user-1',
  name: 'Alex',
  age: 28,
  xp: 0,
  level: 0,
  achievements: [],
  tasks: [],
  taskHistory: [],
  characterPower: null,
  defaultReminderType: 'alarm',
  mapProgress: 0,
  dailyMissionAcceptances: { date: new Date().toISOString().split('T')[0], count: 0 },
};