import React, { useEffect, useState, useMemo } from "react";
import { getPredictions, getMLStats } from "../api/api";
import { motion } from "framer-motion";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell
} from "recharts";
import { BrainCircuit, ActivitySquare, Target, Zap, Filter } from "lucide-react";
import NeuralSimulation from "../components/NeuralSimulation";

// --- Custom Tooltip for Area Chart ---
const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="card" style={{
        background: 'rgba(5, 12, 10, 0.98)',
        padding: '16px 20px',
        border: '1px solid var(--primary)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        zIndex: 100
      }}>
        <p style={{ margin: 0, fontWeight: '800', color: '#fff', fontSize: '15px', marginBottom: '8px', letterSpacing: '0.5px' }}>{data.fullName}</p>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '12px' }} />
        <p style={{ margin: 0, color: 'var(--primary)', fontSize: '15px', marginBottom: '4px', fontWeight: '700' }}>
          STOCK FORECAST: {data.growth}
        </p>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
          VERIFIED BASE: {data.actual}
        </p>
      </div>
    );
  }
  return null;
};

// --- Custom Tooltip for Bar Chart ---
const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.weight > 0;
    const color = isPositive ? '#4ade80' : '#ef4444';
    return (
      <div style={{
        background: 'rgba(10, 15, 10, 0.95)',
        padding: '12px 18px',
        border: `1px solid ${color}`,
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        transform: 'scale(1.05)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#fff', fontSize: '14px', marginBottom: '8px' }}>{data.feature}</p>
        <p style={{ margin: 0, color: color, fontSize: '15px' }}>
          <strong>Algorithmic Weight:</strong> {data.weight.toFixed(4)}
        </p>
      </div>
    );
  }
  return null;
};

