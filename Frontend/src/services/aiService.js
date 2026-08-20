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

export async function generateAdImage({ prompt, projectId, category }) {
  const response = await api.post('/ai/generate-image', {
    prompt,
    projectId,
    category,
  });
  return response.data;
}

export default {
  generateAdImage,
};
