import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Database, Target, Map, ShieldAlert, Cpu, BarChart3, Layers } from 'lucide-react';

export default function CommandPalette({ scrollTo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      // CMD + K or CTRL + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { id: 'dashboard', name: 'Insights Overview', desc: 'Main platform dashboard and key metrics', icon: <Target size={18} /> },
    { id: 'strategic', name: 'Strategic BI Hub', desc: 'Tableau-integrated business intelligence and reporting', icon: <BarChart3 size={18} /> },
    { id: 'comparative', name: 'Comparative Analysis', desc: 'Segmentation by Zoo Category and Species Class', icon: <Layers size={18} /> },
    { id: 'ml', name: 'ML AI & Predictions', desc: 'Predictive intelligence and linear regression weights', icon: <Cpu size={18} /> },
    { id: 'mortality', name: 'Mortality Alerts', desc: 'Ecosystem failure risk and survivability monitoring', icon: <ShieldAlert size={18} /> },
    { id: 'categories', name: 'Ecosystems & Habitats', desc: 'Regional net performance tracking', icon: <Map size={18} /> },
    { id: 'explorer', name: 'Data Explorer', desc: 'Raw intelligence queries and offline CSV export', icon: <Database size={18} /> },
  ];

  const filtered = commands.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (id) => {
    setIsOpen(false);
    setQuery('');
    scrollTo(id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="command-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,10,0,0.6)', backdropFilter: 'blur(10px)',
            zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '15vh'
          }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              background: 'rgba(5, 12, 8, 0.98)', border: '1px solid var(--primary)',
              borderRadius: '16px', width: '90%', maxWidth: '650px',
              boxShadow: '0 30px 60px rgba(0,0,0,0.8)', overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input Area */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <Search color="var(--primary)" size={24} style={{ marginRight: '15px' }} />
              <input 
                autoFocus
                placeholder="Search modules or ask 'Ctrl + K'..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', color: '#fff',
                  fontSize: '20px', width: '100%', outline: 'none'
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '6px', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>ESC</span>
            </div>
            
            {/* Query Results */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '12px 0' }}>
              <div style={{ padding: '8px 24px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                Ecosystem Navigation
              </div>
              {filtered.map((cmd, i) => (
                <div 
                  key={i}
                  onClick={() => handleSelect(cmd.id)}
                  style={{
                    padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px',
                    color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderLeft: '4px solid transparent'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
                    e.currentTarget.style.borderLeft = '4px solid var(--primary)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderLeft = '4px solid transparent';
                  }}
                >
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--primary)' }}>
                    {cmd.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{cmd.name}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{cmd.desc}</div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>
                  No ecosystem sectors found matching "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
