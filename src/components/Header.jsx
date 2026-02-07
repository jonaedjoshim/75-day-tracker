import React from 'react';
import { motion } from 'framer-motion';

const Header = () => (
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
);

export default Header;