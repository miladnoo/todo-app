export interface Mode {
  id: string;
  name: string;
  iconName: string; // Maps to a lucide icon
  color: string;
}

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  modeId: string;
  completed: boolean;
  postponedFrom?: string | null; // Date string if postponed
}

export type IconName = 'Code' | 'BookOpen' | 'Briefcase' | 'Home' | 'Dumbbell' | 'Music' | 'Coffee' | 'Star';

export const AVAILABLE_ICONS: IconName[] = ['Code', 'BookOpen', 'Briefcase', 'Home', 'Dumbbell', 'Music', 'Coffee', 'Star'];
