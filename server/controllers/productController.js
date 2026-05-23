import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, stock, category } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Upload at least one image",
      });
    }

    const uploadedImages = req.files.map((file) => ({
      url: `http://localhost:5000/uploads/${file.filename}`,
      public_id: file.filename,
    }));

    const product = await Product.create({
      title,
      description,
      price,
      stock,
      category,
      images: uploadedImages,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;

    const filter = {};

    if (keyword) {
      filter.title = {
        $regex: keyword,
        $options: "i",
      };
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.title = req.body.title || product.title;
    product.description =
      req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.stock = req.body.stock || product.stock;
    product.category = req.body.category || product.category;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: `http://localhost:5000/uploads/${file.filename}`,
        public_id: file.filename,
      }));

      product.images = newImages;
    }

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const toggleWishlist = async (req, res) => {
  try {
    const user = req.user;
    const productId = req.params.id;

    const alreadyLiked = user.wishlist.includes(productId);

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (alreadyLiked) {
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId
      );

      product.likesCount = Math.max(0, product.likesCount - 1);
    } else {
      user.wishlist.push(productId);
      product.likesCount += 1;
    }

    await user.save();
    await product.save();

    res.json({
      message: alreadyLiked
        ? "Removed from wishlist"
        : "Added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const alreadyReviewed = product.reviews.find(
      (review) =>
        review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You already reviewed this product",
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.averageRating =
      product.reviews.reduce(
        (acc, item) => acc + item.rating,
        0
      ) / product.reviews.length;

    await product.save();

    res.status(201).json({
      message: "Review added",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const getWishlist = async (req, res) => {
  try {
    const user = await req.user.populate("wishlist");

    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};