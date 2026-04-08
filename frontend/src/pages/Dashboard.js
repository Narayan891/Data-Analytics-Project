import React, { useEffect, useState, useCallback } from "react";
import { getStateRisk, runPrediction } from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine, LabelList
} from "recharts";
import { AlertTriangle, TrendingUp, ShieldCheck, Activity, GripHorizontal } from "lucide-react";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";

// NEW: Drag and drop modularity
import { Responsive as ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// SVG Map Component
import GeographicalMap from '../components/GeographicalMap';
import HolographicLoader from '../components/HolographicLoader';
import ReportGenerator from '../components/ReportGenerator';

// --- Custom Professional Tooltip for Dashboard ---
const CustomDashboardTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const rate = (data.mortality_rate * 100).toFixed(2);
    let statusColor = '#22c55e';
    let statusText = 'SAFE ECO-ZONE';

    if (data.mortality_rate > 0.63) {
      statusColor = '#ef4444';
      statusText = 'CRITICAL RISK';
    } else if (data.mortality_rate > 0.35) {
      statusColor = '#f59e0b';
      statusText = 'MODERATE ALERT';
    }

    return (
      <div style={{
        background: 'rgba(6, 78, 59, 0.98)',
        padding: '16px 20px',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
        zIndex: 1000,
        minWidth: '220px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid rgba(16, 185, 129, 0.1)', paddingBottom: '8px' }}>
          <strong style={{ color: '#ecfdf5', fontSize: '16px' }}>{data.state}</strong>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: statusColor, textTransform: 'uppercase', letterSpacing: '1px' }}>{statusText}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(236, 253, 245, 0.6)', fontSize: '12px' }}>Mortality Rate:</span>
            <span style={{ color: statusColor, fontWeight: 'bold', fontSize: '14px' }}>{rate}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(236, 253, 245, 0.6)', fontSize: '12px' }}>Total Casualties:</span>
            <span style={{ color: '#ecfdf5', fontSize: '13px', fontWeight: '600' }}>{(data.total_death || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState("");
  const [filteredStates, setFilteredStates] = useState([]); // Tactical Filter state
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const toggleStateFilter = (stateName) => {
    setFilteredStates(prev => 
      prev.includes(stateName) 
        ? prev.filter(s => s !== stateName) 
        : [...prev, stateName]
    );
  };

  const handlePredict = useCallback(async (stateName) => {
    const targetState = stateName || selected;
    if (!targetState) return;
    const state = data.find(d => d.state === targetState);
    if (!state) return;

    setLoading(true);
    try {
      const deaths = state.total_death ?? state.deaths ?? 0;
      const stock = state.closing_balance_total ?? state.closing_stock ?? 0;

      const res = await runPrediction({
        deaths: deaths,
        stock: stock
      });
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [data, selected]);

  // Auto-trigger prediction when selection changes via Map or Dropdown
  useEffect(() => {
    if (selected) {
      handlePredict(selected);
    } else {
      setPrediction(null);
    }
  }, [selected, handlePredict]);

  useEffect(() => {
    setLoading(true);
    getStateRisk()
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const selectedData = selected ? data.find(d => d.state === selected) : null;
  
  const totalStates = selected ? 1 : data.length;
  const highRisk = selected 
    ? (selectedData?.predicted_risk === 1 ? 1 : 0) 
    : data.filter(d => d.predicted_risk === 1).length;
  const safe = totalStates - highRisk;
  const riskPercent = selected 
    ? (selectedData?.mortality_rate || 0).toFixed(1)
    : (totalStates > 0 ? ((highRisk / totalStates) * 100).toFixed(1) : 0);

  const topRisk = [...data].sort((a, b) => (b.mortality_rate || 0) - (a.mortality_rate || 0)).filter(d => d.predicted_risk === 1).slice(0, 4);
  
  // Tactical Data Logic: Prioritize filtered states, else show top 10
  const displayData = filteredStates.length > 0 
    ? data.filter(d => filteredStates.includes(d.state))
    : [...data].sort((a, b) => (b.mortality_rate || 0) - (a.mortality_rate || 0)).slice(0, 10);

  const chartData = displayData.sort((a, b) => (b.mortality_rate || 0) - (a.mortality_rate || 0));

  // Dynamic Color Science: Heatmap mapping
  // Unified Premium Color Science: Synchronized with Choropleth Legend
  const getBarColor = (rate) => {
    if (rate > 0.75) return 'url(#barGradCritical)'; // Severe
    if (rate > 0.60) return 'url(#barGradHigh)';     // High
    if (rate > 0.45) return 'url(#barGradMedium)';   // Elevated
    if (rate > 0.30) return 'url(#barGradWarning)';  // Low Alert
    return 'url(#barGradSafe)';                      // Stable
  };

  // Industry Standard Enterprise Grid Layout Algorithm
  const defaultLayout = [
    // ROW 1: Optimized High-Fidelity Shelf
    { i: "map", x: 0, y: 0, w: 6, h: 6 },
    { i: "chart", x: 6, y: 0, w: 6, h: 6 },
    
    // ROW 2: Tactical Intelligence
    { i: "predict", x: 0, y: 6, w: 6, h: 6 },
    { i: "alerts", x: 6, y: 6, w: 6, h: 6 }
  ];

  const { width, containerRef, mounted } = useContainerWidth();

  return (
    <motion.div 
      className="dashboard"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
    >
      <div className="header" style={{ marginBottom: '10px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '4.5rem', fontWeight: '800', letterSpacing: '-3px', fontFamily: 'var(--font-heading)' }}>
            Wildlife Intelligence Center
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '20px', fontWeight: '500', fontFamily: 'var(--font-body)' }}>
            {selected ? `Drill-down active: ${selected}` : "Real-time telemetry & modular insights. Scroll to Explore."}
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          {selected && (
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="btn-outline" 
              onClick={() => setSelected("")}
              style={{ borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Reset Global View
            </motion.button>
          )}
          <ReportGenerator 
            targetId="dashboard-content" 
            projectName={`Zoo_Executive_Report_${selected || 'Global'}`} 
          />
        </div>
      </div>

      {/* TACTICAL SELECTOR DROPDOWN */}
      <div className="tactical-selector-container">
        <Activity size={20} color="var(--primary)" />
        <select 
          className="tactical-selector"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Global Ecosystem Overview</option>
          {data.map((d, i) => (
            <option key={i} value={d.state}>{d.state}</option>
          ))}
        </select>
        {selected && (
          <span 
            onClick={() => setSelected("")}
            style={{ fontSize: '11px', color: '#ef4444', cursor: 'pointer', fontWeight: 800, textDecoration: 'underline', textTransform: 'uppercase' }}
          >
            Reset Intelligence
          </span>
        )}
      </div>

      <div id="dashboard-content" style={{ 
        background: 'transparent', 
        paddingBottom: '60px', 
        minHeight: '120vh',
        position: 'relative'
      }} ref={containerRef}>
        
        <AnimatePresence>
          {loading && data.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100 }}
            >
              <HolographicLoader />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* KPI GRID (Bionic Botanical Spotlight) */}
        <div className="kpi-grid" style={{ marginBottom: '32px' }}>
          {[
            { title: "Total Covered States", value: totalStates, icon: <Activity size={20} />, sub: "Active Jurisdictions", type: "main" },
            { title: "Critical Risk Zones", value: highRisk, icon: <AlertTriangle size={18} />, sub: `${riskPercent}% Attention Required`, color: '#ef4444' },
            { title: "Safe Eco-zones", value: safe, icon: <ShieldCheck size={18} />, sub: "Optimal Conditions", color: 'var(--primary)' },
            { title: selected ? "Regional Index" : "Risk Index", value: `${riskPercent}%`, icon: <TrendingUp size={18} />, sub: selected ? "Regional mortality" : "Threshold baseline", color: '#fbbf24' }
          ].map((kpi, idx) => (
            <motion.div 
              key={idx}
              className={`kpi-card botanical-spotlight ${kpi.type || ""}`} 
              whileHover={{ y: -8, scale: 1.02 }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
              }}
              style={{
                border: kpi.type === 'main' ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                background: kpi.type === 'main' ? 'rgba(45, 90, 39, 0.05)' : 'var(--glass-card)',
                boxShadow: kpi.type === 'main' ? 'var(--moss-glow)' : 'none',
                overflow: 'hidden'
              }}
            >
              <div className="spotlight-glow" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
                <h4 style={{ color: kpi.color || 'var(--text-muted)', fontSize: '11px', fontWeight: '800' }}>{kpi.title}</h4>
                <div style={{ color: kpi.color || 'var(--primary)' }}>{kpi.icon}</div>
              </div>
              <h2 style={{ color: 'var(--text-main)', position: 'relative', zIndex: 1, letterSpacing: '-2px', fontWeight: '800', fontSize: '3.8rem', fontFamily: 'var(--font-heading)' }}>{kpi.value}</h2>
              <span style={{ position: 'relative', zIndex: 1, color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500', fontFamily: 'var(--font-body)' }}>{kpi.sub}</span>
            </motion.div>
          ))}
        </div>

        {mounted && (
        <ResponsiveGridLayout 
          className="layout" 
          layouts={{ lg: defaultLayout, md: defaultLayout, sm: defaultLayout }} 
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 12, xs: 4, xxs: 2 }}
          rowHeight={80}
          width={width}
          draggableHandle=".drag-handle"
          isBounded={false}
          margin={[20, 20]}
        >
          {/* GEOGRAPHICAL MAP */}
          <div key="map" className="card large premium-bloom" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: '800' }}>
              <GripHorizontal className="drag-handle" size={24} style={{ marginRight: '16px', opacity: 0.4, cursor: 'grab' }} />
              Regional Risk Mapping
            </h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <GeographicalMap data={data} onSelect={setSelected} selected={selected} filteredStates={filteredStates} />
            </div>
          </div>

          {/* MAIN CHART CONTAINTER */}
          <div key="chart" className="card large premium-bloom" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <GripHorizontal className="drag-handle" size={18} style={{ marginRight: '10px', opacity: 0.4, cursor: 'grab' }} />
              📊 Risk Distribution Overview
            </h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="barGradCritical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.8"/>
                    </linearGradient>
                    <linearGradient id="barGradHigh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#78350f" stopOpacity="0.8"/>
                    </linearGradient>
                    <linearGradient id="barGradMedium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#064e3b" stopOpacity="0.8"/>
                    </linearGradient>
                    <linearGradient id="barGradWarning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#064e3b" stopOpacity="0.8"/>
                    </linearGradient>
                    <linearGradient id="barGradSafe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#065f46" stopOpacity="0.8"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.05)" vertical={false} />
                  <XAxis 
                    dataKey="state" 
                    stroke="rgba(255, 255, 255, 0.4)"
                    tick={{fill: "var(--text-main)", fontSize: 11, fontWeight: 700}}
                    axisLine={false}
                    tickLine={false}
                    dy={15}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.4)"
                    tick={{fill: "var(--text-main)", fontSize: 11}} 
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    content={<CustomDashboardTooltip />}
                  />
                  <Bar 
                    dataKey="mortality_rate" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getBarColor(entry.mortality_rate)} 
                        fillOpacity={0.9}
                      />
                    ))}
                    <LabelList 
                      dataKey="mortality_rate" 
                      position="top" 
                      formatter={(val) => `${(val * 100).toFixed(0)}%`}
                      style={{ fill: 'var(--text-main)', fontSize: 10, fontWeight: 'bold' }}
                      offset={10}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI HABITAT ASSESSMENT & TELEMETRY */}
          <div key="predict" className="card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            overflowY: 'auto', 
            maxHeight: '520px', 
            minHeight: '450px',
            scrollPaddingBottom: '20px'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-card)', backdropFilter: 'blur(10px)', padding: '5px 0', borderRadius: '5px' }}>
               <GripHorizontal className="drag-handle" size={18} style={{ marginRight: '10px', opacity: 0.4, cursor: 'grab' }} />
              🤖 AI Habitat Assessment & Telemetry
            </h3>
            <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '15px' }}>
              Real-time probabilistic monitoring of regional ecosystem stability.
            </p>
            <select 
              value={selected}
              onChange={(e) => setSelected(e.target.value)} 
              className="modern-select" 
              style={{ marginBottom: '10px' }}
            >
              <option value="">Select State to analyze</option>
              {data.map((d, i) => (
                <option key={i} value={d.state}>{d.state}</option>
              ))}
            </select>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="btn-primary" 
              onClick={() => handlePredict()} 
              style={{ width: '100%' }}
              disabled={!selected || loading}
            >
              {loading ? "Analyzing..." : "Re-Run Assessment"}
            </motion.button>
            <AnimatePresence>
              {prediction && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`badge ${prediction.risk ? "danger" : "success"}`}
                  style={{ marginTop: '15px', padding: '15px', borderRadius: '15px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {prediction.risk ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
                    <strong>{prediction.risk ? "CITICAL ALERT" : "SYSTEM STABLE"}</strong>
                  </div>
                  
                  {/* Confidence Explanation */}
                  <div style={{ fontSize: '11px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                       <Activity size={12} />
                       <strong>Confidence Score: {prediction.confidence}%</strong>
                    </div>
                    <span style={{ opacity: 0.7 }}>
                      Mathematical probability that current habitat trends will persist over the next 30-day window.
                    </span>
                  </div>

                  {/* Strategic Protocol (Overcoming the situation) */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                    <strong style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, display: 'block', marginBottom: '5px' }}>
                      Recommended Strategic Protocol:
                    </strong>
                    {prediction.risk ? (
                      <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '11px', lineHeight: '1.5', listStyleType: 'decimal' }}>
                        <li><strong>Deploy Audit</strong>: Trigger immediate senior veterinary review.</li>
                        <li><strong>Sync Resource</strong>: Verify habitat nourishment & O2 levels.</li>
                        <li><strong>Cluster Mapping</strong>: Check neighboring states for anomalies.</li>
                      </ul>
                    ) : (
                      <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={14} />
                        <span>Continue standard husbandry. Next audit in 14 days.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PRIORITY ACTION ITEMS */}
          <div key="alerts" className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <GripHorizontal className="drag-handle" size={18} style={{ marginRight: '10px', opacity: 0.4, cursor: 'grab' }} />
              <AlertTriangle color="#ef4444" size={20} style={{ marginRight: '5px' }}/> Priority Fixes
            </h3>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
              {topRisk.length === 0 ? (
                <p style={{ opacity: 0.6, fontSize: '14px' }}>No major anomalies detected across jurisdictions.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {topRisk.map((d, i) => (
                    <div key={i} className="alert risk-row" style={{ padding: '10px', margin: 0 }}>
                      <strong>{d.state}</strong>
                      <span style={{ display: 'block', fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>High mortality trajectory. Immediate resource allocation advised.</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </ResponsiveGridLayout>
        )}
      </div>
    </motion.div>
  );
}

export default Dashboard;