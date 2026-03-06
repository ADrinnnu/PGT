// src/services/api.js (Add these lines)

export const DriverService = {
  getAll: () => api.get('/drivers'),
  getById: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
  
  // Specific TMS feature: Toggle driver status
  toggleStatus: (id, status) => api.patch(`/drivers/${id}/status`, { status })
};