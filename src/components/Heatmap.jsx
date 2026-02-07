import React from 'react';
import { motion } from 'framer-motion';

const Heatmap = ({ TOTAL_DAYS, completedDays, currentDay, goToDay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-2xl mt-8"
    >
        <h3 className="text-2xl font-semibold mb-6">📊 75-Day Journey Heatmap</h3>
        <div className="grid grid-cols-15 gap-2">
            {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => (
                <motion.div
                    key={day}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => goToDay(day)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${completedDays.has(day)
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50'
                            : day === currentDay
                                ? 'bg-gradient-to-br from-orange-500 to-red-500 border-2 border-yellow-400 animate-pulse'
                                : 'bg-white/10 hover:bg-white/20'
                        }`}
                >
                    {day}
                </motion.div>
            ))}
        </div>
    </motion.div>
);

export default Heatmap;