import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <h2 className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>🌿 Giza Zoo</h2>
      </div>

      <nav>
        <NavLink to="/app" end>📊 Insights Dashboard</NavLink>
        <NavLink to="/app/explorer">🔍 Data Explorer</NavLink>
        <NavLink to="/app/zoo-category">🏢 Categories</NavLink>
        <NavLink to="/app/mortality">⚠ Mortality & Alerts</NavLink>
        <NavLink to="/app/ml-model">🤖 ML Predictions</NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;