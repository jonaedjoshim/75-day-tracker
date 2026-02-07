import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TaskModal = ({ showAddTask, editingTask, newTaskName, setNewTaskName, newTaskIcon, setNewTaskIcon, cancelEdit, updateTask, addTask }) => {
  const emojis = ['💪', '🏋️', '🥗', '💧', '📖', '📸', '🏃', '🧘', '🎯', '🔥', '⭐', '✨'];
  if (!showAddTask) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={cancelEdit}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} className="bg-gray-900 border border-white/20 rounded-3xl p-8 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'New Hustle'}</h3>
        <input value={newTaskName} onChange={e => setNewTaskName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 outline-none focus:border-blue-500" placeholder="Task name..." />
        <div className="grid grid-cols-6 gap-2 mb-6">
          {emojis.map(e => (
            <button key={e} onClick={() => setNewTaskIcon(e)} className={`p-2 rounded-lg ${newTaskIcon === e ? 'bg-blue-600' : 'bg-white/5'}`}>{e}</button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={cancelEdit} className="flex-1 py-3 text-gray-400">Cancel</button>
          <button onClick={editingTask ? updateTask : addTask} className="flex-1 bg-blue-600 rounded-xl font-bold">Confirm</button>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskModal;