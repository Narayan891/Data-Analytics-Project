import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import './HolographicLoader.css';

const HolographicLoader = () => {
  return (
    <div className="holographic-loader-overlay">
      <div className="holographic-ring">
        <motion.div
          className="scan-line"
          animate={{
            top: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <Zap className="loader-icon" />
      </div>
      <div className="loader-text">
        <span className="glitch" data-text="SYNCING DATA...">SYNCING DATA...</span>
        <div className="loading-bar">
          <motion.div 
            className="loading-progress"
            animate={{ width: ['0%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
};

export default HolographicLoader;
