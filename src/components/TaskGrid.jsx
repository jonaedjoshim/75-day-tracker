import React from 'react';
import TaskCard from './TaskCard';

const TaskGrid = ({ tasks, dailyTasks, currentDay, toggleTask, setShowAddTask, generateReport, startEditTask, deleteTask }) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      <h3 className="text-2xl font-bold">Day {currentDay} Hustle</h3>
      <div className="flex gap-3">
        <button onClick={() => setShowAddTask(true)} className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full text-sm font-bold transition-all">➕ Task</button>
        <button onClick={generateReport} className="bg-pink-600 hover:bg-pink-700 px-5 py-2 rounded-full text-sm font-bold transition-all">📋 Report</button>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task, i) => (
        <TaskCard key={task.id} task={task} index={i} isCompleted={dailyTasks[task.id]} toggleTask={toggleTask} startEditTask={startEditTask} deleteTask={deleteTask} />
      ))}
    </div>
  </div>
);

export default TaskGrid;