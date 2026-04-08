import React, { useEffect, useState, useMemo } from "react";
import { getPredictions } from "../api/api";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Database, ChevronLeft, ChevronRight, Navigation, Activity } from "lucide-react";

function DataExplorer() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  
  // Dock animation state mechanism
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const itemsPerPage = 8;

  useEffect(() => {
    getPredictions().then(res => {
      setData(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const uniqueRegions = useMemo(() => {
    const regions = Array.from(new Set(data.map(item => item["state"] || "Unknown")));
    return ["All Regions", ...regions.filter(r => r !== "Unknown").sort()];
  }, [data]);

  const activeData = useMemo(() => {
    if (selectedRegion === "All Regions") return data;
    return data.filter(item => (item["state"] || "Unknown") === selectedRegion);
  }, [data, selectedRegion]);

  const grouped = useMemo(() => {
    const processed = activeData.reduce((acc, item) => {
      const zoo = item["zoo_name"] || "Unknown";
      const growth = item["predicted_closing"] ?? 0;
      if (!acc[zoo]) acc[zoo] = { name: zoo, total: 0, count: 0 };
      acc[zoo].total += Number(growth);
      acc[zoo].count += 1;
      return acc;
    }, {});
    
    return Object.values(processed).map(z => ({
      name: z.name,
      avgGrowth: Number((z.total / z.count).toFixed(2)),
      sampleSize: z.count
    })).sort((a,b) => b.avgGrowth - a.avgGrowth);
  }, [activeData]);

  const filtered = useMemo(() => {
    return grouped.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [grouped, search]);

  useEffect(() => {
    setCurrentPage(1); 
  }, [search, selectedRegion]);

  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const topZoo = grouped.length > 0 ? grouped[0] : null;

  const reliability = (count) => {
    if (count >= 10) return { label: "High Confidence", color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)" };
    if (count >= 5) return { label: "Medium Confidence", color: "var(--primary)", bg: "rgba(34, 197, 94, 0.05)" };
    return { label: "Low Confidence", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" };
  };

  const exportCSV = () => {
    const csv = Papa.unparse(grouped);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "zoo_data_explorer.csv";
    link.click();
  };

  return (
    <motion.div 
      className="dashboard premium-bloom"
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      onMouseLeave={() => setHoveredIndex(null)}
      style={{ paddingBottom: '100px' }}
    >
      <div className="header" style={{ marginBottom: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '4.5rem', fontWeight: '800', letterSpacing: '-3px', fontFamily: 'var(--font-heading)' }}>
            <Database size={42} color="var(--primary)" /> Intelligence Archive
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '20px', marginTop: '12px', fontWeight: '500', fontFamily: 'var(--font-body)' }}>Synchronized Historical Telemetry & Institutional Inventory Records</p>
        </div>

        <div className="tactical-selector-container">
          <Navigation size={20} color="var(--primary)" />
          <select 
            className="tactical-selector"
            value={selectedRegion} 
            onChange={e => setSelectedRegion(e.target.value)}
          >
            {uniqueRegions.map((region, idx) => (
              <option key={idx} value={region}>
                {region === "All Regions" ? "Global Inventory Analytics" : region}
              </option>
            ))}
          </select>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        style={{ fontSize: '15px', background: 'rgba(34, 197, 94, 0.08)', padding: '28px 36px', borderRadius: '28px', border: '1px solid rgba(34, 197, 94, 0.35)', maxWidth: '950px', lineHeight: '1.7', marginBottom: '56px', color: '#ecfdf5', fontFamily: 'var(--font-body)', fontWeight: 500 }}
      >
        <strong style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px' }}>Operational Mandate:</strong> This module provides full structural transparency by exposing raw data vectors processed by the Neural Core. It archives historical population sustainability metrics and forward-looking biokinetic forecasts across every jurisdiction.
      </motion.div>

      {loading ? (
        <div className="loader" style={{ margin: '100px auto' }}></div>
      ) : (
        <>
          {topZoo && !search && (
            <motion.div 
              className="kpi-card main botanical-spotlight" 
              whileHover={{ y: -8 }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
              style={{ 
                marginBottom: '48px', 
                border: '1px solid rgba(34, 197, 94, 0.3)', 
                background: 'linear-gradient(91deg, rgba(34, 197, 94, 0.1) 0%, rgba(10,21,15,0.8) 100%)',
                padding: '48px',
                borderRadius: '40px',
                boxShadow: 'var(--shadow-premium)'
              }}
            >
              <div className="spotlight-glow" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '4px' }}>
                    Elite Biological Vector ({selectedRegion})
                  </span>
                  <h3 style={{ marginTop: '20px', fontSize: '4.2rem', display: 'flex', alignItems: 'center', gap: '24px', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-2px' }}>
                    🚀 <span style={{ color: '#fff' }}>{topZoo.name}</span>
                  </h3>
                </div>
                <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.5)', padding: '28px 40px', borderRadius: '30px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '12px' }}>Growth Trajectory</span>
                  <motion.h2 
                    style={{ color: 'var(--primary)', margin: 0, fontSize: '4.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-2.5px' }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    +{topZoo.avgGrowth.toLocaleString()}
                  </motion.h2>
                </div>
              </div>
            </motion.div>
          )}

          <div className="card large" style={{ padding: '0', overflow: 'hidden', background: 'var(--glass-card)', border: '1px solid var(--glass-border)', borderRadius: '40px', boxShadow: 'var(--shadow-premium)' }} onMouseLeave={() => setHoveredIndex(null)}>
            <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ position: 'relative', minWidth: '400px' }}>
                <Search color="rgba(255,255,255,0.2)" size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  placeholder="Audit regional archives..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="tactical-selector"
                  style={{ paddingLeft: '56px', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}
                />
              </div>
              <motion.button 
                whileHover={{ y: -2, scale: 1.02, boxShadow: '0 10px 30px rgba(34, 197, 94, 0.2)' }}
                whileTap={{ scale: 0.98 }}
                className="btn-outline" 
                onClick={exportCSV} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', 
                  padding: '14px 28px', borderRadius: '16px',
                  border: '1px solid var(--primary)', color: 'var(--primary)',
                  background: 'rgba(34, 197, 94, 0.05)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '13px'
                }}
              >
                <Download size={18} /> Export Archive
              </motion.button>
            </div>

            {filtered.length === 0 ? (
               <div style={{ padding: '100px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '20px', fontFamily: 'var(--font-body)' }}>
                 No records synchronized for this query.
               </div>
            ) : (
              <div style={{ width: '100%', textAlign: 'left', paddingBottom: '10px' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.5fr 1fr 1fr 1fr', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  textTransform: 'uppercase',
                  position: 'relative',
                  zIndex: 2,
                  fontFamily: 'var(--font-body)'
                }}>
                  <div style={{ padding: '18px 40px', color: 'rgba(255,255,255,0.85)', fontWeight: 800, fontSize: '11px', letterSpacing: '2px' }}>Institution Facility</div>
                   <div style={{ padding: '18px 40px', color: 'rgba(255,255,255,0.85)', fontWeight: 800, fontSize: '11px', letterSpacing: '2px' }}>Growth Vector</div>
                   <div style={{ padding: '18px 40px', color: 'rgba(255,255,255,0.85)', fontWeight: 800, fontSize: '11px', letterSpacing: '2px' }}>Telemetry Nodes</div>
                   <div style={{ padding: '18px 40px', color: 'rgba(255,255,255,0.85)', fontWeight: 800, fontSize: '11px', letterSpacing: '2px' }}>Trust Rating</div>
                </div>

                <div style={{ position: 'relative', padding: '10px 20px' }}>
                  <AnimatePresence>
                    {paginated.map((item, i) => {
                      const rel = reliability(item.sampleSize);
                      const isHovered = hoveredIndex === i;
                      const isNeighbor = hoveredIndex === i - 1 || hoveredIndex === i + 1;
                      const scale = isHovered ? 1.03 : isNeighbor ? 1.01 : 1;
                      const zIndex = isHovered ? 10 : isNeighbor ? 5 : 1;
                      const background = isHovered ? 'rgba(34, 197, 94, 0.08)' : 
                                         isNeighbor ? 'rgba(34, 197, 94, 0.02)' : 'transparent';
                      const shadow = isHovered ? '0 20px 60px rgba(0,0,0,0.6)' : 'none';

                      return (
                        <motion.div 
                          key={item.name + i}
                          onMouseEnter={() => setHoveredIndex(i)}
                          animate={{ 
                            scale, 
                            zIndex, 
                            backgroundColor: background, 
                            boxShadow: shadow
                          }}
                          transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1.5fr 1fr 1fr 1fr', 
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            alignItems: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            margin: '2px 0'
                          }}
                        >
                          <div style={{ padding: '24px 40px', fontWeight: '800', fontSize: '18px', color: '#fff', fontFamily: 'var(--font-heading)' }}>{item.name}</div>
                          <div style={{ padding: '24px 40px', color: 'var(--primary)', fontSize: '20px', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>+{item.avgGrowth.toLocaleString()}</div>
                          <div style={{ padding: '24px 40px', color: '#ecfdf5', fontSize: '14px', fontWeight: '800', fontFamily: 'var(--font-body)' }}>{item.sampleSize} units</div>
                          <div style={{ padding: '15px 40px' }}>
                            <span style={{
                              background: rel.bg,
                              color: rel.color,
                              padding: "8px 16px",
                              borderRadius: "30px",
                              fontSize: "11px",
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              border: `1px solid ${rel.color}30`,
                              display: 'inline-block'
                            }}>
                              {rel.label}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
            
            {filtered.length > 0 && (
              <div style={{ padding: '24px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '13px', opacity: 0.9, color: '#ecfdf5', fontWeight: 800, letterSpacing: '1px' }}>SYNCHRONIZED: {start + 1} — {Math.min(start + itemsPerPage, filtered.length)} / {filtered.length} ARCHIVES</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-outline" style={{ padding: '12px', borderRadius: '12px' }} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                    <ChevronLeft size={20} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-outline" style={{ padding: '12px', borderRadius: '12px' }} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
                    <ChevronRight size={20} />
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default DataExplorer;