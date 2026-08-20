import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

// Automatically attach JWT token from localStorage to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function createProject({ projectName, projectCategory }) {
  const response = await api.post('/projects/create', {
    projectName,
    projectCategory,
  });
  return response.data;
}

export async function getUserProjects() {
  const response = await api.get('/projects/get');
  return response.data;
}

export default {
  createProject,
  getUserProjects,
};
