import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const MagneticCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState('');
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth transitions for the cursor
  const springConfig = { damping: 20, stiffness: 250 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('[data-magnetic]');
      if (target) {
        setIsHovering(true);
        const text = target.getAttribute('data-cursor-text');
        if (text) setCursorText(text);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('[data-magnetic]');
      if (target) {
        setIsHovering(false);
        setCursorText('');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* 🎯 MAIN SCANNER RETICLE */}
      <motion.div
        className="custom-cursor-main"
        style={{
          left: cursorX,
          top: cursorY,
          x: "-50%",
          y: "-50%",
        }}
        animate={{
          scale: isHovering ? 2.5 : 1,
          borderColor: isHovering ? 'rgba(16, 185, 129, 1)' : 'rgba(16, 185, 129, 0.4)',
          borderWidth: isHovering ? '1px' : '2px',
        }}
      >
        {/* INNER CORE DOT */}
        <motion.div 
          className="cursor-core"
          animate={{ scale: isHovering ? 0.3 : 1 }}
        />

        {/* 📟 SCANNER UI TEXT */}
        {isHovering && cursorText && (
          <motion.span 
            className="cursor-tag"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>

      {/* 🌫️ DIFFUSE SPOTLIGHT EFFECT */}
      <motion.div
        className="cursor-spotlight"
        style={{
          left: cursorX,
          top: cursorY,
          x: "-50%",
          y: "-50%",
        }}
      />
    </>
  );
};

export default MagneticCursor;
