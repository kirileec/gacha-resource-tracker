import { useState, useEffect } from 'react';
import { gameAPI } from '../services/api';
import '../styles/App.css';

function Games() {
  const [games, setGames] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const response = await gameAPI.getAll();
      setGames(response.data);
    } catch (error) {
      console.error('加载游戏失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGame) {
        await gameAPI.update(editingGame.id, formData);
      } else {
        await gameAPI.create(formData);
      }
      setShowModal(false);
      setEditingGame(null);
      setFormData({ name: '' });
      loadGames();
    } catch (error) {
      console.error('保存游戏失败:', error);
    }
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setFormData({ name: game.name });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个游戏吗？删除后所有相关数据也会被删除。')) {
      try {
        await gameAPI.delete(id);
        loadGames();
      } catch (error) {
        console.error('删除游戏失败:', error);
      }
    }
  };

  return (
    <div className="app">
      <div className="card">
        <div className="card-header">
          <h2>游戏管理</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            添加游戏
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>游戏名称</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id}>
                <td>{game.id}</td>
                <td>{game.name}</td>
                <td>{new Date(game.created_at).toLocaleDateString('zh-CN')}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEdit(game)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    编辑
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(game.id)}
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
            <h3>{editingGame ? '编辑游戏' : '添加游戏'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>游戏名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
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
                    setEditingGame(null);
                    setFormData({ name: '' });
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

export default Games;