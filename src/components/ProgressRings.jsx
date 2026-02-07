import React from 'react';
import { motion } from 'framer-motion';

const ProgressRings = ({ todaysCompletion, overallCompletion, TOTAL_DAYS, completedDaysSize, tasksLength, dailyTasksChecked }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Today's Hustle */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-orange-400">🔥 Today's Hustle</h3>
            <div className="flex items-center justify-center">
                <div className="relative">
                    <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                        <motion.circle
                            cx="80" cy="80" r="70" stroke="url(#gradient1)" strokeWidth="12" fill="none" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - todaysCompletion / 100) }}
                            transition={{ duration: 1 }}
                        />
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold">{todaysCompletion.toFixed(0)}%</span>
                    </div>
                </div>
            </div>
            <p className="text-center text-gray-400 mt-4">{dailyTasksChecked}/{tasksLength} tasks completed</p>
        </motion.div>

        {/* The Long Haul */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">🎯 The Long Haul</h3>
            <div className="flex items-center justify-center">
                <div className="relative">
                    <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                        <motion.circle
                            cx="80" cy="80" r="70" stroke="url(#gradient2)" strokeWidth="12" fill="none" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - overallCompletion / 100) }}
                            transition={{ duration: 1 }}
                        />
                        <defs>
                            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold">{overallCompletion}%</span>
                    </div>
                </div>
            </div>
            <p className="text-center text-gray-400 mt-4">{completedDaysSize}/{TOTAL_DAYS} days crushed</p>
        </motion.div>
    </div>
);

export default ProgressRings;