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
  condition: (user: User) => boolean;
}

export interface Anamnesis {
    mainGoal: string;
    challenges: string;
}

export interface User {
  id: string;
  name: string;
  age?: number;
  characterPower: CharacterPower | null;
  patientCondition?: string;
  anamnesis: Anamnesis | null;
  tasks: Task[];
  taskHistory: TaskLog[];
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
