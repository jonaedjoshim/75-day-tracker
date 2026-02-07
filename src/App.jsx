import React, { useState, useEffect } from 'react';
import { useTrackerData } from './hooks/useTrackerData';
import Header from './components/Header';
import ProgressRings from './components/ProgressRings';
import Heatmap from './components/Heatmap';
import TaskGrid from './components/TaskGrid';
import TaskModal from './components/TaskModal';

const App = () => {
  const TOTAL_DAYS = 75;
  const { tasks, setTasks, currentDay, setCurrentDay, dailyTasks, setDailyTasks, completedDays, setCompletedDays, dayHistory, setDayHistory, isLoading } = useTrackerData(TOTAL_DAYS);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskIcon, setNewTaskIcon] = useState('⭐');

  // Logic: Auto-check completion
  useEffect(() => {
    if (tasks.length > 0 && Object.values(dailyTasks).every(Boolean) && Object.keys(dailyTasks).length === tasks.length) {
      setCompletedDays(prev => new Set(prev).add(currentDay));
    } else {
      setCompletedDays(prev => { const n = new Set(prev); n.delete(currentDay); return n; });
    }
  }, [dailyTasks, tasks.length, currentDay]);

  const toggleTask = (id) => setDailyTasks(p => ({ ...p, [id]: !p[id] }));

  const goToDay = (num) => {
    setDayHistory(p => ({ ...p, [`day_${currentDay}`]: dailyTasks }));
    setCurrentDay(num);
    setDailyTasks(dayHistory[`day_${num}`] || tasks.reduce((a, t) => ({ ...a, [t.id]: false }), {}));
  };

  const addTask = () => {
    const t = { id: `t_${Date.now()}`, name: newTaskName, icon: newTaskIcon };
    setTasks(p => [...p, t]);
    setDailyTasks(p => ({ ...p, [t.id]: false }));
    setShowAddTask(false); setNewTaskName('');
  };

  const deleteTask = (id) => {
    setTasks(p => p.filter(t => t.id !== id));
    setDailyTasks(p => { const n = { ...p }; delete n[id]; return n; });
  };

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center text-orange-500 font-bold">CHALLENGE LOADING... 🔥</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 selection:bg-orange-500/30">
      <div className="max-w-7xl mx-auto">
        <Header />
        <ProgressRings
          todaysCompletion={(Object.values(dailyTasks).filter(Boolean).length / tasks.length) * 100 || 0}
          overallCompletion={((completedDays.size / TOTAL_DAYS) * 100).toFixed(1)}
          TOTAL_DAYS={TOTAL_DAYS} completedDaysSize={completedDays.size} tasksLength={tasks.length} dailyTasksChecked={Object.values(dailyTasks).filter(Boolean).length}
        />
        <TaskGrid tasks={tasks} dailyTasks={dailyTasks} currentDay={currentDay} toggleTask={toggleTask} setShowAddTask={setShowAddTask} startEditTask={(t) => { setEditingTask(t); setNewTaskName(t.name); setShowAddTask(true); }} deleteTask={deleteTask} />
        <Heatmap TOTAL_DAYS={TOTAL_DAYS} completedDays={completedDays} currentDay={currentDay} goToDay={goToDay} />
        <TaskModal showAddTask={showAddTask} editingTask={editingTask} newTaskName={newTaskName} setNewTaskName={setNewTaskName} newTaskIcon={newTaskIcon} setNewTaskIcon={setNewTaskIcon} cancelEdit={() => { setShowAddTask(false); setEditingTask(null); }} addTask={addTask} updateTask={() => { setTasks(p => p.map(t => t.id === editingTask.id ? { ...t, name: newTaskName, icon: newTaskIcon } : t)); setShowAddTask(false); }} />
      </div>
    </div>
  );
};

export default App;