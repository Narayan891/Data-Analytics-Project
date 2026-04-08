import React, { useEffect, useState } from 'react';
import { getStrategicInsights, getEndangered } from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Baby, 
  TrendingDown, 
  Award, 
  Leaf, 
  ExternalLink,
  ChevronRight,
  Info,
  FileText
} from 'lucide-react';
import ReportGenerator from '../components/ReportGenerator';

// ==========================================
// TABLEAU CONFIGURATION 
// Paste your Tableau Dashboard or Story URL here:
// TABLEAU CONFIGURATION - ENSURE THESE POINT TO PRODUCTION ANALYTICS
const TABLEAU_STORY_1 = "https://public.tableau.com/views/Storypoint_17752762862250/Story1"; 
const TABLEAU_STORY_2 = "https://public.tableau.com/views/Storypoint_17752762862250/Story2"; 

// ==========================================

// Tableau Viz Wrapper (Using Native Tableau Web Component)
const TableauViz = ({ src }) => {
  useEffect(() => {
    if (!document.getElementById("tableau-js-api")) {
      const script = document.createElement("script");
      script.id = "tableau-js-api";
      script.type = "module";
      script.src = "https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js";
      document.head.appendChild(script);
    }
  }, []);

  // Strip query parameters from src to let Tableau's API handle them naturally
  const cleanSrc = src.split('?')[0];

  return (
    <div className="tableau-container" style={{ 
      width: '100%', 
      height: '650px', 
      borderRadius: '24px', 
      overflow: 'hidden', 
      border: '1px solid rgba(16, 185, 129, 0.2)',
      background: 'rgba(6, 78, 59, 0.6)',
      boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
    }}>
      <tableau-viz 
        id="tableauViz" 
        src={cleanSrc}
        toolbar="hidden" 
        hide-tabs="true"
        style={{ width: '100%', height: '100%' }}
      ></tableau-viz>
    </div>
  );
};

