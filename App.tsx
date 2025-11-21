import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Settings, Archive, ChevronLeft, Check, Clock, Calendar, X, Trash2, Sparkles, ArrowRight, CalendarDays } from 'lucide-react';
import { Mode, Task, AVAILABLE_ICONS } from './types';
import { storageService } from './services/storageService';
import { IconRenderer } from './components/IconRenderer';

// --- Utils ---
const getTodayString = () => new Date().toISOString().split('T')[0];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === getTodayString()) return 'Today';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// --- Components ---

const TaskItem: React.FC<{
  task: Task;
  onComplete: (id: string) => void;
  onPostpone: (id: string) => void;
}> = ({ task, onComplete, onPostpone }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-3 group">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          glass-card rounded-2xl p-4 transition-all duration-300 relative overflow-hidden border-l-0
          ${task.completed 
            ? 'bg-emerald-900/10 border-emerald-500/20 opacity-60' 
            : 'hover:bg-zinc-800/60 hover:border-zinc-700'
          }
        `}
      >
        {/* Status Indicator Strip */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300
          ${task.completed 
            ? 'bg-emerald-500' 
            : task.postponedFrom 
              ? 'bg-yellow-400' 
              : 'bg-gradient-to-b from-brand-500 to-brand-600'
          }`} 
        />

        <div className="pl-3">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <h3 className={`text-lg font-medium leading-snug transition-all ${task.completed ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-zinc-100'}`}>
              {task.title}
            </h3>
            <div className={`
                shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                ${task.completed 
                  ? 'border-emerald-500 bg-emerald-500' 
                  : 'border-zinc-600 group-hover:border-brand-400'
                }
            `}>
               {task.completed && <Check size={14} className="text-black font-bold" />}
            </div>
          </div>

          {/* Meta Info */}
          <div className="mt-1.5 flex items-center gap-3 text-xs">
             {task.postponedFrom && (
               <span className="text-yellow-400 flex items-center gap-1.5 font-bold bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                 <Clock size={12} /> Postponed
               </span>
             )}
             {!task.completed && !task.postponedFrom && (
                <span className="text-zinc-500 flex items-center gap-1">
                    {isExpanded ? 'Select an action below' : 'Tap to manage'}
                </span>
             )}
          </div>
        </div>
      </div>

      {/* Expanded Actions */}
      {isExpanded && !task.completed && (
        <div className="flex gap-2 mt-2 pl-1 animate-fade-in">
          <button 
            onClick={(e) => { e.stopPropagation(); onComplete(task.id); setIsExpanded(false); }}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
          >
            <Check size={18} /> Complete
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onPostpone(task.id); setIsExpanded(false); }}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-900/20"
          >
            <ArrowRight size={18} /> Postpone
          </button>
        </div>
      )}
    </div>
  );
};

