import React, { useState } from 'react';
import India from '@svg-maps/india';
import { motion, AnimatePresence } from 'framer-motion';

const GeographicalMap = ({ data, onSelect, selected, filteredStates = [] }) => {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, name: '', mortality: 0, deaths: 0 });

  // Map API data into O(1) dictionary
  const dataMap = data.reduce((acc, curr) => {
    if (curr.state) {
      acc[curr.state.toLowerCase()] = curr;
    }
    return acc;
  }, {});

  const handleMouseEnter = (location) => {
    const rawName = location.name;
    const stateName = rawName ? rawName.toLowerCase() : '';
    
    if (dataMap[stateName]) {
      setTooltip(prev => ({
        ...prev,
        show: true,
        name: rawName,
        mortality: dataMap[stateName].mortality_rate || 0,
        deaths: dataMap[stateName].total_death || 0
      }));
    } else {
      setTooltip(prev => ({
        ...prev,
        show: true,
        name: rawName,
        mortality: null,
        deaths: null
      }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  const handleLocationMouseMove = (event) => {
    setTooltip(prev => ({
      ...prev,
      x: event.clientX,
      y: event.clientY
    }));
  };

  const getLocationClassName = (location) => {
    const rawName = location.name;
    const stateName = rawName.toLowerCase();
    const stats = dataMap[stateName];
    const isSelected = selected && selected.toLowerCase() === stateName;
    const isFiltered = filteredStates.includes(rawName);
    
    let baseClass = "svg-map__location";
    if (isSelected || isFiltered) baseClass += " svg-map__location--selected";

    if (stats) {
      if (stats.mortality_rate > 0.63) baseClass += " svg-map__location--danger svg-glow-critical";
      else if (stats.mortality_rate > 0.35) baseClass += " svg-map__location--warning svg-glow-warning";
      else baseClass += " svg-map__location--safe svg-glow-safe";
    }
    return baseClass;
  };

  const getFill = (location) => {
    const stateName = location.name.toLowerCase();
    const stats = dataMap[stateName];
    if (!stats) return "rgba(255, 255, 255, 0.03)";
    if (stats.mortality_rate > 0.63) return "url(#gradCritical)";
    if (stats.mortality_rate > 0.35) return "url(#gradWarning)";
    return "url(#gradSafe)";
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'visible' }}>
      
      {/* EXECUTIVE TACTICAL LEGEND - Positioned Bottom-Left for zero overlap */}
      <div style={{
        position: 'absolute', bottom: '24px', left: '24px',
        background: 'rgba(6, 78, 59, 0.85)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(16, 185, 129, 0.1)', padding: '12px 16px',
        borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 5,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        maxWidth: '180px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '3px', height: '14px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
          <strong style={{ fontSize: '11px', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Risk Matrix</strong>
        </div>
        {[
          { label: 'Critical', color: '#ef4444', grad: 'barGradCritical' },
          { label: 'Warning', color: '#f59e0b', grad: 'barGradHigh' },
          { label: 'Stable', color: '#10b981', grad: 'barGradSafe' },
          { label: 'No Data', color: 'rgba(236, 253, 245, 0.1)', grad: '' }
        ].map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ 
               width: '12px', height: '12px', borderRadius: '4px', 
               background: item.grad ? `url(#${item.grad})` : item.color,
               border: `1px solid ${item.color}44`,
               boxShadow: `0 0 12px ${item.color}22`
             }}></div>
             <span style={{ fontSize: '11px', color: 'rgba(236, 253, 245, 0.65)', fontWeight: 600 }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ width: '90%', height: '100%', position: 'relative' }}>
        <svg
          className="svg-map"
          viewBox={India.viewBox}
          role="group"
          aria-label={India.label}
          style={{ width: '100%', height: '100%', maxHeight: '500px', overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="gradCritical" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff453a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ac2f26" stopOpacity="0.7" />
            </radialGradient>
            <radialGradient id="gradWarning" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff9f0a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#915b06" stopOpacity="0.6" />
            </radialGradient>
            <radialGradient id="gradSafe" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#30d158" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1b7a33" stopOpacity="0.5" />
            </radialGradient>
          </defs>

          {India.locations.map((location, index) => {
            const stats = dataMap[location.name.toLowerCase()];
            const isCritical = stats && stats.mortality_rate > 0.63;
            
            return (
              <motion.path
                key={location.id}
                id={location.id}
                name={location.name}
                d={location.path}
                className={getLocationClassName(location)}
                fill={getFill(location)}
                onMouseEnter={() => handleMouseEnter(location)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleLocationMouseMove}
                onClick={() => onSelect && onSelect(location.name)}
                tabIndex="0"
                // 💎 NEXT-LEVEL CINEMATIC STAGGER
                initial={{ opacity: 0, pathLength: 0, scale: 0.98 }}
                animate={{ 
                  opacity: 1, 
                  pathLength: 1, 
                  scale: 1,
                  filter: isCritical ? [
                    "drop-shadow(0 0 2px rgba(255, 59, 48, 0.5))",
                    "drop-shadow(0 0 12px rgba(255, 59, 48, 0.8))",
                    "drop-shadow(0 0 2px rgba(255, 59, 48, 0.5))"
                  ] : "none",
                  transition: { 
                    duration: isCritical ? 2 : 1.2, 
                    delay: index * 0.03, 
                    ease: isCritical ? "easeInOut" : [0.16, 1, 0.3, 1],
                    repeat: isCritical ? Infinity : 0
                  }
                }}
                whileHover={{ 
                  scale: 1.02, 
                  stroke: "#fff",
                  strokeOpacity: 1,
                  strokeWidth: 2,
                  fillOpacity: 1,
                  zIndex: 20,
                  transition: { duration: 0.3 } 
                }}
                style={{ 
                   stroke: "rgba(0,0,0,0.08)", 
                   strokeWidth: 1, 
                   transition: 'stroke 0.3s ease',
                   transformOrigin: 'center'
                }}
              />
            );
          })}
        </svg>
      </div>

      <AnimatePresence>
        {tooltip.show && (
          <motion.div 
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              top: tooltip.y - 110,
              left: tooltip.x + 15,
              pointerEvents: 'none',
              background: 'rgba(6, 78, 59, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: '16px',
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              zIndex: 10000,
              minWidth: '220px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '16px', color: '#ecfdf5', fontWeight: 800 }}>{tooltip.name}</strong>
              {tooltip.mortality !== null && (
                <div style={{ 
                  width: '8px', height: '8px', borderRadius: '50%', 
                  background: tooltip.mortality > 0.63 ? '#ef4444' : tooltip.mortality > 0.35 ? '#f59e0b' : '#10b981',
                  boxShadow: `0 0 12px ${tooltip.mortality > 0.63 ? '#ef4444' : tooltip.mortality > 0.35 ? '#f59e0b' : '#10b981'}`
                }}></div>
              )}
            </div>

            {tooltip.mortality !== null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(236, 253, 245, 0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>Risk Index</span>
                  <strong style={{ color: tooltip.mortality > 0.63 ? '#ef4444' : '#10b981', fontSize: '15px' }}>{(tooltip.mortality * 100).toFixed(1)}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(236, 253, 245, 0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>Anomalies</span>
                  <strong style={{ color: '#ecfdf5', fontSize: '15px' }}>{tooltip.deaths}</strong>
                </div>
                <div style={{ 
                  marginTop: '12px', 
                  padding: '10px', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  fontSize: '11px', 
                  color: '#10b981', 
                  textAlign: 'center',
                  fontWeight: 900, 
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}>
                  Access Telemetry
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.5)' }}>Satellite signals offline.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GeographicalMap;
