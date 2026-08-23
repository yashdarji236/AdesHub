import Ads from '../model/Ads.js';

const API_URL = process.env.PROMPT_TO_IMAGE_API || 'https://autumn-pond-7565.darjinisarg49.workers.dev/';
const API_SECRET = process.env.PROMPT_TO_IMAGE_API_SECRET || 'my-secret';

export const generateAdImage = async (req, res) => {
  try {
    const { prompt, projectId, category = 'Poster Ad' } = req.body;
    const cleanPrompt = prompt?.trim();

    if (!cleanPrompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // 1. Fetch generated image from AI service
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
      return res.status(response.status).json({
        success: false,
        message: `Image generation failed: ${response.statusText}`,
        details,
      });
    }

    // 2. Convert response to base64 Data URL or extract URL from JSON
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageUrl = contentType.includes('application/json')
      ? (await response.json()).imageUrl
      : `data:${contentType};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`;

    // 3. Save ad to project if projectId exists
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