function MLModel() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZoo, setSelectedZoo] = useState("All Zoos");

  useEffect(() => {
    Promise.all([getPredictions(), getMLStats()])
      .then(([predRes, statsRes]) => {
        setData(predRes.data || []);
        setStats(statsRes.data || null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const uniqueZoos = useMemo(() => {
    const zoos = Array.from(new Set(data.map(item => item["zoo_name"] || "Unknown")));
    return ["All Zoos", ...zoos.sort()];
  }, [data]);

  const activeData = useMemo(() => {
    if (selectedZoo === "All Zoos") return data;
    return data.filter(item => (item["zoo_name"] || "Unknown") === selectedZoo);
  }, [data, selectedZoo]);

  const groupedData = useMemo(() => {
    const groupByVar = selectedZoo === "All Zoos" ? "zoo_name" : "species_name";
    
    const groupMap = activeData.reduce((acc, item) => {
      let key = item[groupByVar] || "Unknown";
      if (!acc[key]) acc[key] = { name: key, totalActual: 0, sumPredicted: 0, count: 0 };
      acc[key].totalActual += Number(item["closing_balance_total"] ?? 0);
      acc[key].sumPredicted += Number(item["predicted_closing"] ?? 0);
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(groupMap).map(z => ({
      name: z.name.length > 15 ? z.name.substring(0, 15) + '...' : z.name,
      fullName: z.name,
      growth: parseFloat(z.sumPredicted.toFixed(2)),
      actual: parseFloat(z.totalActual.toFixed(2))
    })).sort((a,b) => b.growth - a.growth).slice(0, 15);
  }, [activeData, selectedZoo]);

  let featureWeights = [];
  let highestNegative = { feature: "N/A", weight: 0 };
  let highestPositive = { feature: "N/A", weight: 0 };

  if (stats && stats.weights) {
    featureWeights = Object.entries(stats.weights).map(([key, val]) => ({
      feature: key.replace("_", " "),
      weight: parseFloat(val.toFixed(4))
    })).sort((a, b) => b.weight - a.weight);

    highestPositive = featureWeights[0] || highestPositive;
    highestNegative = featureWeights[featureWeights.length - 1] || highestNegative;
  }

  return (
    <motion.div 
      className="dashboard premium-bloom"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      style={{ paddingBottom: '100px' }}
    >
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '4.5rem', fontWeight: '800', letterSpacing: '-3px', fontFamily: 'var(--font-heading)' }}>
            <BrainCircuit color="var(--primary)" size={42} /> Intelligence Matrix
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '20px', marginTop: '12px', fontWeight: '500', fontFamily: 'var(--font-body)' }}>Strategic Ecosystem Projections & Algorithmic Feature Weights</p>
        </div>
        
        <div className="tactical-selector-container">
          <Filter size={20} color="var(--primary)" />
          <select 
            className="tactical-selector"
            value={selectedZoo} 
            onChange={e => setSelectedZoo(e.target.value)}
          >
            {uniqueZoos.map((zoo, idx) => (
              <option key={idx} value={zoo}>
                {zoo === "All Zoos" ? "Global Matrix View" : zoo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PROMINENT NEURAL SIMULATION SECTION (MOVED UP) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '60px' }}
      >
        <NeuralSimulation />
      </motion.div>

      <div className="kpi-grid">
        <motion.div 
          className="kpi-card main botanical-spotlight" 
          whileHover={{ y: -10, scale: 1.02 }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
          }}
        >
          <div className="spotlight-glow" />
          <div style={{display:'flex', justifyContent:'space-between', marginBottom: '16px', position: 'relative', zIndex: 1}}>
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', opacity: 0.9, fontWeight: '900' }}>Model Confidence</h4>
            <Target size={22} />
          </div>
          <h2 style={{ fontSize: '3.8rem', fontWeight: '800', fontFamily: 'Outfit', letterSpacing: '-2px', position: 'relative', zIndex: 1 }}>{stats ? (stats.accuracy * 100).toFixed(1) : 0}%</h2>
          <span style={{ fontSize: '13px', opacity: 0.7, position: 'relative', zIndex: 1 }}>Cross-validated ecosystem fit</span>
        </motion.div>
        
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
          <div style={{display:'flex', justifyContent:'space-between', marginBottom: '16px', color: 'var(--text-main)', position: 'relative', zIndex: 1}}>
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', fontWeight: '900' }}>Matrix Volume</h4>
            <ActivitySquare size={22} />
          </div>
          <h2 style={{ fontSize: '3.8rem', color: '#fff', fontWeight: '800', fontFamily: 'Outfit', letterSpacing: '-2px', position: 'relative', zIndex: 1 }}>{activeData.length}</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>{selectedZoo === "All Zoos" ? "Global Evaluated Points" : "Local Verified Slices"}</span>
        </motion.div>

        <motion.div 
          className="kpi-card botanical-spotlight" 
          whileHover={{ y: -10 }} 
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
          }}
          style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239, 68, 68, 0.05)' }}
        >
           <div className="spotlight-glow" />
           <div style={{display:'flex', justifyContent:'space-between', color: '#ef4444', marginBottom: '16px', position: 'relative', zIndex: 1}}>
             <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', fontWeight: '900' }}>Critical Lever</h4>
             <Zap size={22} />
           </div>
          <h2 style={{ color: '#ef4444', textTransform: 'capitalize', fontSize: '2.4rem', fontWeight: '800', fontFamily: 'Outfit', position: 'relative', zIndex: 1 }}>{highestNegative.feature}</h2>
          <span style={{ fontSize: '13px', color: 'rgba(239, 68, 68, 0.7)', position: 'relative', zIndex: 1 }}>Strongest negative weight factor</span>
        </motion.div>
        
        <motion.div 
          className="kpi-card botanical-spotlight" 
          whileHover={{ y: -10 }} 
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
          }}
          style={{ border: '1px solid rgba(235, 196, 116, 0.3)', background: 'rgba(235, 196, 116, 0.08)' }}
        >
           <div className="spotlight-glow" />
           <div style={{display:'flex', justifyContent:'space-between', color: 'var(--primary)', marginBottom: '16px', position: 'relative', zIndex: 1}}>
             <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', fontWeight: '900' }}>Growth Catalyst</h4>
             <Zap size={22} />
           </div>
          <h2 style={{ color: 'var(--primary)', textTransform: 'capitalize', fontSize: '2.4rem', fontWeight: '900', fontFamily: 'Outfit', position: 'relative', zIndex: 1 }}>{highestPositive.feature}</h2>
          <span style={{ fontSize: '13px', color: '#ecfdf5', opacity: 0.9, position: 'relative', zIndex: 1, fontWeight: 700 }}>Primary algorithmic growth driver</span>
        </motion.div>
      </div>

      <div className="main-grid" style={{ gridTemplateColumns: '2fr 1fr', marginTop: '30px' }}>
        <div className="card large" style={{ padding: '40px', background: 'var(--glass-card)', border: '1px solid var(--glass-border)', borderRadius: '32px' }}>
          <h3 style={{ marginBottom: '32px', fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.8rem' }}>
            📉 Target Projections
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ({selectedZoo === "All Zoos" ? "Aggregated Fleet Forecast" : `Regional Focus: ${selectedZoo}`})
            </span>
          </h3>
          {loading ? (
            <div className="loader" style={{ margin: 'auto' }}></div>
          ) : activeData.length === 0 ? (
            <div style={{ display: 'flex', height: '320px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Telemetry dark. No predictive vectors found.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={groupedData} margin={{ top: 10, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255, 255, 255, 0.5)" 
                  tick={{ fontSize: 11, fill: '#ecfdf5', fontWeight: 700 }} 
                  dy={20} 
                  interval={0} 
                  angle={-35} 
                  textAnchor="end"
                  height={80}
                  axisLine={false}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.5)" 
                  tick={{ fontSize: 11, fill: '#ecfdf5', fontWeight: 700 }} 
                  tickFormatter={val => val.toLocaleString()} 
                  axisLine={false}
                />
                <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '5 5' }} />
                <Bar 
                  dataKey="growth" 
                  fill="var(--primary)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card" style={{ padding: '40px', background: 'var(--glass-card)', border: '1px solid var(--glass-border)', borderRadius: '32px' }}>
          <h3 style={{ marginBottom: '32px', fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.8rem' }}>Algorithmic Weights</h3>
          {loading ? (
             <div className="loader" style={{ margin: 'auto' }}></div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={featureWeights} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="rgba(255, 255, 255, 0.45)" 
                  tick={{ fontSize: 11, fill: '#ecfdf5', fontWeight: 700 }} 
                  tickFormatter={val => val.toFixed(2)} 
                  axisLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="feature" 
                  stroke="rgba(255,255,255,0.2)" 
                  tick={{ fontSize: 11, fill: '#fff', fontWeight: '600' }} 
                  axisLine={false}
                />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} content={<CustomBarTooltip />} />
                <Bar dataKey="weight" radius={[0, 10, 10, 0]} barSize={25}>
                  {
                    featureWeights.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.weight > 0 ? 'var(--primary)' : '#ef4444'} fillOpacity={0.9} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default MLModel;
