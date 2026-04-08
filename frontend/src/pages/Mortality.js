import React, { useEffect, useState, useMemo } from "react";
import { getMortalityDetails } from "../api/api";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { AlertOctagon, ShieldCheck, MapPin, HeartPulse, Activity } from "lucide-react";

// --- Custom Tooltip for Area Chart ---
const CustomAreaTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isCritical = data.mortalityRate > 10;
    const color = isCritical ? '#ef4444' : '#22c55e';
    return (
      <div style={{
        background: 'rgba(5, 12, 10, 0.98)',
        padding: '16px 20px',
        border: `1px solid ${color}`,
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        minWidth: '220px'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#fff', fontSize: '14px', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>{data.fullName}</p>
        <p style={{ margin: 0, color: color, fontSize: '15px', marginBottom: '4px' }}>
          <strong>Mortality Rate:</strong> {data.mortalityRate}%
        </p>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
          <strong>Deaths:</strong> {data.deaths} / <strong>Base Stock:</strong> {data.survival}
        </p>
      </div>
    );
  }
  return null;
};

function Mortality() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("All Regions");

  useEffect(() => {
    getMortalityDetails()
      .then(res => {
        setRawData(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const uniqueRegions = useMemo(() => {
    const regions = Array.from(new Set(rawData.map(item => item["state"] || "Unknown")));
    return ["All Regions", ...regions.sort()];
  }, [rawData]);

  const activeData = useMemo(() => {
    if (selectedRegion === "All Regions") return rawData;
    return rawData.filter(item => (item["state"] || "Unknown") === selectedRegion);
  }, [rawData, selectedRegion]);

  const allAggregatedData = useMemo(() => {
    const groupByVar = selectedRegion === "All Regions" ? "state" : "zoo_name";
    
    const groupMap = activeData.reduce((acc, item) => {
      let key = item[groupByVar] || "Unknown";
      if (!acc[key]) acc[key] = { name: key, deaths: 0, survival: 0 };
      acc[key].deaths += Number(item["total_death"] ?? item["deaths"] ?? 0);
      acc[key].survival += Number(item["closing_balance_total"] ?? item["closing_stock"] ?? 0);
      return acc;
    }, {});

    return Object.values(groupMap).map(d => {
      const mortalityRate = d.survival === 0 ? (d.deaths > 0 ? 100 : 0) : (d.deaths / d.survival);
      return {
        name: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name,
        fullName: d.name,
        mortalityRate: parseFloat((mortalityRate * 100).toFixed(2)),
        deaths: d.deaths,
        survival: d.survival
      };
    });
  }, [activeData, selectedRegion]);

  const chartData = useMemo(() => {
    return [...allAggregatedData]
      .sort((a,b) => b.mortalityRate - a.mortalityRate)
      .slice(0, 15);
  }, [allAggregatedData]);

  const totalDeaths = activeData.reduce((acc, curr) => acc + (Number(curr.total_death || curr.deaths || 0)), 0);
  const totalSafe = activeData.reduce((acc, curr) => acc + (Number(curr.closing_balance_total || curr.closing_stock || 0)), 0);
  const criticalEntities = allAggregatedData.filter(d => d.mortalityRate > 10).length;
  const safeEntities = useMemo(() => {
    const healthy = allAggregatedData.filter(d => d.mortalityRate < 5);
    if (healthy.length > 0) return healthy.sort((a, b) => a.mortalityRate - b.mortalityRate);
    return [...allAggregatedData].sort((a, b) => a.mortalityRate - b.mortalityRate).slice(0, 10);
  }, [allAggregatedData]);

  const safeDistData = [
    { name: "Total Recorded Casualties", value: totalDeaths },
    { name: "Total Surviving Population", value: totalSafe }
  ];
  const COLORS = ['#ef4444', '#22c55e'];

  return (
    <motion.div 
      className="dashboard premium-bloom"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      style={{ paddingBottom: '100px' }}
    >
      <header style={{ marginBottom: '56px' }}>
        <h1 style={{ fontSize: '4.5rem', marginBottom: '12px', fontWeight: '800', letterSpacing: '-3px', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Activity size={48} color="#ef4444" /> Operational Alert Matrix
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '20px', maxWidth: '850px', lineHeight: '1.6', fontWeight: '500', fontFamily: 'var(--font-body)' }}>
          Processing real-time telemetry from <strong style={{ color: 'var(--primary)' }}>50+ Jurisdictions</strong>. Identifying biological anomalies and critical ecosystem triggers.
        </p>
      </header>
        
      <div className="tactical-selector-container" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', marginBottom: '40px' }}>
        <MapPin size={20} color="#ef4444" />
        <select 
          className="tactical-selector"
          value={selectedRegion} 
          onChange={e => setSelectedRegion(e.target.value)}
        >
          {uniqueRegions.map((region, idx) => (
            <option key={idx} value={region}>
              {region === "All Regions" ? "Global Risk Matrix" : region}
            </option>
          ))}
        </select>
      </div>

      <div className="kpi-grid">
        <motion.div 
          className="kpi-card main botanical-spotlight" 
          whileHover={{ y: -10, scale: 1.02 }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
          }}
          style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239, 68, 68, 0.05)' }}
        >
          <div className="spotlight-glow" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
            <h4 style={{ color: '#ef4444', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', fontWeight: '900' }}>Baseline Fatality</h4>
            <HeartPulse size={22} />
          </div>
          <h2 style={{ fontSize: '3.8rem', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-2px', position: 'relative', zIndex: 1, color: '#fff' }}>{totalDeaths.toLocaleString()}</h2>
          <span style={{ fontSize: '13px', opacity: 0.7, position: 'relative', zIndex: 1, color: 'var(--text-muted)' }}>{selectedRegion === "All Regions" ? "Global recorded casualties" : `Regional aggregate: ${selectedRegion}`}</span>
        </motion.div>
        
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
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', fontWeight: '900' }}>{selectedRegion === "All Regions" ? "Critical Risk Zones" : "Risk Clusters"}</h4>
            <AlertOctagon size={22} />
          </div>
          <h2 style={{ fontSize: '3.8rem', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-2px', position: 'relative', zIndex: 1, color: '#fff' }}>{criticalEntities}</h2>
          <span style={{ fontSize: '13px', opacity: 0.7, position: 'relative', zIndex: 1, color: 'var(--text-muted)' }}>Immediate containment required</span>
        </motion.div>

        <motion.div 
          className="kpi-card botanical-spotlight" 
          whileHover={{ y: -10 }} 
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
          }}
          style={{ border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34, 197, 94, 0.05)' }}
        >
          <div className="spotlight-glow" />
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', fontWeight: '900' }}>Survival Quotient</h4>
            <ShieldCheck size={22} />
          </div>
          <h2 style={{ fontSize: '3.8rem', color: '#22c55e', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-2px', position: 'relative', zIndex: 1 }}>{((totalSafe / (totalSafe + totalDeaths || 1)) * 100).toFixed(1)}%</h2>
          <span style={{ fontSize: '13px', opacity: 0.7, position: 'relative', zIndex: 1, color: 'var(--text-muted)' }}>Relative ecosystem stability index</span>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="card premium-card" 
        style={{ marginTop: '32px', padding: '40px', border: '1px solid rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '28px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
          <AlertOctagon size={24} color="#ef4444" />
          <strong style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px', color: '#ef4444', fontWeight: '900', fontFamily: 'var(--font-body)' }}>Tactical Veterinary Protocol:</strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', fontSize: '14px', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
           <div style={{ display: 'flex', gap: '15px' }}>
              <span style={{ color: '#ef4444', fontWeight: '900', fontSize: '18px' }}>01.</span>
              <span style={{ opacity: 0.9, lineHeight: '1.6' }}><strong>Emergency Audit</strong>: Deploy senior wildlife surgeons to <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{selectedRegion === "All Regions" ? "highest risk hubs" : selectedRegion}</span>.</span>
           </div>
           <div style={{ display: 'flex', gap: '15px' }}>
              <span style={{ color: '#ef4444', fontWeight: '900', fontSize: '18px' }}>02.</span>
              <span style={{ opacity: 0.9, lineHeight: '1.6' }}><strong>Nutrition Sync</strong>: Verify dietary dispersal and hydration benchmarks across isolated cluster zones.</span>
           </div>
           <div style={{ display: 'flex', gap: '15px' }}>
              <span style={{ color: '#ef4444', fontWeight: '900', fontSize: '18px' }}>03.</span>
              <span style={{ opacity: 0.9, lineHeight: '1.6' }}><strong>Containment</strong>: Isolate cluster zones showing &gt;15% mortality variance relative to the national baseline.</span>
           </div>
        </div>
      </motion.div>

      <div className="main-grid" style={{ gridTemplateColumns: '1.5fr 1fr', marginTop: '30px' }}>
        <div className="card large" style={{ padding: '30px', background: 'var(--glass-card)', border: '1px solid var(--glass-border)', borderRadius: '32px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-heading)', fontSize: '1.8rem' }}>
            <AlertOctagon size={24} color="#ef4444" /> Mortality Risk Index 
            <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)' }}>
              ({selectedRegion === "All Regions" ? "State Aggregation" : "Zoo Index"})
            </span>
          </h3>
          
          {loading ? (
            <div className="loader" style={{ margin: 'auto' }}></div>
          ) : chartData.length === 0 ? (
            <div style={{ display: 'flex', height: '320px', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
              No mortality data recorded.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 60 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255, 255, 255, 0.45)" 
                  tick={{ fontSize: 11, fill: '#ecfdf5', fontWeight: 700 }} 
                  dy={20} 
                  interval={0} 
                  angle={-35} 
                  textAnchor="end"
                  height={80}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' }} />
                <Area 
                  type="monotone" 
                  dataKey="mortalityRate" 
                  stroke="#ef4444" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRisk)" 
                  activeDot={{ r: 10, strokeWidth: 3, fill: '#05080a', stroke: '#ef4444' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card" style={{ padding: '40px', background: 'var(--glass-card)', border: '1px solid var(--glass-border)', borderRadius: '32px' }}>
          <h3 style={{ marginBottom: '32px', textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '2.2rem', color: '#fff' }}>Survival Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={safeDistData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {safeDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(5, 12, 10, 0.98)', border: '1px solid var(--glass-border)', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: '600', color: 'var(--text-muted)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '30px', background: 'var(--glass-card)', border: '1px solid var(--glass-border)', borderRadius: '32px', padding: '40px' }}>
        <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-heading)', fontSize: '2.2rem' }}>
          <ShieldCheck size={32} color="#22c55e" /> Validated Safe Zones
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {safeEntities.length === 0 ? (
            <p style={{ opacity: 0.6, width: '100%', padding: '20px', fontFamily: 'var(--font-body)' }}>No safe entities found in this context.</p>
          ) : (
             safeEntities.slice(0, 10).map((d, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -8, scale: 1.02 }}
                style={{ 
                  background: 'rgba(34, 197, 94, 0.05)', 
                  border: `1px solid ${d.mortalityRate < 5 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`, 
                  padding: '24px', borderRadius: '24px', textAlign: 'center',
                  backdropFilter: 'blur(10px)', transition: '0.4s all cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                <div style={{ 
                  background: d.mortalityRate < 5 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                  color: d.mortalityRate < 5 ? '#22c55e' : '#f59e0b', 
                  fontSize: '11px', fontWeight: '900', padding: '6px 12px', 
                  borderRadius: '30px', display: 'inline-block', marginBottom: '16px',
                  border: `1px solid ${d.mortalityRate < 5 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  {d.mortalityRate < 5 ? 'VALIDATED SAFE' : 'LOW RISK'}
                </div>
                <span style={{ display: 'block', fontWeight: '800', color: '#fff', fontSize: '1.2rem', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>{d.fullName}</span>
                <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', display: 'block', marginBottom: '12px', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                   Regional Facility
                </span>
                <div style={{ color: d.mortalityRate < 5 ? '#22c55e' : '#fbbf24', fontWeight: '900', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
                  {d.mortalityRate}% Risk
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

    </motion.div>
  );
}

export default Mortality;