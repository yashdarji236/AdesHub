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

export async function editAdImage({ prompt, projectId, category, image }) {
  const formData = new FormData();
  formData.append('prompt', prompt);
  if (projectId) formData.append('projectId', projectId);
  if (category) formData.append('category', category);
  
  if (image) {
    if (typeof image === 'string' && image.startsWith('data:')) {
      // Convert base64 Data URL to a Blob
      const response = await fetch(image);
      const blob = await response.blob();
      formData.append('image', blob, 'image.jpg');
    } else {
      formData.append('image', image);
    }
  }

  const response = await api.post('/ai/image-to-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function saveImage({ projectId, imageUrl }) {
  const response = await api.post('/ai/save-image', { projectId, imageUrl });
  return response.data;
}

export async function getSavedCharacters() {
  const response = await api.get('/ai/saved-characters');
  return response.data;
}

export async function getProjectImages(projectId) {
  const response = await api.get(`/ai/project-images/${projectId}`);
  return response.data;
}

export default {
  generateAdImage,
  editAdImage,
  saveImage,
  getSavedCharacters,
  getProjectImages,
};
