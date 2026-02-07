import React from 'react';
import { motion } from 'framer-motion';

const TaskCard = React.memo(({ task, isCompleted, toggleTask, startEditTask, deleteTask, index }) => (
  <motion.div
    layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    className={`p-4 rounded-2xl border-2 transition-all relative group ${
      isCompleted ? 'bg-green-500/10 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-white/5 border-white/10'
    }`}
  >
    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={() => startEditTask(task)} className="bg-blue-600 p-1.5 rounded-lg text-xs">✏️</button>
      <button onClick={() => deleteTask(task.id)} className="bg-red-600 p-1.5 rounded-lg text-xs">🗑️</button>
    </div>
    <label className="cursor-pointer flex items-center gap-3">
      <input type="checkbox" checked={isCompleted || false} onChange={() => toggleTask(task.id)} className="checkbox-custom" />
      <span className="text-2xl">{task.icon}</span>
      <span className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>{task.name}</span>
    </label>
  </motion.div>
));

export default TaskCard;