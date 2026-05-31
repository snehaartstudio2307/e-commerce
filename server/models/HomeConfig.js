import mongoose from "mongoose";

const homeConfigSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      default: "Exquisite Resin & Canvas Creations, Crafted to Elevate Your Spaces.",
    },
    heroSubtitle: {
      type: String,
      default: "From glass-like geode wall clocks and gilded crystal coasters to preserving your most precious wedding flowers in crystal-clear resin blocks, every creation is hand-poured with love and premium pigments.",
    },
    heroImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80",
    },
    featuredProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const HomeConfig = mongoose.model("HomeConfig", homeConfigSchema);

export default HomeConfig;
