import Ads from '../model/Ads.js';

export const generateAdImage = async (req, res) => {
  try {
    const { prompt, projectId, category } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const apiUrl = process.env.PROMPT_TO_IMAGE_API || 'https://autumn-pond-7565.darjinisarg49.workers.dev/';
    const apiSecret = process.env.PROMPT_TO_IMAGE_API_SECRET || 'my-secret';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        message: `Image generation failed: ${response.statusText}`,
        details: errorText,
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    let imageUrl = '';

    if (contentType.includes('application/json')) {
      const jsonData = await response.json();
      imageUrl = jsonData.imageUrl || jsonData.image || jsonData.url;
    } else {
      const arrayBuf = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const base64 = buffer.toString('base64');
      imageUrl = `data:${contentType};base64,${base64}`;
    }

    if (projectId) {
      try {
        await Ads.findOneAndUpdate(
          { projectId },
          {
            $push: {
              ads: {
                imageUrl,
                prompt: prompt.trim(),
                category: category || 'Poster Ad',
                createdAt: new Date(),
              },
            },
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.warn('Could not save to Ads collection:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      imageUrl,
      prompt: prompt.trim(),
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
