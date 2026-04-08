import React from 'react';
import { motion } from 'framer-motion';

const PrismaticBackground = () => {
  return (
    <div className="prismatic-background-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      overflow: 'hidden',
      backgroundColor: '#000'
    }}>
      {/* 🎭 PRISMATIC DEPTH OVERLAY */}
      <div className="video-overlay" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 50%, rgba(13, 17, 23, 0.4) 0%, rgba(13, 17, 23, 0.85) 100%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* 📽️ STABLE CINEMATIC LOOP (NO SCROLL SCRUB) */}
      <video
        src="/assets/main_scroll_video.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.75,
          filter: 'brightness(0.6) saturate(1.1) contrast(1.1)'
        }}
      />
      
      {/* ✨ STARDUST PARTICLES */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")',
        opacity: 0.15,
        zIndex: 2,
        pointerEvents: 'none',
        mixBlendMode: 'overlay'
      }} />

      {/* 🌬️ ATMOSPHERIC GLARE */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle at top right, rgba(197, 160, 89, 0.08) 0%, transparent 70%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default PrismaticBackground;
