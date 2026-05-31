import HomeConfig from "../models/HomeConfig.js";

// @desc    Get homepage config
// @route   GET /api/home-config
// @access  Public
export const getHomeConfig = async (req, res) => {
  try {
    let config = await HomeConfig.findOne().populate("featuredProducts");

    if (!config) {
      // Create a default configuration entry if none exists yet
      config = await HomeConfig.create({});
      config = await HomeConfig.findById(config._id).populate("featuredProducts");
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Update homepage config
// @route   PUT /api/home-config
// @access  Private/Admin
export const updateHomeConfig = async (req, res) => {
  try {
    let config = await HomeConfig.findOne();

    if (!config) {
      config = await HomeConfig.create({});
    }

    config.heroTitle = req.body.heroTitle || config.heroTitle;
    config.heroSubtitle = req.body.heroSubtitle || config.heroSubtitle;

    if (req.body.featuredProducts) {
      let products = req.body.featuredProducts;
      if (typeof products === "string") {
        try {
          products = JSON.parse(products);
        } catch (e) {
          console.error("Error parsing featuredProducts:", e);
        }
      }
      config.featuredProducts = Array.isArray(products) ? products : [];
    }

    if (req.file) {
      config.heroImage = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const updatedConfig = await config.save();
    
    // Return populated document so client gets full products arrays
    const populatedConfig = await HomeConfig.findById(updatedConfig._id).populate("featuredProducts");

    res.json(populatedConfig);
  } catch (error) {
    console.error("Error updating home config:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};