const ModeConfigItem: React.FC<{
  mode: Mode;
  onUpdate: (mode: Mode) => void;
  onDelete: () => void;
  isActive: boolean;
}> = ({ mode, onUpdate, onDelete, isActive }) => {
  return (
    <div className="glass-card p-4 rounded-2xl mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-zinc-800 rounded-xl">
          <IconRenderer iconName={mode.iconName} size={20} className="text-brand-400" />
        </div>
        <input 
          value={mode.name}
          onChange={(e) => onUpdate({...mode, name: e.target.value})}
          className="bg-transparent border-b border-zinc-700 text-white font-medium text-lg w-full focus:outline-none focus:border-brand-500 transition-colors placeholder-zinc-600 pb-1"
          placeholder="Mode Name"
        />
        <button onClick={onDelete} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {AVAILABLE_ICONS.map(icon => (
          <button
            key={icon}
            onClick={() => onUpdate({...mode, iconName: icon})}
            className={`p-2.5 rounded-xl transition-all ${mode.iconName === icon ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25' : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}
          >
            <IconRenderer iconName={icon} size={18} />
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modes, setModes] = useState<Mode[]>([]);
  const [activeModeId, setActiveModeId] = useState<string>('');
  const [view, setView] = useState<'home' | 'archive' | 'settings'>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Add Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(getTodayString());
  const [newTaskModeId, setNewTaskModeId] = useState('');

  // Load Initial Data
  useEffect(() => {
    setTasks(storageService.getTasks());
    const loadedModes = storageService.getModes();
    setModes(loadedModes);
    if (loadedModes.length > 0) {
      setActiveModeId(loadedModes[0].id);
    }
  }, []);

  // Persist Data
  useEffect(() => {
    if (tasks.length > 0 || storageService.isFirstLaunch()) storageService.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (modes.length > 0) storageService.saveModes(modes);
  }, [modes]);

  // Computed Data
  const todayString = getTodayString();
  
  const activeMode = modes.find(m => m.id === activeModeId);

  const visibleTasks = useMemo(() => {
    return tasks.filter(t => 
      t.modeId === activeModeId && 
      t.date === todayString
    );
  }, [tasks, activeModeId, todayString]);

  const archiveDates = useMemo(() => {
    const dates = new Set(tasks.map(t => t.date));
    // Exclude today and future, sort descending
    const validDates = (Array.from(dates) as string[])
        .filter(d => d < todayString)
        .sort((a, b) => b.localeCompare(a));
    return validDates;
  }, [tasks, todayString]);

  // Actions
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      date: newTaskDate,
      modeId: newTaskModeId || activeModeId,
      completed: false
    };
    
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setIsAddModalOpen(false);
  };

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const postponeTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, date: tomorrowStr, postponedFrom: task.date } : t
    ));
  };

  const addMode = () => {
    if (modes.length >= 4) return;
    const newMode: Mode = {
      id: crypto.randomUUID(),
      name: 'New Mode',
      iconName: 'Star',
      color: 'brand'
    };
    setModes(prev => [...prev, newMode]);
  };

  const updateMode = (updated: Mode) => {
    setModes(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const deleteMode = (id: string) => {
    if (modes.length <= 1) return;
    setModes(prev => prev.filter(m => m.id !== id));
    if (activeModeId === id) setActiveModeId(modes[0].id);
  };

  // View Rendering

  const renderHome = () => (
    <div className="pb-36 pt-8 px-5 min-h-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-2">
            {activeMode?.name}
          </h1>
          <p className="text-brand-400 font-bold text-sm mt-1 uppercase tracking-wider">{formatDate(todayString)}</p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={() => setView('archive')}
                className="w-10 h-10 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
                <Archive size={18} />
            </button>
            <button 
                onClick={() => setView('settings')}
                className="w-10 h-10 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
                <Settings size={18} />
            </button>
        </div>
      </div>

      {/* Empty State */}
      {visibleTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-zinc-900/30 rounded-full flex items-center justify-center mb-6 border border-zinc-800/50 animate-pulse-slow">
            <Sparkles size={36} className="text-brand-500 opacity-80" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">All Clear</h3>
          <p className="text-zinc-500 max-w-[200px] leading-relaxed">
             Tap the <span className="text-brand-500 font-bold">+</span> button to start your flow for {activeMode?.name}.
          </p>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-1 animate-slide-up">
        {visibleTasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onComplete={toggleComplete} 
            onPostpone={postponeTask} 
          />
        ))}
      </div>
    </div>
  );

  const renderArchive = () => (
    <div className="pb-32 pt-8 px-5 min-h-screen bg-black">
      <div className="flex items-center gap-4 mb-8">
        <button 
            onClick={() => setView('home')}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-zinc-800 transition-all"
        >
            <ChevronLeft size={22} />
        </button>
        <h1 className="text-2xl font-bold text-white">History Log</h1>
      </div>

      <div className="space-y-6 animate-slide-up">
        {archiveDates.length === 0 ? (
            <div className="text-center text-zinc-600 py-10">No history yet. Finish your first day!</div>
        ) : (
            archiveDates.map(date => {
            const dayTasks = tasks.filter(t => t.date === date);
            const allComplete = dayTasks.length > 0 && dayTasks.every(t => t.completed);
            const completedCount = dayTasks.filter(t => t.completed).length;
            
            return (
                <div key={date} className="glass-card rounded-2xl p-5 border-l-4 border-l-zinc-700 overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">{formatDate(date)}</h3>
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide ${allComplete ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                            {completedCount}/{dayTasks.length} DONE
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {dayTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 text-sm text-zinc-400">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${task.completed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className={`truncate ${task.completed ? 'line-through opacity-50' : 'text-zinc-300'}`}>{task.title}</span>
                            {task.postponedFrom && <span className="text-[10px] text-yellow-500 ml-auto">Postponed</span>}
                        </div>
                        ))}
                    </div>
                </div>
            );
            })
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="pb-32 pt-8 px-5 min-h-screen bg-black">
      <div className="flex items-center gap-4 mb-8">
        <button 
            onClick={() => setView('home')}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-zinc-800 transition-all"
        >
            <ChevronLeft size={22} />
        </button>
        <h1 className="text-2xl font-bold text-white">Modes</h1>
      </div>

      <div className="space-y-4 animate-slide-up">
        {modes.map(mode => (
          <ModeConfigItem 
            key={mode.id} 
            mode={mode} 
            onUpdate={updateMode} 
            onDelete={() => deleteMode(mode.id)}
            isActive={activeModeId === mode.id}
          />
        ))}

        {modes.length < 4 && (
            <button 
                onClick={addMode}
                className="w-full py-5 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500 font-bold flex items-center justify-center gap-2 hover:border-brand-500/50 hover:text-brand-400 hover:bg-brand-500/5 transition-all"
            >
                <Plus size={20} /> Create New Mode
            </button>
        )}
      </div>
      
      <div className="mt-8 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 text-center">
          <p className="text-sm text-zinc-500">
            Modes help you separate contexts like Work, School, or Fitness.
          </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-brand-500 selection:text-black">
      
      {/* Main Content Area */}
      {view === 'home' && renderHome()}
      {view === 'archive' && renderArchive()}
      {view === 'settings' && renderSettings()}

      {/* Bottom Floating Dock (Updated Design) */}
      {view === 'home' && (
        <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none safe-bottom">
          <div className="pointer-events-auto flex items-center gap-3 px-3 py-2.5 bg-[#09090b]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl shadow-black/60 transition-all duration-300 animate-slide-up hover:bg-[#09090b]/90">
            
            {/* Left Modes */}
            <div className="flex gap-1">
                {modes.slice(0, Math.ceil(modes.length / 2)).map(mode => (
                     <button
                        key={mode.id}
                        onClick={() => setActiveModeId(mode.id)}
                        className={`group relative flex flex-col items-center justify-center w-11 h-11 rounded-full transition-all duration-300 
                            ${activeModeId === mode.id 
                                ? 'text-brand-500' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                            }`}
                     >
                        <IconRenderer iconName={mode.iconName} size={20} strokeWidth={activeModeId === mode.id ? 2.5 : 2} />
                        <span className={`absolute -bottom-1 w-1 h-1 rounded-full bg-brand-500 transition-all duration-300 ${activeModeId === mode.id ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                     </button>
                ))}
            </div>

            {/* Center Action (Slightly Floating) */}
            <button 
                onClick={() => {
                    setNewTaskModeId(activeModeId);
                    setNewTaskDate(getTodayString());
                    setIsAddModalOpen(true);
                }}
                className="relative -my-4 w-14 h-14 bg-brand-500 text-black rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30 ring-4 ring-black transition-all active:scale-95 hover:scale-105 hover:-translate-y-1"
            >
                <Plus size={28} strokeWidth={3} />
            </button>

            {/* Right Modes */}
            <div className="flex gap-1">
                {modes.slice(Math.ceil(modes.length / 2)).map(mode => (
                     <button
                        key={mode.id}
                        onClick={() => setActiveModeId(mode.id)}
                        className={`group relative flex flex-col items-center justify-center w-11 h-11 rounded-full transition-all duration-300 
                            ${activeModeId === mode.id 
                                ? 'text-brand-500' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                            }`}
                     >
                        <IconRenderer iconName={mode.iconName} size={20} strokeWidth={activeModeId === mode.id ? 2.5 : 2} />
                        <span className={`absolute -bottom-1 w-1 h-1 rounded-full bg-brand-500 transition-all duration-300 ${activeModeId === mode.id ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                     </button>
                ))}
            </div>

          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-[#121214] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-slide-up border-t sm:border border-zinc-800 shadow-2xl safe-bottom relative">
                
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-800 rounded-full sm:hidden" />

                <div className="flex justify-between items-center mb-8 mt-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Create Task</h2>
                    <button 
                        onClick={() => setIsAddModalOpen(false)}
                        className="p-2.5 bg-zinc-900 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <input 
                    autoFocus
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Start typing..."
                    className="w-full bg-transparent text-3xl text-white placeholder:text-zinc-700 font-bold border-none focus:ring-0 p-0 mb-10 caret-brand-500"
                />

                <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800/50">
                        <div className="flex items-center gap-3 text-zinc-400 font-medium">
                            <div className="p-2 bg-zinc-800 rounded-lg text-brand-400">
                                <CalendarDays size={18} />
                            </div>
                            <span>Due Date</span>
                        </div>
                        <input 
                            type="date" 
                            value={newTaskDate}
                            onChange={(e) => setNewTaskDate(e.target.value)}
                            className="bg-transparent text-right text-white font-bold focus:outline-none appearance-none"
                        />
                    </div>

                    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800/50">
                        <div className="flex items-center gap-3 text-zinc-400 mb-4 font-medium">
                             <div className="p-2 bg-zinc-800 rounded-lg text-brand-400">
                                <Sparkles size={18} />
                            </div>
                            <span>Select Mode</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {modes.map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setNewTaskModeId(mode.id)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 
                                        ${newTaskModeId === mode.id 
                                            ? 'bg-brand-500 text-black shadow-md shadow-brand-500/20 ring-1 ring-brand-400' 
                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    <IconRenderer iconName={mode.iconName} size={14} />
                                    {mode.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleAddTask}
                    disabled={!newTaskTitle.trim()}
                    className="w-full py-4 bg-brand-500 text-black rounded-2xl font-bold text-lg hover:bg-brand-400 active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-brand-500 disabled:cursor-not-allowed shadow-xl shadow-brand-500/20"
                >
                    Add to {modes.find(m => m.id === (newTaskModeId || activeModeId))?.name}
                </button>
            </div>
        </div>
      )}
    </div>
  );
}