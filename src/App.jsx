import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';

// Firebase Firestore Structure:
// Collection: "tracker"
//   - Document: "tasks" → { tasks: [...] }
//   - Document: "currentDay" → { day: number }
//   - Document: "dayHistory" → { day_1: {...}, day_2: {...}, ... }
//   - Document: "completedDays" → { days: [1, 3, 5, ...] }

const App = () => {
  const TOTAL_DAYS = 75;
  
  const [tasks, setTasks] = useState([
    { id: 'workout1', name: '45min Workout #1', icon: '💪' },
    { id: 'workout2', name: '45min Workout #2', icon: '🏋️' },
    { id: 'diet', name: 'Follow Diet (No Cheat)', icon: '🥗' },
    { id: 'water', name: '1 Gallon Water', icon: '💧' },
    { id: 'reading', name: '10 Pages Reading', icon: '📖' },
    { id: 'progress_pic', name: 'Progress Picture', icon: '📸' }
  ]);

  const [currentDay, setCurrentDay] = useState(1);
  const [dailyTasks, setDailyTasks] = useState(
    tasks.reduce((acc, task) => ({ ...acc, [task.id]: false }), {})
  );
  const [completedDays, setCompletedDays] = useState(new Set()); // Now empty by default
  const [showReport, setShowReport] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskIcon, setNewTaskIcon] = useState('⭐');
  const [editingTask, setEditingTask] = useState(null);
  const [dayHistory, setDayHistory] = useState({}); // Store completion status for each day
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Firebase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load tasks
        const tasksDoc = await getDoc(doc(db, 'tracker', 'tasks'));
        if (tasksDoc.exists()) {
          const loadedTasks = tasksDoc.data().tasks;
          setTasks(loadedTasks);
          setDailyTasks(loadedTasks.reduce((acc, task) => ({ ...acc, [task.id]: false }), {}));
        }

        // Load current day
        const currentDayDoc = await getDoc(doc(db, 'tracker', 'currentDay'));
        if (currentDayDoc.exists()) {
          setCurrentDay(currentDayDoc.data().day);
        }

        // Load day history
        const dayHistoryDoc = await getDoc(doc(db, 'tracker', 'dayHistory'));
        if (dayHistoryDoc.exists()) {
          const history = dayHistoryDoc.data();
          setDayHistory(history);
          
          // Load current day's tasks
          const currentDayKey = `day_${currentDayDoc.exists() ? currentDayDoc.data().day : 1}`;
          if (history[currentDayKey]) {
            setDailyTasks(history[currentDayKey]);
          }
        }

        // Load completed days
        const completedDaysDoc = await getDoc(doc(db, 'tracker', 'completedDays'));
        if (completedDaysDoc.exists()) {
          setCompletedDays(new Set(completedDaysDoc.data().days || []));
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save tasks to Firebase whenever they change
  useEffect(() => {
    if (!isLoading && tasks.length > 0) {
      setDoc(doc(db, 'tracker', 'tasks'), { tasks });
    }
  }, [tasks, isLoading]);

  // Save current day to Firebase
  useEffect(() => {
    if (!isLoading) {
      setDoc(doc(db, 'tracker', 'currentDay'), { day: currentDay });
    }
  }, [currentDay, isLoading]);

  // Save day history to Firebase
  useEffect(() => {
    if (!isLoading && Object.keys(dayHistory).length > 0) {
      setDoc(doc(db, 'tracker', 'dayHistory'), dayHistory);
    }
  }, [dayHistory, isLoading]);

  // Save completed days to Firebase
  useEffect(() => {
    if (!isLoading) {
      setDoc(doc(db, 'tracker', 'completedDays'), { days: Array.from(completedDays) });
    }
  }, [completedDays, isLoading]);

  // Calculate stats
  const todaysCompletion = tasks.length > 0 ? (Object.values(dailyTasks).filter(Boolean).length / tasks.length) * 100 : 0;
  const overallCompletion = ((completedDays.size / TOTAL_DAYS) * 100).toFixed(1);
  const streak = Array.from(completedDays).sort((a, b) => b - a)[0] || 0;

  // Auto-detect if current day is completed
  useEffect(() => {
    if (tasks.length > 0 && Object.values(dailyTasks).every(Boolean)) {
      setCompletedDays(prev => new Set([...prev, currentDay]));
      setDayHistory(prev => ({ ...prev, [currentDay]: { ...dailyTasks, completed: true } }));
    } else {
      setCompletedDays(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentDay);
        return newSet;
      });
    }
  }, [dailyTasks, tasks.length, currentDay]);

  const goToDay = (dayNum) => {
    // Save current day's progress
    setDayHistory(prev => ({ ...prev, [currentDay]: { ...dailyTasks } }));
    
    // Load the selected day's progress (or start fresh)
    setCurrentDay(dayNum);
    const savedDay = dayHistory[dayNum];
    if (savedDay) {
      setDailyTasks(savedDay);
    } else {
      // Fresh day - all tasks unchecked
      setDailyTasks(tasks.reduce((acc, task) => ({ ...acc, [task.id]: false }), {}));
    }
  };

  const toggleTask = (taskId) => {
    setDailyTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const addTask = () => {
    if (!newTaskName.trim()) return;
    
    const newTask = {
      id: `task_${Date.now()}`,
      name: newTaskName.trim(),
      icon: newTaskIcon
    };
    
    setTasks(prev => [...prev, newTask]);
    setDailyTasks(prev => ({ ...prev, [newTask.id]: false }));
    setNewTaskName('');
    setNewTaskIcon('⭐');
    setShowAddTask(false);
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setDailyTasks(prev => {
      const newTasks = { ...prev };
      delete newTasks[taskId];
      return newTasks;
    });
  };

  const startEditTask = (task) => {
    setEditingTask(task);
    setNewTaskName(task.name);
    setNewTaskIcon(task.icon);
    setShowAddTask(true);
  };

  const updateTask = () => {
    if (!newTaskName.trim() || !editingTask) return;
    
    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { ...task, name: newTaskName.trim(), icon: newTaskIcon }
        : task
    ));
    
    setNewTaskName('');
    setNewTaskIcon('⭐');
    setShowAddTask(false);
    setEditingTask(null);
  };

  const cancelEdit = () => {
    setNewTaskName('');
    setNewTaskIcon('⭐');
    setShowAddTask(false);
    setEditingTask(null);
  };

  const generateReport = () => {
    const completedTasks = tasks.filter(task => dailyTasks[task.id]);
    const report = `
🔥 75-DAY HARD CHALLENGE REPORT 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Day ${currentDay}/75 | Streak: ${streak} days

TODAY'S HUSTLE: ${todaysCompletion.toFixed(0)}%
✅ Completed: ${completedTasks.map(t => t.name).join(', ') || 'None yet'}
❌ Pending: ${tasks.filter(task => !dailyTasks[task.id]).map(t => t.name).join(', ') || 'All done!'}

THE LONG HAUL: ${overallCompletion}%
📊 Days Crushed: ${completedDays.size}/${TOTAL_DAYS}

${todaysCompletion === 100 ? '💎 FLAWLESS EXECUTION. NO EXCUSES.' : '⚡ Keep pushing. You got this.'}
    `.trim();

    navigator.clipboard.writeText(report);
    setShowReport(true);
    setTimeout(() => setShowReport(false), 3000);
  };

  const commonEmojis = ['💪', '🏋️', '🥗', '💧', '📖', '📸', '🏃', '🧘', '😴', '🎯', '🔥', '⭐', '✨', '🎵', '📝', '💼', '🎨', '🧠'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            ⏳
          </motion.div>
          <h2 className="text-2xl font-bold">Loading your progress...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent mb-2">
            75-DAY HARD CHALLENGE
          </h1>
          <p className="text-gray-400 text-lg">Your habits will determine your future.</p>
        </motion.div>

        {/* Progress Rings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-2xl"
          >
            <h3 className="text-xl font-semibold mb-4 text-orange-400">🔥 Today's Hustle</h3>
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#gradient1)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * 70 * (1 - todaysCompletion / 100)
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">{todaysCompletion.toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-400 mt-4">
              {Object.values(dailyTasks).filter(Boolean).length}/{tasks.length} tasks completed
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-2xl"
          >
            <h3 className="text-xl font-semibold mb-4 text-blue-400">🎯 The Long Haul</h3>
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#gradient2)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * 70 * (1 - overallCompletion / 100)
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">{overallCompletion}%</span>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-400 mt-4">
              {completedDays.size}/{TOTAL_DAYS} days crushed
            </p>
          </motion.div>
        </div>

        {/* Task Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-2xl mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">Day {currentDay} Tasks</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddTask(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-2 rounded-full font-semibold transition-all shadow-lg hover:shadow-blue-500/50"
              >
                ➕ Add Task
              </button>
              <button
                onClick={generateReport}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-full font-semibold transition-all shadow-lg hover:shadow-pink-500/50"
              >
                📋 AI Report Card
              </button>
            </div>
          </div>

          {/* Add/Edit Task Modal */}
          <AnimatePresence>
            {showAddTask && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={cancelEdit}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-900 border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                >
                  <h3 className="text-2xl font-bold mb-6">
                    {editingTask ? '✏️ Edit Task' : '➕ Add New Task'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Task Name</label>
                      <input
                        type="text"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        placeholder="e.g., 30min Cardio"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && (editingTask ? updateTask() : addTask())}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Icon (click to select)</label>
                      <div className="grid grid-cols-9 gap-2">
                        {commonEmojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => setNewTaskIcon(emoji)}
                            className={`text-2xl p-2 rounded-lg transition-all ${
                              newTaskIcon === emoji 
                                ? 'bg-blue-500 scale-110' 
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={newTaskIcon}
                        onChange={(e) => setNewTaskIcon(e.target.value)}
                        placeholder="Or type any emoji"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingTask ? updateTask : addTask}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
                    >
                      {editingTask ? 'Update' : 'Add'} Task
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                layout
              >
                <motion.div
                  className={`p-4 rounded-2xl border-2 transition-all relative group ${
                    dailyTasks[task.id]
                      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500 shadow-lg shadow-green-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                  animate={dailyTasks[task.id] ? { 
                    boxShadow: [
                      '0 0 20px rgba(34, 197, 94, 0.3)',
                      '0 0 40px rgba(34, 197, 94, 0.5)',
                      '0 0 20px rgba(34, 197, 94, 0.3)',
                    ]
                  } : {}}
                  transition={{ duration: 1, repeat: dailyTasks[task.id] ? Infinity : 0 }}
                >
                  {/* Edit and Delete buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditTask(task)}
                      className="bg-blue-500 hover:bg-blue-600 p-1.5 rounded-lg text-xs transition-all"
                      title="Edit task"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="bg-red-500 hover:bg-red-600 p-1.5 rounded-lg text-xs transition-all"
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>

                  <label className="cursor-pointer block">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={dailyTasks[task.id] || false}
                        onChange={() => toggleTask(task.id)}
                        className="checkbox checkbox-success"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{task.icon}</span>
                          <span className={`font-semibold ${dailyTasks[task.id] ? 'line-through text-gray-400' : ''}`}>
                            {task.name}
                          </span>
                        </div>
                      </div>
                      {dailyTasks[task.id] && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-400"
                        >
                          ✓
                        </motion.span>
                      )}
                    </div>
                  </label>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-xl mb-4">No tasks yet!</p>
              <p>Click "Add Task" to get started 💪</p>
            </div>
          )}
        </motion.div>

        {/* 75-Day Heatmap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-2xl"
        >
          <h3 className="text-2xl font-semibold mb-6">📊 75-Day Journey Heatmap</h3>
          <p className="text-gray-400 text-sm mb-4">Click any day to view/edit its tasks</p>
          <div className="grid grid-cols-15 gap-2">
            {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => (
              <motion.div
                key={day}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goToDay(day)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                  completedDays.has(day)
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50'
                    : day === currentDay
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 border-2 border-yellow-400 animate-pulse'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                title={`Day ${day}${completedDays.has(day) ? ' - Completed ✓' : day === currentDay ? ' - Today (Click to switch days)' : ' - Not completed'}`}
              >
                {day}
              </motion.div>
            ))}
          </div>
          <div className="flex gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500 to-emerald-600"></div>
              <span className="text-gray-400">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-orange-500 to-red-500 border-2 border-yellow-400"></div>
              <span className="text-gray-400">Current Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/10"></div>
              <span className="text-gray-400">Incomplete</span>
            </div>
          </div>
        </motion.div>

        {/* Report Notification */}
        <AnimatePresence>
          {showReport && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-2xl shadow-2xl max-w-sm"
            >
              <p className="font-semibold text-lg">📋 Report copied to clipboard!</p>
              <p className="text-sm text-white/80 mt-2">Share with your AI Queen 👑</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .checkbox {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 0.375rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          appearance: none;
          cursor: pointer;
          position: relative;
        }
        .checkbox:checked {
          background: linear-gradient(135deg, #10b981, #059669);
          border-color: #10b981;
        }
        .checkbox:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 1rem;
          font-weight: bold;
        }
        .grid-cols-15 {
          grid-template-columns: repeat(15, minmax(0, 1fr));
        }
        @media (max-width: 768px) {
          .grid-cols-15 {
            grid-template-columns: repeat(10, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default App;