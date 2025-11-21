import { Mode, Task } from '../types';

const KEYS = {
  TASKS: 'modus_tasks',
  MODES: 'modus_modes',
  FIRST_LAUNCH: 'modus_first_launch'
};

const DEFAULT_MODES: Mode[] = [
  { id: 'mode-1', name: 'Dev', iconName: 'Code', color: 'blue' },
  { id: 'mode-2', name: 'School', iconName: 'BookOpen', color: 'orange' },
];

export const storageService = {
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error loading tasks", e);
      return [];
    }
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  getModes: (): Mode[] => {
    try {
      const data = localStorage.getItem(KEYS.MODES);
      return data ? JSON.parse(data) : DEFAULT_MODES;
    } catch (e) {
      return DEFAULT_MODES;
    }
  },

  saveModes: (modes: Mode[]) => {
    localStorage.setItem(KEYS.MODES, JSON.stringify(modes));
  },

  isFirstLaunch: (): boolean => {
    const hasLaunched = localStorage.getItem(KEYS.FIRST_LAUNCH);
    if (!hasLaunched) {
      localStorage.setItem(KEYS.FIRST_LAUNCH, 'true');
      return true;
    }
    return false;
  }
};