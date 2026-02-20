import { useState, useEffect } from 'react';
import { gameAPI, versionAPI, statsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/App.css';

function Stats() {
  const [games, setGames] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [chartData, setChartData] = useState([]);
  const [currentStats, setCurrentStats] = useState(null);

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    if (selectedGame) {
      loadVersions();
      loadCurrentStats();
    }
  }, [selectedGame]);

  useEffect(() => {
    if (selectedGame) {
      loadChartData();
    }
  }, [selectedGame, selectedVersion, startDate, endDate]);

  const loadGames = async () => {
    try {
      const response = await gameAPI.getAll();
      setGames(response.data);
    } catch (error) {
      console.error('加载游戏失败:', error);
    }
  };

  const loadVersions = async () => {
    try {
      const response = await versionAPI.getAll({ game_id: selectedGame });
      setVersions(response.data);
    } catch (error) {
      console.error('加载版本失败:', error);
    }
  };

  const loadCurrentStats = async () => {
    try {
      const response = await statsAPI.getCurrent(selectedGame);
      setCurrentStats(response.data);
    } catch (error) {
      console.error('加载当前统计失败:', error);
    }
  };

  const loadChartData = async () => {
    try {
      const params = {};
      if (selectedVersion) {
        params.version_id = selectedVersion;
      }
      if (startDate) {
        params.start_date = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
      }
      const response = await statsAPI.getPulls(selectedGame, params);
      setChartData(response.data);
    } catch (error) {
      console.error('加载图表数据失败:', error);
    }
  };

  const handleVersionChange = (e) => {
    const versionId = e.target.value;
    setSelectedVersion(versionId);
    if (versionId) {
      const version = versions.find((v) => v.id === parseInt(versionId));
      if (version) {
        setStartDate(version.start_date);
        setEndDate(version.end_date || '');
      }
    }
  };

  return (
    <div className="app">
      <div className="card">
        <div className="card-header">
          <h2>统计图表</h2>
        </div>
        <div className="form-group">
          <label>选择游戏</label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            style={{ marginBottom: '1rem' }}
          >
            <option value="">请选择游戏</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>
        {selectedGame && (
          <>
            <div className="date-range">
              <div className="form-group">
                <label>开始日期</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>结束日期</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>选择版本（可选，快速设置时间范围）</label>
              <select
                value={selectedVersion}
                onChange={handleVersionChange}
              >
                <option value="">不选择版本</option>
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name} ({version.start_date} - {version.end_date || '至今'})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {currentStats && (
        <div className="stats-card">
          <h3>{currentStats.total_pulls.toFixed(2)}</h3>
          <p>当前总抽数</p>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>抽数变化趋势</h3>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="pulls"
                stroke="#667eea"
                strokeWidth={2}
                name="当前抽数"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Stats;