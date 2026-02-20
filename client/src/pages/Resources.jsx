import { useState, useEffect } from 'react';
import { gameAPI, resourceAPI } from '../services/api';
import '../styles/App.css';

function Resources() {
  const [resources, setResources] = useState([]);
  const [games, setGames] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    game_id: '',
    name: '',
    conversion_rate: 1,
  });

  useEffect(() => {
    loadGames();
    loadResources();
  }, []);

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
      const response = await resourceAPI.getAll();
      setResources(response.data);
    } catch (error) {
      console.error('加载资源失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResource) {
        await resourceAPI.update(editingResource.id, {
          name: formData.name,
          conversion_rate: formData.conversion_rate,
        });
      } else {
        await resourceAPI.create(formData);
      }
      setShowModal(false);
      setEditingResource(null);
      setFormData({ game_id: '', name: '', conversion_rate: 1 });
      loadResources();
    } catch (error) {
      console.error('保存资源失败:', error);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      game_id: resource.game_id,
      name: resource.name,
      conversion_rate: resource.conversion_rate,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个资源吗？')) {
      try {
        await resourceAPI.delete(id);
        loadResources();
      } catch (error) {
        console.error('删除资源失败:', error);
      }
    }
  };

  return (
    <div className="app">
      <div className="card">
        <div className="card-header">
          <h2>资源管理</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            添加资源
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>游戏</th>
              <th>资源名称</th>
              <th>转换比例</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td>{resource.id}</td>
                <td>{resource.game_name}</td>
                <td>{resource.name}</td>
                <td>{resource.conversion_rate}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEdit(resource)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    编辑
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(resource.id)}
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
            <h3>{editingResource ? '编辑资源' : '添加资源'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>所属游戏</label>
                <select
                  value={formData.game_id}
                  onChange={(e) => setFormData({ ...formData, game_id: e.target.value })}
                  required
                  disabled={!!editingResource}
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
                <label>资源名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>转换比例（多少资源=1抽）</label>
                <input
                  type="number"
                  value={formData.conversion_rate}
                  onChange={(e) => setFormData({ ...formData, conversion_rate: parseInt(e.target.value) })}
                  required
                  min="1"
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
                    setEditingResource(null);
                    setFormData({ game_id: '', name: '', conversion_rate: 1 });
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

export default Resources;