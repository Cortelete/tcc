import React from 'react';

export enum AdherenceStatus {
  TAKEN = 'taken',
  MISSED = 'missed',
  PENDING = 'pending',
}

export enum TaskCriticality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export type ReminderType = 'alarm' | 'sensitive' | 'loud' | 'call' | 'game' | 'whatsapp';
export type TaskType = 'generic' | 'medication';
export type CharacterPower = 'focus' | 'memory' | 'calm' | 'patient';

export interface Task {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  startTime: string; // "HH:MM"
  frequencyHours: number;
  criticality: TaskCriticality;
  reminderType: ReminderType;
  taskType: TaskType;
  dosage?: string;
  instructions?: string;
  category?: string;
  subcategory?: string;
  isMission?: boolean;
}

export interface TaskLog {
  taskId: string;
  scheduledTime: Date | string;
  status: AdherenceStatus;
  actionTime?: Date | string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  condition: (user: UserProfile) => boolean;
}

export interface Anamnesis {
    mainGoal: string;
    challenges: string;
}

// Renamed from User to UserProfile to avoid conflict with Supabase auth User type
export interface UserProfile {
  id: string; // Corresponds to Supabase auth.users.id
  name: string;
  characterPower: CharacterPower | null;
  anamnesis: Anamnesis | null;
  tasks: Task[]; // Populated from 'tasks' table
  taskHistory: TaskLog[]; // Populated from 'task_history' table
  xp: number;
  achievements: string[];
  mapProgress: number;
  dailyMissionAcceptances?: {
      date: string; // YYYY-MM-DD
      count: number;
  };
}

export interface AiInsight {
  analysis: string;
  recommendation: string;
}

export interface AiSuggestedTask {
  name: string;
  description: string;
  reminderType: ReminderType;
}
