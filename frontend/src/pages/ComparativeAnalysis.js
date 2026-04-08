import React, { useEffect, useState } from "react";
import { getComparativeAnalysis } from "../api/api";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend
} from "recharts";
import { Layers, Box, Bird, Turtle, Fish, MousePointer2, Download } from "lucide-react";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const COLORS = ["#ebc474", "#f59e0b", "#ef4444", "#22c55e", "#a855f7"];

const ComparativeAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const exportPDF = async () => {
    const input = document.getElementById("comparative-content");
    if (!input) return;
    
    setExporting(true);
    // Allow React state to update UI before heavy processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const canvas = await html2canvas(input, { 
        backgroundColor: '#0a0f0a', 
        scale: 2,
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Wildlife_Comparative_Intelligence.pdf');
    } catch (err) {
      console.error("PDF Export failed:", err);
    }
    setExporting(false);
  };

  useEffect(() => {
    getComparativeAnalysis()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Comparative Analysis Load Fail:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loader" style={{ margin: "100px auto" }}></div>;
  
  const hasCategoryData = data?.by_category && data.by_category.length > 0;
  const hasClassData = data?.by_class && data.by_class.length > 0;

  if (!hasCategoryData && !hasClassData) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "rgba(255,255,255,0.5)" }}>
        <Layers size={48} style={{ marginBottom: "20px", opacity: 0.2 }} />
        <p>Comparative Intel not yet aggregated for this dataset.</p>
        <p style={{ fontSize: "12px" }}>Ensure the database has been initialized with Species Class mapping.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="dashboard premium-bloom"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      style={{ paddingBottom: '100px' }}
    >
      <div className="header" style={{ marginBottom: "56px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: '4.5rem', fontWeight: '800', letterSpacing: '-3px', fontFamily: 'var(--font-heading)' }}>
            <Layers size={42} color="var(--primary)" /> Comparative Matrix
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '20px', marginTop: "12px", fontWeight: '500', fontFamily: 'var(--font-body)' }}>Segmenting Wildlife Inventory by Institution Scale & Biological Class</p>
        </div>
        <div className="header-actions">
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(235, 196, 116, 0.2)' }} 
            whileTap={{ scale: 0.95 }}
            className="btn-outline" 
            onClick={exportPDF}
            disabled={exporting}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', 
              padding: '12px 28px', borderRadius: '16px', 
              border: '1px solid var(--primary)', color: 'var(--primary)',
              background: 'transparent', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px'
            }}
          >
            {exporting ? <div className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : <Download size={18} />} 
            {exporting ? "Compiling..." : "Export Strategy"}
          </motion.button>
        </div>
      </div>

      <div id="comparative-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' }}>
        {/* SECTION 1: ZOO CATEGORY SEGMENTATION */}
        <div className="card large" style={{ padding: "40px", background: 'var(--glass-card)', border: '1px solid var(--glass-border)', borderRadius: '32px', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h3 style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
                <Box size={24} color="var(--primary)" /> Operational Scoping
              </h3>
              <p style={{ fontSize: "15px", color: 'var(--text-muted)', marginTop: '4px' }}>
                Performance metrics across institutional hierarchies (CZA Categorization).
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.by_category} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="zoo_size" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12, fill: '#ecfdf5' }} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(val) => `${val}%`} tick={{ fill: '#ecfdf5' }} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "rgba(5, 12, 10, 0.98)", border: "1px solid var(--glass-border)", borderRadius: "16px", boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="mortality_rate" name="Risk %" radius={[10, 10, 0, 0]} barSize={60}>
                {data.by_category.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SECTION 2: SPECIES CLASS SEGMENTATION */}
        <div className="card large" style={{ padding: "40px", background: 'var(--glass-card)', border: '1px solid var(--glass-border)', borderRadius: '32px', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h3 style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
                <Bird size={24} color="#4ade80" /> Biological Pulse
              </h3>
              <p style={{ fontSize: "15px", color: 'var(--text-muted)', marginTop: '4px' }}>
                Inventory stability by primary class.
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.by_class}
                dataKey="closing_balance_total"
                nameKey="species_class"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={8}
                stroke="none"
              >
                {data.by_class.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "rgba(5, 8, 10, 0.95)", border: "1px solid var(--glass-border)", borderRadius: "16px" }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: '800', color: '#ecfdf5' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DETAILED COMPARISON TABLE - Premium Grid View */}
      <div className="card" style={{ 
        marginTop: "40px", padding: "0", overflow: "hidden", 
        background: 'var(--glass-card)', border: '1px solid var(--glass-border)', borderRadius: '32px', boxShadow: 'var(--shadow-premium)'
      }}>
        <div style={{ padding: "24px 40px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "1.2rem", fontWeight: '700', fontFamily: 'Outfit' }}>
            <MousePointer2 size={20} color="var(--primary)" /> Cross-Segment Operational Analytics
          </h4>
          <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '20px', letterSpacing: '1px' }}>
            LIVE TELEMETRY
          </span>
        </div>
        <div style={{ padding: "0 40px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", opacity: 0.4, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: '800' }}>
            <span>Biological Segment</span>
            <span style={{ textAlign: 'right' }}>Total Deaths</span>
            <span style={{ textAlign: 'right' }}>Current Balance</span>
            <span style={{ textAlign: 'right' }}>Stability Index</span>
          </div>
          {data.by_class.map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ background: 'rgba(255,255,255,0.02)' }}
              style={{ 
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "24px 0", 
                borderBottom: i === data.by_class.length - 1 ? "none" : "1px solid rgba(255,255,255,0.03)", 
                alignItems: "center", transition: '0.2s'
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ padding: "10px", background: `${COLORS[i % COLORS.length]}10`, borderRadius: "12px", border: `1px solid ${COLORS[i % COLORS.length]}20` }}>
                  {item.species_class === "Mammalia" && <MousePointer2 size={18} color={COLORS[i % COLORS.length]} />}
                  {item.species_class === "Aves" && <Bird size={18} color={COLORS[i % COLORS.length]} />}
                  {item.species_class === "Reptilia" && <Turtle size={18} color={COLORS[i % COLORS.length]} />}
                  {item.species_class === "Amphibia" && <Fish size={18} color={COLORS[i % COLORS.length]} />}
                  {!["Mammalia", "Aves", "Reptilia", "Amphibia"].includes(item.species_class) && <Layers size={18} color={COLORS[i % COLORS.length]} />}
                </div>
                <div>
                  <div style={{ fontWeight: "800", fontSize: '1rem', color: '#fff' }}>{item.species_class || "Unknown"}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Segment #{i+1} Mapping</div>
                </div>
              </div>
              <span style={{ color: "#ef4444", textAlign: 'right', fontWeight: '700', fontSize: '1.1rem' }}>{item.total_death?.toLocaleString() || 0}</span>
              <span style={{ color: "var(--text-main)", textAlign: 'right', fontWeight: '700', fontSize: '1.1rem' }}>{item.closing_balance_total?.toLocaleString() || 0}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  color: item.mortality_rate > 10 ? '#ef4444' : '#22c55e', 
                  fontWeight: "900", background: `${item.mortality_rate > 10 ? '#ef4444' : '#22c55e'}15`,
                  padding: '6px 12px', borderRadius: '8px', display: 'inline-block', fontSize: '0.85rem'
                }}>
                  {item.mortality_rate}% Mortality
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ComparativeAnalysis;
