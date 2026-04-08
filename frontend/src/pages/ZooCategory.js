import React, { useEffect, useState, useMemo } from "react";
import { getPerformance } from "../api/api";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { Map, MapPin, Award, TrendingDown, Target, Navigation, ShieldCheck, Activity } from "lucide-react";

// --- Custom Tooltips ---
const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(6, 78, 59, 0.95)',
        padding: '16px 20px',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
        zIndex: 100
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#ecfdf5', fontSize: '15px', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>{data.fullName}</p>
        <p style={{ margin: 0, color: 'var(--primary)', fontSize: '16px', marginBottom: '4px' }}>
          <strong>Performance Score:</strong> {data.score.toLocaleString()}
        </p>
        <p style={{ margin: 0, color: '#10b981', fontSize: '14px' }}>
          <strong>Survival Index:</strong> {data.survivalRate}%
        </p>
      </div>
    );
  }
  return null;
};

const CustomRadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(6, 78, 59, 0.95)',
        padding: '12px 18px',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '12px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-main)', fontSize: '14px', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>{data.fullName}</p>
        <p style={{ margin: 0, color: 'var(--primary)', fontSize: '14px' }}><strong>Metric:</strong> {data.A}</p>
      </div>
    );
  }
  return null;
};

function ZooCategory() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("All Regions");

  useEffect(() => {
    getPerformance().then(res => {
      setRawData(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const uniqueRegions = useMemo(() => {
    const regions = Array.from(new Set(rawData.map(item => item["state"] || "Unknown")));
    return ["All Regions", ...regions.filter(r => r !== "Unknown").sort()];
  }, [rawData]);

  const activeData = useMemo(() => {
    if (selectedRegion === "All Regions") return rawData;
    return rawData.filter(item => (item["state"] || "Unknown") === selectedRegion);
  }, [rawData, selectedRegion]);

  const groupedData = useMemo(() => {
    const processed = activeData.reduce((acc, item) => {
      const zoo = item["zoo_name"] || "Unknown Zoo";
      const score = item["score"] || 0;
      const survival = item["survival_rate"] || 0;
      const capacity = item["total_capacity"] || 0;

      if (!acc[zoo]) acc[zoo] = { name: zoo, total: 0, count: 0, survivalTotal: 0, capacity: 0 };
      acc[zoo].total += Number(score);
      acc[zoo].capacity += Number(capacity);
      acc[zoo].survivalTotal += Number(survival);
      acc[zoo].count += 1;

      return acc;
    }, {});

    return Object.values(processed).map(z => ({
      name: z.name.length > 15 ? z.name.substring(0, 15) + "..." : z.name,
      fullName: z.name,
      score: Number((z.total).toFixed(2)),
      capacity: Number((z.capacity).toFixed(2)),
      survivalRate: Number((z.survivalTotal / z.count).toFixed(2))
    })).sort((a,b) => b.score - a.score).slice(0, 15);
  }, [activeData]);

  const topPerformer = groupedData[0];
  const lowestPerformer = groupedData.length > 0 ? groupedData[groupedData.length - 1] : null;
  const maxScore = groupedData.length > 0 ? Math.max(...groupedData.map(d => d.score)) : 100;
  
  const radarData = groupedData.slice(0, 6).map(d => ({
    subject: d.name,
    fullName: d.fullName,
    A: d.score,
    fullMark: maxScore
  }));

  return (
    <motion.div 
      className="dashboard premium-bloom"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      style={{ paddingBottom: '100px' }}
    >
      <div className="header" style={{ marginBottom: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '4.5rem', fontWeight: '800', letterSpacing: '-3px', fontFamily: 'var(--font-heading)' }}>
            <Activity size={42} color="var(--primary)" /> Habitat Operational Matrix
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '20px', marginTop: '12px', fontWeight: '500', fontFamily: 'var(--font-body)' }}>
            Benchmarking Institutional Efficiency & Ecosystem Stability Indices
          </p>
        </div>
        
        {/* EXECUTIVE TACTICAL SELECTOR */}
        <div className="tactical-selector-container">
          <Navigation size={20} color="var(--primary)" />
          <select 
            className="tactical-selector"
            value={selectedRegion} 
            onChange={e => setSelectedRegion(e.target.value)}
          >
            {uniqueRegions.map((region, idx) => (
              <option key={idx} value={region}>
                {region === "All Regions" ? "Global Performance View" : region}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loader" style={{ margin: '100px auto' }}></div>
      ) : groupedData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.5)', fontSize: '20px', fontFamily: 'var(--font-body)' }}>
          No ecosystems found in the selected region.
        </div>
      ) : (
        <>
          <div className="kpi-grid">
            {topPerformer && (
              <motion.div 
                className="kpi-card main botanical-spotlight" 
                whileHover={{ y: -10, scale: 1.02 }} 
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                }}
                style={{ border: '1px solid rgba(16, 185, 129, 0.5)', background: 'rgba(6, 78, 59, 0.3)' }}
              >
                <div className="spotlight-glow" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                  <h4 style={{ color: 'var(--primary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900' }}>Elite Performance Rating</h4>
                  <Award color="var(--primary)" size={26} />
                </div>
                <h2 style={{ fontSize: '2.8rem', marginBottom: '12px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', position: 'relative', zIndex: 1 }}>{topPerformer.fullName}</h2>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '2.4rem', fontWeight: '800' }}>{topPerformer.score.toLocaleString()} <span style={{fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '500'}}>NET BASELINE</span></strong>
                </div>
                <div style={{ marginTop: '16px', color: '#22c55e', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', position: 'relative', zIndex: 1, fontFamily: 'var(--font-body)' }}>
                   <ShieldCheck size={18} /> Operational Stability: {topPerformer.survivalRate}% Safe
                </div>
              </motion.div>
            )}
            
            {lowestPerformer && (
              <motion.div 
                className="kpi-card botanical-spotlight" 
                whileHover={{ y: -10 }} 
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                }}
                style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'var(--glass-card)' }}
              >
                <div className="spotlight-glow" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                  <h4 style={{ color: '#ef4444', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900' }}>Critical Target</h4>
                  <TrendingDown color="#ef4444" size={26} />
                </div>
                <h2 style={{ fontSize: '2.4rem', marginBottom: '12px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', position: 'relative', zIndex: 1 }}>{lowestPerformer.fullName}</h2>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <strong style={{ color: '#ef4444', fontSize: '2rem', fontWeight: '800' }}>{lowestPerformer.score.toLocaleString()} <span style={{fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '500'}}>BASE</span></strong>
                </div>
                <div style={{ marginTop: '16px', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', position: 'relative', zIndex: 1, fontFamily: 'var(--font-body)' }}>
                   <Target size={18} /> Stability Quotient: {lowestPerformer.survivalRate}%
                </div>
              </motion.div>
            )}

            <motion.div 
              className="kpi-card botanical-spotlight" 
              whileHover={{ y: -10 }} 
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
              style={{ background: 'var(--glass-card)', border: '1px solid var(--glass-border)' }}
            >
              <div className="spotlight-glow" />
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900' }}>Executive Scale</h4>
                  <Map size={26} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '3.8rem', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-2px', position: 'relative', zIndex: 1 }}>{uniqueRegions.length - 1}</h2>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', position: 'relative', zIndex: 1, fontFamily: 'var(--font-body)' }}>Active Verified Jurisdictions</span>
            </motion.div>
          </div>

          <div className="main-grid" style={{ gridTemplateColumns: '1.7fr 1.3fr', marginTop: '30px' }}>
            <div className="card large" style={{ padding: '30px', background: 'var(--glass-card)', border: '1px solid var(--glass-border)', borderRadius: '32px' }}>
              <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-heading)', fontSize: '1.8rem' }}>
                📊 Top 15 Ecosystem Performance Scores <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)' }}>({selectedRegion})</span>
              </h3>
              <div style={{ width: '100%', height: '350px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupedData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255, 255, 255, 0.5)" 
                      tick={{ fill: '#ecfdf5', fontSize: 11, fontWeight: 700 }} 
                      dy={15} 
                      interval={0} 
                      angle={-35} 
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: '#ecfdf5', fontWeight: 700 }} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Bar dataKey="score" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card" style={{ padding: '30px', background: 'var(--glass-card)', border: '1px solid var(--glass-border)', borderRadius: '32px' }}>
              <h3 style={{ marginBottom: '25px', textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: '1.8rem' }}>🎯 Elite Cohort Distribution</h3>
              {radarData.length > 2 ? (
                <div style={{ width: '100%', height: '350px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                      <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#ecfdf5', fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-body)' }} />
                      <PolarRadiusAxis domain={[0, maxScore]} angle={30} tick={{ fontSize: 10, fill: '#ecfdf5', fontWeight: 700 }} />
                      <Radar name="Performance" dataKey="A" stroke="var(--primary)" strokeWidth={4} fill="var(--primary)" fillOpacity={0.45} />
                      <Tooltip content={<CustomRadarTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)' }}>
                  Not enough data points for comparative distribution.
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-heading)' }}>
              <MapPin size={32} color="var(--primary)" /> Comprehensive Rankings Directory
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {groupedData.map((item, i) => (
                <motion.div 
                  whileHover={{ y: -8, boxShadow: "0 30px 60px rgba(0,0,0,0.6)", borderColor: "rgba(34, 197, 94, 0.3)" }}
                  key={i} 
                  className="card"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    padding: '28px', 
                    position: 'relative', 
                    overflow: 'hidden', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '24px',
                    background: 'var(--glass-card)',
                    transition: '0.4s all cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, transform: 'rotate(15deg)', color: 'var(--primary)' }}>
                    <Activity size={150} />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                      background: 'rgba(34, 197, 94, 0.1)', 
                      padding: '12px', 
                      borderRadius: '14px',
                      color: 'var(--primary)',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <MapPin size={22} />
                    </div>
                    <h4 style={{ fontSize: '22px', lineHeight: '1.2', margin: 0, alignSelf: 'center', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{item.fullName}</h4>
                  </div>
                  
                  <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '16px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '11px', opacity: 0.9, color: '#ecfdf5', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-body)', fontWeight: 800 }}>Net Performance</span>
                      <strong style={{ color: "var(--primary)", fontSize: '24px', fontFamily: 'var(--font-heading)' }}>{item.score.toLocaleString()}</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '11px', opacity: 0.9, color: '#ecfdf5', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-body)', fontWeight: 800 }}>Safety Index</span>
                      <strong style={{ color: "#22c55e", fontSize: '24px', fontFamily: 'var(--font-heading)' }}>{item.survivalRate}%</strong>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default ZooCategory;