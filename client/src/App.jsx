import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Games from './pages/Games';
import Resources from './pages/Resources';
import Versions from './pages/Versions';
import Records from './pages/Records';
import Stats from './pages/Stats';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Records />} />
          <Route path="/records" element={<Records />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/games" element={<Games />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/versions" element={<Versions />} />
        </Routes>
      </div>
    </Router>
  );
}

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-main">
        <h1>抽卡资源记录工具</h1>
        <div className="nav-links">
          <Link to="/records" className={`nav-link ${isActive('/records')}`}>
            资源录入
          </Link>
          <Link to="/stats" className={`nav-link ${isActive('/stats')}`}>
            统计图表
          </Link>
          <div className="navbar-menu">
            <button className="btn btn-primary menu-btn" onClick={() => setShowMenu(!showMenu)}>
              设置 ▼
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                <Link to="/games" onClick={() => setShowMenu(false)}>
                  游戏管理
                </Link>
                <Link to="/resources" onClick={() => setShowMenu(false)}>
                  资源管理
                </Link>
                <Link to="/versions" onClick={() => setShowMenu(false)}>
                  版本管理
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default App;