const StrategicIntelligence = () => {
  const [data, setData] = useState(null);
  const [endangeredCount, setEndangeredCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [activeTableau, setActiveTableau] = useState(1);

  useEffect(() => {
    getStrategicInsights()
      .then(res => setData(res.data))
      .catch(err => {
        console.error("Strategic Insights Load Fail:", err);
        setData({ 
          insights: { high_mortality: [], breeding_leaders: [], declining: [], overall_performance: [], conservation_priority: [] }, 
          national_averages: { mortality: 0, birth: 0 } 
        });
      });
    getEndangered()
      .then(res => setEndangeredCount(res.data?.length || 0))
      .catch(err => console.error("Endangered Stats Load Fail:", err));
  }, []);

  if (!data) return <div className="loader-container"><div className="loader"></div></div>;

  const insights = [
    {
      title: "High Mortality Detection",
      icon: <ShieldAlert size={24} color="#ef4444" />,
      desc: "Identifying institutions exceeding 1.5x National Average mortality threshold.",
      data: data.insights.high_mortality,
      metricLabel: "Mortality Rate",
      metricKey: "mortality_rate",
      color: "#ef4444"
    },
    {
      title: "Conservation Priority",
      icon: <Leaf size={24} color="#22c55e" />,
      desc: "Institutions hosting critical densities of protected species flagged for priority resource allocation.",
      data: data.insights.conservation_priority?.length > 0 ? data.insights.conservation_priority : [{ zoo_name: "Systemic Audit", species_count: "Pending" }],
      metricLabel: "Priority Species",
      metricKey: "species_count",
      color: "#22c55e"
    },
    {
      title: "Breeding Performance",
      icon: <Baby size={24} color="#3b82f6" />,
      desc: "Top-tier birth rate leaders benchmarking effective conservation replication.",
      data: data.insights.breeding_leaders,
      metricLabel: "Birth Rate",
      metricKey: "birth_rate",
      color: "#10b981"
    },
    {
      title: "Population Kinetic",
      icon: <TrendingDown size={24} color="#f59e0b" />,
      desc: "Tracking Net Population Shift (Births vs Deaths/Disposals) for localized institutional decline.",
      data: data.insights.declining,
      metricLabel: "Net Pop. Change",
      metricKey: "net_growth_index",
      color: "#f59e0b"
    },
    {
      title: "Performance Matrix",
      icon: <Award size={24} color="#a855f7" />,
      desc: "Composite ranking evaluating Mortality, Diversity, and Growth indices.",
      data: data.insights.overall_performance.slice(0, 5),
      metricLabel: "Score",
      metricKey: "performance_score",
      color: "#10b981"
    }
  ];

  return (
    <motion.div 
      className="strategic-hub premium-bloom"
      style={{ paddingBottom: '100px' }}
    >
      <header style={{ marginBottom: '56px' }}>
        <h1 style={{ fontSize: '4.5rem', marginBottom: '24px', fontWeight: '800', letterSpacing: '-3px', fontFamily: 'var(--font-heading)' }}>
          Strategic Intelligence Hub
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '20px', maxWidth: '850px', lineHeight: '1.6', fontWeight: '500', fontFamily: 'var(--font-body)' }}>
          Proprietary analytical engine processing cross-zoo metrics against <strong style={{ color: 'var(--primary)' }}>National Benchmarks</strong>. 
          Leveraging predictive kinetics and conservation priority mapping to drive administrative decisions.
        </p>
      </header>

      {/* 5 ACTIONABLE PILLARS GRID */}
      <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '60px' }}>
        {insights.map((item, idx) => (
          <motion.div 
            key={idx}
            className={`insight-card botanical-spotlight ${activeTab === idx ? 'active' : ''}`}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => setActiveTab(idx)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            }}
            style={{ 
              background: activeTab === idx ? 'rgba(16, 185, 129, 0.1)' : 'var(--glass-card)', 
              border: `1px solid ${activeTab === idx ? 'var(--primary)' : 'var(--glass-border)'}`,
              padding: '32px',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: activeTab === idx ? '0 30px 60px rgba(0,0,0,0.4), 0 0 40px rgba(16, 185, 129, 0.1)' : 'none'
            }}
          >
            <div className="spotlight-glow" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: `${item.color}15`, borderRadius: '12px', display: 'flex' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'Outfit' }}>{item.title}</h3>
              </div>

            </div>
            <p style={{ fontSize: '0.95rem', color: '#ecfdf5', opacity: 0.9, lineHeight: '1.5', marginBottom: '24px', position: 'relative', zIndex: 1, fontWeight: 500 }}>
              {item.desc}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: item.color, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                Tactical Audit
              </span>
              <div style={{ padding: '10px', background: `${item.color}10`, borderRadius: '50%', border: `1px solid ${item.color}20` }}>
                <ChevronRight size={18} color={item.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DRILL-DOWN SECTION */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="drill-down-panel premium-card"
          style={{ 
            background: 'var(--glass-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '56px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-premium)',
            marginBottom: '80px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="spotlight-glow" style={{ opacity: 0.1, background: `radial-gradient(circle at 50% 0%, ${insights[activeTab].color}33, transparent 70%)` }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
            <div>
              <h3 style={{ fontSize: '2.2rem', color: 'var(--text-main)', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-1px' }}>
                {insights[activeTab].title} <span style={{ color: insights[activeTab].color }}>Audit Matrix</span>
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: '500' }}>
                {activeTab === 4 
                  ? "Composite Index: (Diversity × 40%) + (Stability × 40%) - (Mortality × 20%)"
                  : activeTab === 1 
                  ? "Jurisdictional ranking by endangered/protected species density."
                  : `Real-time benchmarking vs National Average (${activeTab === 0 ? (data.national_averages.mortality * 100).toFixed(2) : (data.national_averages.birth * 100).toFixed(2)}%)`}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>

              <ReportGenerator 
                targetId={`drill-down-${activeTab}`} 
                projectName={`Tactical_Audit_${insights[activeTab].title.replace(/\s+/g, '_')}`} 
              />
            </div>
          </div>

          <div id={`drill-down-${activeTab}`} className="data-table">
             {insights[activeTab].data && insights[activeTab].data.length > 0 ? (
               insights[activeTab].data.map((row, i) => (
                 <div key={i} className="table-row" style={{ 
                   display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'
                 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', color: '#fff', fontSize: '1.1rem' }}>{row.zoo_name || row.species_name}</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9, color: '#4ade80', fontWeight: 700 }}>{row.state || "Active Conservation"}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: insights[activeTab].color }}>
                        {activeTab === 3 && (row[insights[activeTab].metricKey] > 0 ? '+' : '')}
                        {typeof row[insights[activeTab].metricKey] === 'number' ? 
                          (activeTab === 0 || activeTab === 2 ? (row[insights[activeTab].metricKey] * 100).toFixed(2) + '%' : row[insights[activeTab].metricKey]) 
                          : "URGENT"}
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.9, color: '#ecfdf5', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                        {activeTab === 3 ? (row[insights[activeTab].metricKey] < 0 ? 'Net Loss' : 'Net Gain') : insights[activeTab].metricLabel}
                      </div>
                    </div>
                 </div>
               ))
             ) : (
                <div style={{ padding: '40px', textAlign: 'center', opacity: 0.4 }}>
                    No actionable anomalies detected for this pillar.
                </div>
             )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* TABLEAU STRATEGIC PORTAL - THE BI COMMAND CENTER */}
      <section className="tableau-portal" style={{ 
        marginTop: '80px', 
        padding: '50px', 
        background: 'var(--glass-card)', 
        borderRadius: '40px',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.4)'
      }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '10px' }}>
                 <ExternalLink size={18} /> 
                 <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Enterprise Data Stream</span>
              </div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '800' }}>BI Command Center</h3>
              <p style={{ opacity: 0.6, maxWidth: '600px' }}>
                A high-frequency bridge to your **Tableau Cloud** instance. This section is optimized for full-screen exploration of institutional story points and strategic reports.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '0.7rem', opacity: 0.4, marginBottom: '5px' }}>TELEMETRY STATUS</div>
               <div style={{ color: '#22c55e', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}></div>
                  ACTIVE LINK
               </div>
            </div>
         </div>
         
          <div style={{ position: 'relative' }}>
             <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button 
                  onClick={() => setActiveTableau(1)}
                  className={activeTableau === 1 ? "btn-primary" : "btn-outline"}
                  style={{ fontSize: '12px', padding: '10px 24px' }}
                >
                  Primary Story
                </button>
                <button 
                  onClick={() => setActiveTableau(2)}
                  className={activeTableau === 2 ? "btn-primary" : "btn-outline"}
                  style={{ fontSize: '12px', padding: '10px 24px' }}
                >
                  Strategic Intelligence
                </button>
             </div>

             {(activeTableau === 1 ? TABLEAU_STORY_1 : TABLEAU_STORY_2) === "about:blank" ? (
               <div style={{ height: '650px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '24px', border: '1px solid var(--primary)', color: 'var(--text-muted)' }}>
                 <FileText size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                 <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Tactical Engine Offline</h3>
                 <p style={{ opacity: 0.6 }}>Strategic intelligence feed is currently being synchronized with the neural core.</p>
               </div>
             ) : (
               <TableauViz src={activeTableau === 1 ? TABLEAU_STORY_1 : TABLEAU_STORY_2} />
             )}


          </div>
         
         <div className="portal-footer" style={{ 
           marginTop: '30px', 
           padding: '25px', 
           background: 'rgba(255,255,255,0.02)', 
           borderRadius: '20px', 
           display: 'flex', 
           justifyContent: 'space-between',
           alignItems: 'center',
           border: '1px solid rgba(255,255,255,0.04)'
         }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <Info size={20} color="#10b981" />
              <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: 0, color: '#ecfdf5' }}>
                Fully responsive BI wrapper. Use the native Tableau toolbar above to access **Story Points**, download PDF views, or enter full-screen mode.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
               <div style={{ padding: '8px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>VERSION 3.0 API</div>
               <div style={{ padding: '8px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>SECURE SSL BRIDGE</div>
            </div>
         </div>
      </section>
    </motion.div>
  );
};

export default StrategicIntelligence;
