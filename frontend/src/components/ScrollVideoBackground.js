import React, { useRef, useEffect, useState } from 'react';
import { useScroll } from 'framer-motion';

const ScrollVideoBackground = () => {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get raw scroll progress (0 to 1)
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoaded(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // ULTRA-SMOOTH LERP ENGINE (Linear Interpolation)
  useEffect(() => {
    if (!isLoaded || !duration) return;

    let targetTime = 0;
    let currentScrubTime = 0;
    let requestRef = null;

    const animate = () => {
      // Linear Interpolation: Move currentTime gently toward the target
      // lerpFactor (0.08) controls the "creaminess" of the drift
      const lerpFactor = 0.08;
      currentScrubTime += (targetTime - currentScrubTime) * lerpFactor;

      // Only seek if the difference is meaningful (threshold)
      if (videoRef.current && Math.abs(currentScrubTime - videoRef.current.currentTime) > 0.01) {
        // Performance Guard: Ensure we don't try to seek past the duration
        const safeTime = Math.max(0, Math.min(duration, currentScrubTime));
        videoRef.current.currentTime = safeTime;
      }

      requestRef = requestAnimationFrame(animate);
    };

    // Listen to scroll changes to update the target
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      targetTime = latest * duration;
    });

    // Start the LERP loop
    requestRef = requestAnimationFrame(animate);

    return () => {
      unsubscribe();
      if (requestRef) cancelAnimationFrame(requestRef);
    };
  }, [isLoaded, duration]);

  return (
    <div className="scroll-video-container" style={{
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
        background: 'radial-gradient(circle at 50% 50%, rgba(13, 17, 23, 0.2) 0%, rgba(13, 17, 23, 0.8) 100%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* 📽️ PERFORMANCE-LOCKED VIDEO SHIM */}
      <video
        ref={videoRef}
        src="/assets/main_scroll_video.mp4"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoaded ? 0.7 : 0,
          transition: 'opacity 2s cubic-bezier(0.16, 1, 0.3, 1)',
          filter: 'brightness(0.65) saturate(1.1) contrast(1.1)'
        }}
        muted
        playsInline
        preload="auto"
      />
      
      {/* 🏛️ EXECUTIVE TEXTURE LAYER */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")',
        opacity: 0.12,
        zIndex: 2,
        pointerEvents: 'none',
        mixBlendMode: 'overlay'
      }} />
    </div>
  );
};

export default ScrollVideoBackground;
