export enum TaskCriticality {
  HIGH = 'Alta',
  MEDIUM = 'Média',
  LOW = 'Baixa',
}

export enum AdherenceStatus {
  TAKEN = 'TAKEN',
  MISSED = 'MISSED',
  PENDING = 'PENDING',
}

export type ReminderType = 'alarm' | 'sensitive' | 'loud' | 'call' | 'game' | 'whatsapp';

export type CharacterPower = 'focus' | 'memory' | 'calm' | 'patient';
export type PatientCondition = 'tdah' | 'tea' | 'superdotacao' | 'outro';

export type TaskType = 'generic' | 'medication';

export interface Task {
  id: string;
  name: string;
  description: string;
  frequencyHours: number;
  startTime: string; // HH:mm format
  criticality: TaskCriticality;
  reminderType: ReminderType;
  taskType: TaskType;
  isMission?: boolean;
  dosage?: string; // e.g., "1 comprimido"
  instructions?: string; // e.g., "Tomar com comida"
  category?: string; // e.g., "Vitamina"
  subcategory?: string; // e.g., "Vitamina D"
  icon?: JSX.Element;
}

export interface TaskLog {
  taskId: string;
  scheduledTime: Date;
  actionTime?: Date;
  status: AdherenceStatus;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: JSX.Element;
    condition: (user: User) => boolean;
}

export interface Anamnesis {
    challenges: string;
    goals: string;
}

export interface User {
  id: string;
  username: string; // for login
  password?: string; // for login
  fullName: string;
  name: string; // Nickname
  age: number;
  tasks: Task[];
  taskHistory: TaskLog[];
  xp: number;
  level: number;
  achievements: string[]; // Array of achievement IDs
  characterPower: CharacterPower | null;
  patientCondition?: PatientCondition;
  hasMedicalReport?: boolean;
  dailyMissionAcceptances?: { date: string, count: number };
  defaultReminderType: ReminderType;
  mapProgress: number; // Number of nodes unlocked on the map
  onboardingComplete: boolean;
  anamnesis?: Anamnesis;
  isMinor?: boolean;
  guardianInfo?: { name: string; email: string };
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