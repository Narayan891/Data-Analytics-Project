import React, { useState } from 'react';
import axios from 'axios';
import { Zap, Play, RotateCcw, TrendingUp, TrendingDown, Biohazard } from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import './NeuralSimulation.css';

const NeuralSimulation = () => {
  const [mortalityMul, setMortalityMul] = useState(1.0);
  const [birthMul, setBirthMul] = useState(1.0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${apiUrl}/simulate-ecosystem`, {
        mortality_multiplier: mortalityMul,
        birth_multiplier: birthMul
      });
      setResults(res.data);
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const resetSim = () => {
    setMortalityMul(1.0);
    setBirthMul(1.0);
    setResults([]);
  };

  return (
    <div className="neural-sim-container">
      <div className="sim-header">
        <div className="sim-title">
          <Zap className="sim-icon" />
          <h2>Ecosystem Neural Simulator</h2>
        </div>
        <p className="sim-subtitle">
          A predictive "What-If" engine utilizing **Random Forest Regressors** to project 
          how changes in mortality stress and breeding success ripple through the zoo inventory.
        </p>
      </div>

      <div className="sim-layout">
        {/* Sidebar: Controls & Model Knowledge */}
        <div className="sim-sidebar">
          <div className="sim-controls card-glass">
            <h3 className="section-title">Variable Matrix</h3>
            
            <div className="control-group">
              <div className="label-row">
                <span className="tooltip-trigger" title="Simulates environmental stress factors (disease, climate, etc.)">Mortality Stress</span>
                <span className={`value ${mortalityMul > 1 ? 'danger' : 'safe'}`}>{mortalityMul.toFixed(1)}x</span>
              </div>
              <input 
                type="range" min="1.0" max="3.0" step="0.1" 
                value={mortalityMul} 
                onChange={(e) => setMortalityMul(parseFloat(e.target.value))}
              />
              <div className="hint">1.0x = Baseline | 3.0x = Extreme Crisis</div>
            </div>

            <div className="control-group">
              <div className="label-row">
                <span className="tooltip-trigger" title="Simulates breeding program efficiency and recruitment success">Proliferation Index</span>
                <span className={`value ${birthMul > 1 ? 'safe' : 'warn'}`}>{birthMul.toFixed(1)}x</span>
              </div>
              <input 
                type="range" min="0.5" max="2.0" step="0.1" 
                value={birthMul} 
                onChange={(e) => setBirthMul(parseFloat(e.target.value))}
              />
              <div className="hint">0.5x = Stagnant | 2.0x = Accelerated Growth</div>
            </div>

            <div className="btn-group">
              <button className="btn-run" onClick={runSimulation} disabled={loading}>
                {loading ? 'Neural Processing...' : <><Play size={16} /> Ignite Simulation</>}
              </button>
              <button className="btn-reset" onClick={resetSim}>
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>

          <div className="knowledge-base card-glass">
            <h4><Zap size={14} className="accent-text" /> Neural Knowledge Base</h4>
            <div className="kb-content">
              <div className="kb-item">
                <div className="kb-label">Intelligence Model</div>
                <div className="kb-val">Random Forest Ensembled Regressor</div>
              </div>
              <div className="kb-item">
                <div className="kb-label">Dataset</div>
                <div className="kb-val">Live Zoo Inventory Transactions</div>
              </div>
              <p className="kb-description">
                The simulator projects inventory balances by calculating the weighted delta between 
                mortality risk and birth success across all species categories.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content: Chart & Narrative */}
        <div className="sim-main-content">
          <div className="sim-insights card-glass">
            {results.length > 0 ? (
              <div className="results-view">
                <div className="view-header">
                  <h3>Projected Population Variance</h3>
                  <div className="chart-legend-custom">
                     <span className="legend-item"><i className="dot baseline" /> Baseline (Today)</span>
                     <span className="legend-item"><i className="dot simulated" /> Simulated (Projected)</span>
                  </div>
                </div>

                <div className="chart-container" style={{ height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="species_name" 
                        stroke="rgba(255,255,255,0.4)" 
                        fontSize={11} 
                        tick={false}
                        label={{ value: 'Species Identified', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.4)' }}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.4)" 
                        fontSize={11}
                        label={{ value: 'Total Count', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)' }}
                      />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="closing_balance_total" name="Baseline" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="simulated_closing" name="Simulated" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="simulation-narrative">
                  <div className="impact-indicator">
                    <Biohazard size={24} className="icon-pulse" />
                    <div className="metric">
                      <span className="label">Total Predicted Population Shift</span>
                      <span className="value">
                        {((results.reduce((a,b)=>a+b.simulated_closing,0) / results.reduce((a,b)=>a+b.closing_balance_total,0) - 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="narrative-description">
                    {results.reduce((a,b)=>a+b.simulated_closing,0) < results.reduce((a,b)=>a+b.closing_balance_total,0) ? (
                      <p><TrendingDown className="inline-icon decay" size={18} /> <strong>ECOSYSTEM DECAY DETECTED:</strong> The current stressors significantly outweigh breeding capacity. **Strategic Intervention Required** to prevent population bottlenecks in critical categories.</p>
                    ) : (
                      <p><TrendingUp className="inline-icon growth" size={18} /> <strong>SUSTAINABLE EQUILIBRIUM:</strong> The neural matrix projects a healthy recovery and expansion phase. Current recruitment efforts are sufficient to offset simulated stress factors.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-sim">
                <TrendingUp size={64} className="placeholder-icon" />
                <h3>Simulation Standby</h3>
                <p>Configure the Variable Matrix in the sidebar and ignite the simulation to generate neural inventory projections.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralSimulation;
