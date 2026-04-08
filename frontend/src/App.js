import React, { useState, useEffect } from "react";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import ZooCategory from "./pages/ZooCategory";
import Mortality from "./pages/Mortality";
import DataExplorer from "./pages/DataExplorer";
import MLModel from "./pages/MLModel";
import StrategicIntelligence from "./pages/StrategicIntelligence";
import ComparativeAnalysis from "./pages/ComparativeAnalysis";

import CommandPalette from "./components/CommandPalette";
import ActionCenter from "./components/ActionCenter";
import ForestBackground from "./components/ForestBackground";

import { Keyboard, LogOut, Shield, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('zoo_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('zoo_token');
    setIsAuthenticated(false);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if(el) {
      // Ensure we account for the fixed nav height if necessary
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };


  return (
    <>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          {/* 🌲 ENHANCED WORLD-CLASS FOREST ATMOSPHERE */}
          <ForestBackground />

          {/* 🔴 FLOATING NAVBAR */}
          <nav className="floating-nav">
            <div className="nav-links">
              <span onClick={() => scrollTo("dashboard")}>Ecosystem Overview</span>
              <span onClick={() => scrollTo("strategic")}>Strategic Hub</span>
              <span onClick={() => scrollTo("comparative")}>Comparative Matrix</span>
              <span onClick={() => scrollTo("ml")}>Neural Forecast</span>
              <span onClick={() => scrollTo("mortality")}>Mortality Risk</span>
              <span onClick={() => scrollTo("categories")}>Habitat Control</span>
              <span onClick={() => scrollTo("explorer")}>Inventory Archive</span>
            </div>

            {/* Action Center & Global Command Hint */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="nav-shortcut">
                <Keyboard size={14} /> Ctrl + K
              </div>

              <ActionCenter />
              <button 
                onClick={handleLogout}
                style={{
                  background: 'none', border: 'none', color: '#ef4444', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', 
                  padding: '6px', borderRadius: '50%', transition: 'all 0.3s ease',
                  marginLeft: '5px'
                }}
                title="Secure Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </nav>

          {/* 🔴 GLOBAL COMMAND PALETTE */}
          <CommandPalette scrollTo={scrollTo} />

          {/* 🔴 SCROLLING SECTIONS */}
          <div className="scroll-container">
            {/* SECTION 2: DASHBOARD */}
            <motion.section 
              id="dashboard" 
              className="snap-section content-section"
              initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="section-backdrop">
                <Dashboard />
              </div>
            </motion.section>

            {/* SECTION 3: STRATEGIC INTELLIGENCE */}
            <motion.section 
              id="strategic" 
              className="snap-section content-section" 
              style={{ minHeight: '120vh' }}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="section-backdrop">
                <StrategicIntelligence />
              </div>
            </motion.section>

            {/* SECTION 4: COMPARATIVE ANALYSIS */}
            <motion.section 
              id="comparative" 
              className="snap-section content-section"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            >
              <div className="section-backdrop">
                <ComparativeAnalysis />
              </div>
            </motion.section>

            {/* SECTION 5: ML MODEL */}
            <motion.section 
              id="ml" 
              className="snap-section content-section"
              initial={{ opacity: 0, scale: 1.1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 1.2 }}
            >
              <div className="section-backdrop">
                <MLModel />
              </div>
            </motion.section>

            {/* SECTION 6: MORTALITY */}
            <motion.section 
              id="mortality" 
              className="snap-section content-section"
              initial={{ opacity: 0, rotateX: 15 }}
              whileInView={{ opacity: 1, rotateX: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 1 }}
            >
               <div className="section-backdrop">
                <Mortality />
              </div>
            </motion.section>
            
            {/* SECTION 7: CATEGORIES */}
            <motion.section 
              id="categories" 
              className="snap-section content-section"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.8 }}
            >
               <div className="section-backdrop">
                <ZooCategory />
              </div>
            </motion.section>

            {/* SECTION 8: EXPLORER */}
            <motion.section 
              id="explorer" 
              className="snap-section content-section" 
              style={{ minHeight: '100vh', paddingBottom: '100px' }}
              initial={{ opacity: 0, filter: "brightness(0)" }}
              whileInView={{ opacity: 1, filter: "brightness(1)" }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 1.5 }}
            >
               <div className="section-backdrop">
                <DataExplorer />
              </div>
            </motion.section>
          </div>
        </>
      )}
    </>
  );
}

export default App;