import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

// Attach JWT token from localStorage to headers if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Fetch inspirations (Curated images or videos)
 * @param {Object} params
 * @param {'image' | 'video'} params.type
 * @param {string} [params.query]
 * @param {number} [params.page=1]
 * @param {number} [params.perPage=30]
 */
export async function getInspirations({ type = 'image', query = '', page = 1, perPage = 30 } = {}) {
  const response = await api.get('/api/inspiration', {
    params: {
      type,
      query,
      page,
      per_page: perPage,
    },
  });
  return response.data;
}

/**
 * Get proxy download URL for high-res media
 */
export function getMediaDownloadUrl(mediaUrl, filename = 'adshub-media') {
  return `http://localhost:3000/api/inspiration/download?url=${encodeURIComponent(
    mediaUrl
  )}&filename=${encodeURIComponent(filename)}`;
}

export default {
  getInspirations,
  getMediaDownloadUrl,
};
