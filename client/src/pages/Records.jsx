import { useState, useEffect } from 'react';
import { gameAPI, resourceAPI, versionAPI, recordAPI, statsAPI } from '../services/api';
import '../styles/App.css';

function Records() {
  const [records, setRecords] = useState([]);
  const [games, setGames] = useState([]);
  const [resources, setResources] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    game_id: '',
    version_id: '',
    record_date: new Date().toISOString().split('T')[0],
    垫数: 0,
    values: [],
  });

  useEffect(() => {
    loadGames();
    const savedGameId = localStorage.getItem('selectedGameId');
    if (savedGameId) {
      setSelectedGame(savedGameId);
    }
  }, []);

  useEffect(() => {
    if (selectedGame) {
      localStorage.setItem('selectedGameId', selectedGame);
      loadResources();
      loadVersions();
      loadRecords();
    }
  }, [selectedGame]);

  const loadGames = async () => {
    try {
      const response = await gameAPI.getAll();
      setGames(response.data);
    } catch (error) {
      console.error('加载游戏失败:', error);
    }
  };

  const loadResources = async () => {
    try {
      const response = await resourceAPI.getAll({ game_id: selectedGame });
      setResources(response.data);
    } catch (error) {
      console.error('加载资源失败:', error);
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

  const loadRecords = async () => {
    try {
      const response = await recordAPI.getAll({ game_id: selectedGame });
      setRecords(response.data);
    } catch (error) {
      console.error('加载记录失败:', error);
    }
  };

  const handleGameChange = (e) => {
    const gameId = e.target.value;
    setSelectedGame(gameId);
    setFormData({
      game_id: gameId,
      version_id: '',
      record_date: new Date().toISOString().split('T')[0],
      垫数: 0,
      values: [],
    });
  };

  const handleAddRecord = async () => {
    if (!selectedGame) {
      alert('请先选择游戏');
      return;
    }
    setEditingRecord(null);
    setViewingRecord(null);
    
    let defaultValues = [];
    let default垫数 = 0;
    
    if (records.length > 0) {
      try {
        const response = await recordAPI.getById(records[0].id);
        defaultValues = response.data.values || [];
        default垫数 = response.data.垫数 || 0;
      } catch (error) {
        console.error('获取上一条记录失败:', error);
      }
    }
    
    setFormData({
      game_id: selectedGame,
      version_id: versions.length > 0 ? versions[0].id : '',
      record_date: new Date().toISOString().split('T')[0],
      垫数: default垫数,
      values: defaultValues,
    });
    setShowModal(true);
  };

  const handleViewRecord = async (record) => {
    try {
      const response = await recordAPI.getById(record.id);
      setViewingRecord(response.data);
      setEditingRecord(null);
      setFormData({
        game_id: response.data.game_id,
        version_id: response.data.version_id || '',
        record_date: response.data.record_date,
        垫数: response.data.垫数 || 0,
        values: response.data.values || [],
      });
      setShowModal(true);
    } catch (error) {
      console.error('加载记录详情失败:', error);
    }
  };

  const handleEditRecord = async (record) => {
    try {
      const response = await recordAPI.getById(record.id);
      setEditingRecord(response.data);
      setViewingRecord(null);
      setFormData({
        game_id: response.data.game_id,
        version_id: response.data.version_id || '',
        record_date: response.data.record_date,
        垫数: response.data.垫数 || 0,
        values: response.data.values || [],
      });
      setShowModal(true);
    } catch (error) {
      console.error('加载记录详情失败:', error);
    }
  };

  const handleResourceValueChange = (resourceId, value) => {
    setFormData((prev) => {
      const existingIndex = prev.values.findIndex((v) => v.resource_id === resourceId);
      const newValues = [...prev.values];
      if (existingIndex >= 0) {
        newValues[existingIndex] = { resource_id: resourceId, amount: parseInt(value) || 0 };
      } else {
        newValues.push({ resource_id: resourceId, amount: parseInt(value) || 0 });
      }
      return { ...prev, values: newValues };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await recordAPI.update(editingRecord.id, formData);
      } else {
        await recordAPI.create(formData);
      }
      setShowModal(false);
      setViewingRecord(null);
      setEditingRecord(null);
      setFormData({
        game_id: selectedGame,
        version_id: versions.length > 0 ? versions[0].id : '',
        record_date: new Date().toISOString().split('T')[0],
        垫数: 0,
        values: [],
      });
      loadRecords();
    } catch (error) {
      console.error('保存记录失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        await recordAPI.delete(id);
        loadRecords();
      } catch (error) {
        console.error('删除记录失败:', error);
      }
    }
  };

  const calculateTotalPulls = (record) => {
    let total = record.垫数 || 0;
    if (record.values && record.values.length > 0) {
      record.values.forEach((v) => {
        const rate = v.conversion_rate || 1;
        total += (v.amount || 0) / rate;
      });
    }
    return total;
  };

  return (
    <div className="app">
      <div className="card">
        <div className="card-header">
          <h2>资源录入</h2>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              value={selectedGame}
              onChange={handleGameChange}
              style={{ minWidth: '200px' }}
            >
              <option value="">请选择游戏</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {selectedGame && (
          <>
            <button className="btn btn-primary" onClick={handleAddRecord}>
              添加记录
            </button>
            <table className="table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>版本</th>
                  <th>垫池抽数</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.record_date}</td>
                    <td>{record.version_name || '-'}</td>
                    <td>{record.垫数 || 0}</td>
                    <td>
                      <button
                        className="btn btn-success"
                        onClick={() => handleViewRecord(record)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        查看
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditRecord(record)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        编辑
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(record.id)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingRecord ? '编辑记录' : viewingRecord ? '查看记录' : '添加记录'}</h3>
            {viewingRecord && (
              <div className="stats-card" style={{ marginBottom: '1rem' }}>
                <h4>{calculateTotalPulls(viewingRecord).toFixed(2)}</h4>
                <p>总抽数</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>日期</label>
                <input
                  type="date"
                  value={formData.record_date}
                  onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
                  required
                  disabled={viewingRecord}
                />
              </div>
              <div className="form-group">
                <label>版本（可选）</label>
                <select
                  value={formData.version_id}
                  onChange={(e) => setFormData({ ...formData, version_id: e.target.value })}
                  disabled={viewingRecord}
                >
                  <option value="">不选择版本</option>
                  {versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.name} ({version.start_date})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>垫池抽数</label>
                <input
                  type="number"
                  value={formData.垫数}
                  onChange={(e) => setFormData({ ...formData, 垫数: parseInt(e.target.value) || 0 })}
                  min="0"
                  disabled={viewingRecord}
                />
              </div>
              <div className="form-group">
                <label>资源数量</label>
                {resources.map((resource) => (
                  <div key={resource.id} className="resource-item">
                    <label style={{ flex: 1 }}>
                      {resource.name} ({resource.conversion_rate}=1抽)
                    </label>
                    <input
                      type="number"
                      placeholder={`输入${resource.name}数量`}
                      value={
                        formData.values.find((v) => v.resource_id === resource.id)?.amount || ''
                      }
                      onChange={(e) =>
                        handleResourceValueChange(resource.id, e.target.value)
                      }
                      min="0"
                      disabled={viewingRecord}
                    />
                  </div>
                ))}
              </div>
              {!viewingRecord && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary">
                    保存
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      setShowModal(false);
                      setViewingRecord(null);
                      setEditingRecord(null);
                    }}
                  >
                    取消
                  </button>
                </div>
              )}
              {viewingRecord && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      setShowModal(false);
                      setViewingRecord(null);
                      setEditingRecord(null);
                    }}
                  >
                    关闭
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Records;