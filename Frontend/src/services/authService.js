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

export async function register({ firstName, lastName, email, password, username }) {
  const response = await api.post('/api/auth/register', {
    firstName,
    lastName,
    username,
    email,
    password,
  });
  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
}

export async function getMe() {
  const response = await api.get('/api/auth/get-me');
  return response.data;
}

export default {
  register,
  login,
  getMe,
};
