/**
 * Inspiration Controller
 * Handles image inspirations via Unsplash and video inspirations via Pexels
 */

export const getInspirations = async (req, res) => {
  try {
    const type = req.query.type === 'video' ? 'video' : 'image';
    const query = req.query.query ? req.query.query.trim() : '';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = Math.min(40, Math.max(1, parseInt(req.query.per_page, 10) || 30));

    if (type === 'image') {
      return await handleUnsplashImages(req, res, { query, page, perPage });
    } else {
      return await handlePexelsVideos(req, res, { query, page, perPage });
    }
  } catch (error) {
    console.error('Error in getInspirations controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching inspirations',
      error: error.message,
    });
  }
};

/**
 * Proxy download media file to ensure proper attachment headers and bypass browser CORS limits
 */
export const downloadInspiration = async (req, res) => {
  try {
    const { url, filename } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL query parameter is required' });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `Failed to fetch remote media (${response.statusText})`,
      });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const safeFilename = (filename || 'adshub-media').replace(/[^a-zA-Z0-9_.-]/g, '_');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Error in downloadInspiration controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to proxy media download',
      error: error.message,
    });
  }
};

/**
 * Fetch images from Unsplash API
 */
async function handleUnsplashImages(req, res, { query, page, perPage }) {
  const accessKey = process.env.IMAGE_INSPIRATION_API;

  if (!accessKey) {
    return res.status(500).json({
      success: false,
      message: 'Unsplash API key is not configured on the server',
    });
  }

  let endpoint = '';
  if (query) {
    endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
  } else {
    // Default discovery images: curated popular creative photos
    endpoint = `https://api.unsplash.com/photos?page=${page}&per_page=${perPage}&order_by=popular`;
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      'Accept-Version': 'v1',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Unsplash API error response:', response.status, errorText);
    return res.status(response.status).json({
      success: false,
      message: `Failed to fetch images from Unsplash (${response.statusText})`,
      details: errorText,
    });
  }

  const data = await response.json();
  const rawResults = Array.isArray(data) ? data : (data.results || []);
  const total = data.total || rawResults.length;
  const totalPages = data.total_pages || Math.ceil(total / perPage);

  const results = rawResults.map((item) => {
    const width = item.width || 800;
    const height = item.height || 1000;
    return {
      id: String(item.id),
      type: 'image',
      image: item.urls?.regular || item.urls?.small || '',
      thumbnail: item.urls?.small || item.urls?.thumb || '',
      fullImage: item.urls?.full || item.urls?.regular || '',
      width,
      height,
      aspectRatio: Number((width / height).toFixed(3)),
      color: item.color || '#2c2c2c',
      alt: item.alt_description || item.description || 'Inspiration image',
      photographer: item.user?.name || item.user?.username || 'Creator',
      photographerUsername: item.user?.username || '',
      profileUrl: item.user?.links?.html || 'https://unsplash.com',
      avatar: item.user?.profile_image?.medium || item.user?.profile_image?.small || '',
      sourceUrl: item.links?.html || 'https://unsplash.com',
      likes: item.likes || 0,
    };
  });

  return res.status(200).json({
    success: true,
    type: 'image',
    query,
    page,
    perPage,
    total,
    totalPages,
    results,
  });
}

/**
 * Fetch videos from Pexels API
 */
async function handlePexelsVideos(req, res, { query, page, perPage }) {
  const apiKey = process.env.INSPIRATION_VIDEO_API;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: 'Pexels Video API key is not configured on the server',
    });
  }

  let endpoint = '';
  if (query) {
    endpoint = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
  } else {
    // Default discovery videos: popular curated video collection
    endpoint = `https://api.pexels.com/videos/popular?page=${page}&per_page=${perPage}`;
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Pexels API error response:', response.status, errorText);
    return res.status(response.status).json({
      success: false,
      message: `Failed to fetch videos from Pexels (${response.statusText})`,
      details: errorText,
    });
  }

  const data = await response.json();
  const rawVideos = data.videos || [];
  const total = data.total_results || rawVideos.length;
  const totalPages = Math.ceil(total / perPage);

  const results = rawVideos.map((item) => {
    // Pick the most suitable MP4 stream for fast & crisp preview (prefer 720p or SD)
    const files = item.video_files || [];
    const hdMp4 = files.find((f) => f.quality === 'hd' && f.file_type === 'video/mp4' && (f.width <= 1280 || f.height <= 1280));
    const sdMp4 = files.find((f) => f.quality === 'sd' && f.file_type === 'video/mp4');
    const fallbackMp4 = files.find((f) => f.file_type === 'video/mp4') || files[0];
    const bestVideo = hdMp4 || sdMp4 || fallbackMp4;

    const width = item.width || 720;
    const height = item.height || 1280;

    return {
      id: String(item.id),
      type: 'video',
      video: bestVideo?.link || '',
      videoFiles: files,
      thumbnail: item.image || item.video_pictures?.[0]?.picture || '',
      width,
      height,
      aspectRatio: Number((width / height).toFixed(3)),
      duration: item.duration || 0,
      creator: item.user?.name || 'Creator',
      creatorUrl: item.user?.url || 'https://pexels.com',
      sourceUrl: item.url || 'https://pexels.com',
    };
  });

  return res.status(200).json({
    success: true,
    type: 'video',
    query,
    page,
    perPage,
    total,
    totalPages,
    results,
  });
}
