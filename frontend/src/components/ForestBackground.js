import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import BioLuminescentFireflies from "./BioLuminescentFireflies";

const ForestBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for parallax layers
  const springConfig = { damping: 30, stiffness: 100 };
  const parallaxX = useSpring(mouseX, springConfig);
  const parallaxY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize to -0.5 to 0.5
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="forest-background-container" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -2, overflow: 'hidden' }}>
      {/* 🌲 LAYER 1: BASE DEEP FOREST (STATIC/SLOW) */}
      <motion.div 
        className="forest-layer base"
        style={{ 
          position: 'absolute',
          top: '-10%', left: '-10%', width: '120%', height: '120%',
          backgroundImage: `url(/assets/forest_bg_light.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.12,
          filter: 'saturate(0.8) contrast(1.2) brightness(0.6)',
          x: parallaxX,
          y: parallaxY,
        }}
        animate={{
            x: parallaxX.get() * 20,
            y: parallaxY.get() * 20
        }}
      />
      
      {/* ✨ BIO-LUMINESCENT FIREFLIES LAYER */}
      <BioLuminescentFireflies count={35} />
      
      {/* 🌬️ LAYER 3: INTERMEDIATE MIST FLOW */}
      <motion.div 
        className="forest-layer mist"
        animate={{ x: [-100, 100, -100] }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        style={{ 
          position: 'absolute',
          top: '-10%', left: '-10%', width: '120%', height: '120%',
          backgroundImage: `url(/assets/forest_mist.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.08,
          filter: 'brightness(2) blur(4px)',
          mixBlendMode: 'plus-lighter',
          scale: 1.2,
        }}
      />
      
      {/* 🍃 LAYER 4: DETAILED FOREGROUND SILHOUETTES (FASTEST) */}
      <motion.div 
        className="forest-layer foreground"
        style={{ 
          position: 'absolute',
          top: '-10%', left: '-10%', width: '120%', height: '120%',
          backgroundImage: `url(/assets/forest_foreground.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          filter: 'brightness(0.2) blur(1px)',
        }}
        animate={{
            x: parallaxX.get() * -60,
            y: parallaxY.get() * -30
        }}
      />
      
      {/* 🎭 VIGNETTE & LIGHT GRADIENTS */}
      <div 
        className="forest-vignette" 
        style={{ 
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'radial-gradient(circle at center, transparent 0%, rgba(2, 44, 34, 0.9) 120%)',
          zIndex: 4 
        }} 
      />
    </div>
  );
};

export default ForestBackground;
