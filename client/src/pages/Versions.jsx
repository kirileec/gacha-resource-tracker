import { useState, useEffect } from 'react';
import { gameAPI, versionAPI } from '../services/api';
import '../styles/App.css';

function Versions() {
  const [versions, setVersions] = useState([]);
  const [games, setGames] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState(null);
  const [formData, setFormData] = useState({
    game_id: '',
    name: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadGames();
    loadVersions();
  }, []);

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
      const response = await versionAPI.getAll();
      setVersions(response.data);
    } catch (error) {
      console.error('加载版本失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVersion) {
        await versionAPI.update(editingVersion.id, {
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
        });
      } else {
        await versionAPI.create({
          ...formData,
          end_date: formData.end_date || null,
        });
      }
      setShowModal(false);
      setEditingVersion(null);
      setFormData({ game_id: '', name: '', start_date: '', end_date: '' });
      loadVersions();
    } catch (error) {
      console.error('保存版本失败:', error);
    }
  };

  const handleEdit = (version) => {
    setEditingVersion(version);
    setFormData({
      game_id: version.game_id,
      name: version.name,
      start_date: version.start_date,
      end_date: version.end_date || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个版本吗？')) {
      try {
        await versionAPI.delete(id);
        loadVersions();
      } catch (error) {
        console.error('删除版本失败:', error);
      }
    }
  };

  return (
    <div className="app">
      <div className="card">
        <div className="card-header">
          <h2>版本管理</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            添加版本
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>游戏</th>
              <th>版本名称</th>
              <th>开始日期</th>
              <th>结束日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((version) => (
              <tr key={version.id}>
                <td>{version.id}</td>
                <td>{version.game_name}</td>
                <td>{version.name}</td>
                <td>{version.start_date}</td>
                <td>{version.end_date || '-'}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEdit(version)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    编辑
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(version.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingVersion ? '编辑版本' : '添加版本'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>所属游戏</label>
                <select
                  value={formData.game_id}
                  onChange={(e) => setFormData({ ...formData, game_id: e.target.value })}
                  required
                  disabled={!!editingVersion}
                >
                  <option value="">请选择游戏</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>版本名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>开始日期</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>结束日期（可选）</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  保存
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVersion(null);
                    setFormData({ game_id: '', name: '', start_date: '', end_date: '' });
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Versions;