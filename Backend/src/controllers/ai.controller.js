import Ads from '../model/Ads.js';
import Project from '../model/Project.js';

const API_URL = process.env.PROMPT_TO_IMAGE_API || 'https://autumn-pond-7565.darjinisarg49.workers.dev/';
const API_SECRET = process.env.PROMPT_TO_IMAGE_API_SECRET || 'my-secret';

export const generateAdImage = async (req, res) => {
  try {
    const { prompt, projectId, category = 'Poster Ad' } = req.body || {};
    const cleanPrompt = prompt?.trim();

    if (!cleanPrompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    console.log('Sending Text-to-Image request to:', API_URL);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: cleanPrompt }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error(`Worker API failed with status ${response.status} (${response.statusText}):`, details);
      return res.status(response.status).json({
        success: false,
        message: `Image generation failed: ${response.statusText}`,
        details,
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageUrl = contentType.includes('application/json')
      ? (await response.json()).imageUrl
      : `data:${contentType};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`;

    if (projectId) {
      await Ads.findOneAndUpdate(
        { projectId },
        { $push: { ads: { imageUrl, prompt: cleanPrompt, category, createdAt: new Date() } } },
        { upsert: true }
      );
    }

    return res.status(200).json({
      success: true,
      imageUrl,
      prompt: cleanPrompt,
    });
  } catch (error) {
    console.error('Error in generateAdImage:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while generating image',
      error: error.message,
    });
  }
};

export const editAdImage = async (req, res) => {
  try {
    const { prompt, projectId, category = 'Poster Ad', image } = req.body || {};
    const cleanPrompt = prompt?.trim();

    if (!cleanPrompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Determine reference image. Support either req.file (binary file upload) or req.body.image (base64 string)
    let referenceImage = null;
    let mimeType = 'image/jpeg';
    if (req.file) {
      referenceImage = req.file.buffer;
      mimeType = req.file.mimetype || 'image/jpeg';
    } else if (image) {
      let data = image;
      if (image.startsWith('data:')) {
        const match = image.match(/data:([^;]+);base64,(.*)/);
        if (match) {
          mimeType = match[1];
          data = match[2];
        }
      }
      referenceImage = Buffer.from(data, 'base64');
    }

    if (!referenceImage) {
      return res.status(400).json({ success: false, message: 'Image is required for Image-to-Image editing' });
    }

    const blob = new Blob([referenceImage], { type: mimeType });
    const formData = new FormData();
    formData.append('prompt', cleanPrompt);
    formData.append('image', blob, 'image.jpg');

    const targetUrl = process.env.IMAGE_TO_IMAGE || 'https://dry-tooth-3280.yashdarji5237.workers.dev/';
    console.log('Sending Image-to-Image request (FormData) to:', targetUrl);
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_SECRET}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const details = await response.text();
      console.error(`Worker API failed with status ${response.status} (${response.statusText}):`, details);
      return res.status(response.status).json({
        success: false,
        message: `Image generation failed: ${response.statusText}`,
        details,
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageUrl = contentType.includes('application/json')
      ? (await response.json()).imageUrl
      : `data:${contentType};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`;

    if (projectId) {
      await Ads.findOneAndUpdate(
        { projectId },
        { $push: { ads: { imageUrl, prompt: cleanPrompt, category, createdAt: new Date() } } },
        { upsert: true }
      );
    }

    return res.status(200).json({
      success: true,
      imageUrl,
      prompt: cleanPrompt,
    });
  } catch (error) {
    console.error('Error in editAdImage:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while generating image',
      error: error.message,
    });
  }
};

export const saveImage = async (req, res) => {
  try {
    const { projectId, imageUrl } = req.body || {};

    if (!projectId || !imageUrl) {
      return res.status(400).json({ success: false, message: 'projectId and imageUrl are required' });
    }

    let adsDoc = await Ads.findOne({ projectId });
    if (!adsDoc) {
      adsDoc = new Ads({ projectId, ads: [] });
    }

    let imageFound = false;
    adsDoc.ads = adsDoc.ads.map((ad) => {
      if (ad.imageUrl === imageUrl) {
        imageFound = true;
        return { ...ad, saved: true };
      }
      return ad;
    });

    if (!imageFound) {
      // Create new ad listing if it wasn't recorded (e.g., initial local template preview)
      adsDoc.ads.push({
        imageUrl,
        prompt: 'Saved concept reference',
        category: 'Character',
        createdAt: new Date(),
        saved: true
      });
    }

    adsDoc.markModified('ads');
    await adsDoc.save();

    return res.status(200).json({ success: true, message: 'Image saved successfully' });
  } catch (error) {
    console.error('Error in saveImage:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving image',
      error: error.message,
    });
  }
};

export const getSavedCharacters = async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await Project.find({ userId });
    const projectIds = projects.map(p => p._id);

    const adsDocs = await Ads.find({ projectId: { $in: projectIds } });

    const savedImages = [];
    adsDocs.forEach(doc => {
      const proj = projects.find(p => p._id.toString() === doc.projectId.toString());
      if (doc.ads && Array.isArray(doc.ads)) {
        doc.ads.forEach(ad => {
          if (ad.saved) {
            savedImages.push({
              id: `${doc._id}-${ad.imageUrl.substring(ad.imageUrl.length - 15)}`,
              imageUrl: ad.imageUrl,
              prompt: ad.prompt || 'Concept Artwork',
              category: ad.category || (proj ? proj.projectCategory : 'Character'),
              projectId: doc.projectId,
              projectName: proj ? proj.projectName : 'Untitled Character',
              createdAt: ad.createdAt || doc.createdAt
            });
          }
        });
      }
    });

    savedImages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ success: true, savedImages });
  } catch (error) {
    console.error('Error in getSavedCharacters:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching saved characters',
      error: error.message,
    });
  }
};

export const getProjectImages = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'projectId is required' });
    }

    const adsDoc = await Ads.findOne({ projectId });
    if (!adsDoc || !adsDoc.ads || adsDoc.ads.length === 0) {
      return res.status(200).json({ success: true, ads: [] });
    }

    return res.status(200).json({ success: true, ads: adsDoc.ads });
  } catch (error) {
    console.error('Error in getProjectImages:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching project images',
      error: error.message,
    });
  }
};
