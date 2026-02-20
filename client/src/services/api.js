import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const gameAPI = {
  getAll: () => api.get('/games'),
  getById: (id) => api.get(`/games/${id}`),
  create: (data) => api.post('/games', data),
  update: (id, data) => api.put(`/games/${id}`, data),
  delete: (id) => api.delete(`/games/${id}`),
};

export const resourceAPI = {
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

export const versionAPI = {
  getAll: (params) => api.get('/versions', { params }),
  getById: (id) => api.get(`/versions/${id}`),
  create: (data) => api.post('/versions', data),
  update: (id, data) => api.put(`/versions/${id}`, data),
  delete: (id) => api.delete(`/versions/${id}`),
};

export const recordAPI = {
  getAll: (params) => api.get('/records', { params }),
  getById: (id) => api.get(`/records/${id}`),
  create: (data) => api.post('/records', data),
  update: (id, data) => api.put(`/records/${id}`, data),
  delete: (id) => api.delete(`/records/${id}`),
};

export const statsAPI = {
  getPulls: (gameId, params) => api.get(`/stats/pulls/${gameId}`, { params }),
  getCurrent: (gameId) => api.get(`/stats/current/${gameId}`),
};

export default api;