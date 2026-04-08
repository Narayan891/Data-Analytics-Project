import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, X } from 'lucide-react';
import { getAlerts } from '../api/api';

export default function ActionCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlerts()
      .then(res => {
        setAlerts(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {/* BELL TRIGGER ICON */}
      <motion.div 
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--primary-glow)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          padding: '10px', background: 'rgba(5, 8, 10, 0.6)', borderRadius: '50%', 
          border: '1px solid rgba(34, 197, 94, 0.4)',
          boxShadow: isOpen ? '0 0 15px var(--primary-glow)' : 'none',
          transition: 'all 0.3s ease'
        }}
        title="Operational Action Center"
      >
        <Bell size={20} color={alerts.length > 0 ? "var(--primary)" : "#fff"} />
        {alerts.length > 0 && (
          <div className="notification-badge" style={{ 
            background: alerts.some(a => a.includes('CRITICAL')) ? '#ef4444' : 'var(--primary)',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
          }}>
            {alerts.length > 9 ? '9+' : alerts.length}
          </div>
        )}
      </motion.div>

      {/* DROPDOWN PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              position: 'absolute', top: '50px', right: '0', width: '380px',
              background: 'rgba(5, 12, 8, 0.98)', border: '1px solid var(--primary)',
              borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)', zIndex: 1000, overflow: 'hidden'
            }}
          >
            <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#fbbf24" /> Operational Action Center
              </h3>
              <X size={18} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setIsOpen(false)} />
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '10px' }}>
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading intelligence alerts...</div>
              ) : alerts.length === 0 ? (
                <div style={{ padding: '30px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  <Bell size={32} opacity={0.2} style={{ marginBottom: '10px' }} />
                  <div>No critical ecosystem warnings detected. Operating nominally.</div>
                </div>
              ) : (
                alerts.map((alert, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)', borderLeft: '3px solid #ef4444',
                      padding: '12px 15px', borderRadius: '6px', marginBottom: '8px',
                      display: 'flex', gap: '12px', alignItems: 'flex-start'
                    }}
                  >
                    <AlertTriangle size={16} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong style={{ 
                        display: 'block', 
                        fontSize: '12px', 
                        color: alert.includes('CRITICAL') ? '#ef4444' : '#fbbf24', 
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        {alert.includes('CRITICAL') ? '⚠️ ALARMING LEVEL DETECTED' : '🔍 AI PREDICTIVE RISK'}
                      </strong>
                      <span style={{ fontSize: '14px', lineHeight: '1.4', color: 'rgba(255,255,255,0.9)', fontWeight: alert.includes('CRITICAL') ? 600 : 400 }}>{alert}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
