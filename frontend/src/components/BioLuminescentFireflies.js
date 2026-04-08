import React from 'react';
import { motion } from 'framer-motion';

const Firefly = ({ id }) => {
  // Randomize initial positions and movement parameters
  const initialX = Math.random() * 100;
  const initialY = Math.random() * 100;
  const size = Math.random() * 4 + 2;
  const duration = Math.random() * 20 + 15;
  const delay = Math.random() * 5;

  return (
    <motion.div
      className="firefly"
      initial={{ 
        x: `${initialX}%`, 
        y: `${initialY}%`, 
        opacity: 0,
        scale: 0 
      }}
      animate={{
        x: [
          `${initialX}%`, 
          `${initialX + (Math.random() * 20 - 10)}%`, 
          `${initialX + (Math.random() * 20 - 10)}%`, 
          `${initialX}%`
        ],
        y: [
          `${initialY}%`, 
          `${initialY + (Math.random() * 20 - 10)}%`, 
          `${initialY + (Math.random() * 20 - 10)}%`, 
          `${initialY}%`
        ],
        opacity: [0, 0.7, 0.3, 0.8, 0],
        scale: [0, 1, 0.8, 1.2, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        backgroundColor: '#10b981', // Emerald Primary
        borderRadius: '50%',
        filter: 'blur(2px) drop-shadow(0 0 8px #10b981)',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  );
};

const BioLuminescentFireflies = ({ count = 25 }) => {
  const fireflies = Array.from({ length: count }).map((_, i) => i);

  return (
    <div 
      className="fireflies-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {fireflies.map((id) => (
        <Firefly key={id} id={id} />
      ))}
    </div>
  );
};

export default BioLuminescentFireflies;
