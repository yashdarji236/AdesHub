import Project from '../model/Project.js';
import Ads from '../model/Ads.js';

// Create a new project and initialize its Ads document
export const createProject = async (req, res) => {
  try {
    const { projectName, projectCategory } = req.body;

    if (!projectName || !projectCategory) {
      return res.status(400).json({
        success: false,
        message: 'Project name and category are required.',
      });
    }

    // Normalize category to match schema enum
    let normalizedCategory = projectCategory;
    const lower = projectCategory.toLowerCase();
    if (lower.includes('poster')) normalizedCategory = 'Poster Ad';
    else if (lower.includes('meme')) normalizedCategory = 'Meme Ad';
    else if (lower.includes('brand')) normalizedCategory = 'Brand Ad';
    else if (lower.includes('character')) normalizedCategory = 'Character';

    // 1. Create Project document linked to logged-in user
    const project = await Project.create({
      userId: req.user.id,
      projectName: projectName.trim(),
      projectCategory: normalizedCategory,
    });

    // 2. Create corresponding Ads document linked to Project
    const ads = await Ads.create({
      projectId: project._id,
      ads: [],
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project,
      ads,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project.',
      error: error.message,
    });
  }
};

// Get all projects for the logged-in user
export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();

    // Fetch corresponding Ads for each project to retrieve the latest generated thumbnail
    const projectsWithAds = await Promise.all(
      projects.map(async (project) => {
        const adsDoc = await Ads.findOne({ projectId: project._id }).lean();
        const latestImage = adsDoc?.ads && adsDoc.ads.length > 0
          ? adsDoc.ads[adsDoc.ads.length - 1].imageUrl
          : null;
        return {
          ...project,
          thumbnailUrl: latestImage,
        };
      })
    );

    return res.json({
      success: true,
      projects: projectsWithAds,
    });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects.',
      error: error.message,
    });
  }
};
