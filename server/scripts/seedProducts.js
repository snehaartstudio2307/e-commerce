import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({
  path: path.join(__dirname, "../.env"),
});

const sampleProducts = [
  {
    title: "Deep Ocean Resin Wall Clock",
    description: "A stunning 14-inch circular wall clock featuring multiple layers of premium epoxy resin, depicting realistic ocean waves crashing onto a sandy shore. Made with real sand, shells, and silent quartz movement. Perfect for adding a coastal vibe to your living room or office.",
    price: 3499,
    stock: 5,
    category: "Resin Clocks",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        public_id: "seed_ocean_clock_1"
      }
    ],
    likesCount: 12,
    averageRating: 4.8,
    numReviews: 4,
    reviews: [
      {
        name: "Aarav Sharma",
        rating: 5,
        comment: "Absolutely gorgeous clock! The details on the waves look so real. Silent movement is a big plus.",
        user: new mongoose.Types.ObjectId()
      },
      {
        name: "Priya Patel",
        rating: 4,
        comment: "Beautiful resin piece. The colors are very vibrant. Shipping was fast.",
        user: new mongoose.Types.ObjectId()
      }
    ]
  },
  {
    title: "Rose Quartz Geode Resin Coasters (Set of 4)",
    description: "Handcrafted agate-style resin coasters with gold gilded edges. Infused with rose quartz crystals, high-shine pigments, and fine glitter. Add a touch of luxury to your coffee table. Heat-resistant up to 80°C.",
    price: 1299,
    stock: 12,
    category: "Coasters",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
        public_id: "seed_rose_coasters"
      }
    ],
    likesCount: 24,
    averageRating: 5.0,
    numReviews: 3,
    reviews: [
      {
        name: "Neha Gupta",
        rating: 5,
        comment: "These look even better in real life! The gold edges are perfectly finished. Highly recommend.",
        user: new mongoose.Types.ObjectId()
      }
    ]
  },
  {
    title: "Emerald Forest & Gold Flake Vanity Tray",
    description: "An elegant rectangular vanity tray (12x8 inches) styled with deep emerald green resin, gold leaf accents, and gold brass handles. Ideal for organising perfume bottles, cosmetics, or jewelry.",
    price: 1899,
    stock: 8,
    category: "Trays & Dishes",
    images: [
      {
        url: "https://images.unsplash.com/photo-1579783928621-7a13d66a6211?auto=format&fit=crop&w=600&q=80",
        public_id: "seed_emerald_tray"
      }
    ],
    likesCount: 15,
    averageRating: 4.7,
    numReviews: 6,
    reviews: []
  },
  {
    title: "Cosmic Nebula Abstract Canvas Painting",
    description: "A textured acrylic and resin mixed-media painting on a stretched canvas (18x24 inches). Depicts a cosmic nebula with deep purple, teal, and magenta shades, covered with a crystal-clear glossy resin topcoat for depth.",
    price: 4999,
    stock: 3,
    category: "Canvas Paintings",
    images: [
      {
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
        public_id: "seed_cosmic_canvas"
      }
    ],
    likesCount: 32,
    averageRating: 4.9,
    numReviews: 10,
    reviews: []
  },
  {
    title: "Golden Shoreline Resin Coasters (Set of 6)",
    description: "Bring the beach home with these ocean wave coasters. Created using wood bases, sand, and multi-layered epoxy resin to form realistic foam cells. Gilded with reflective gold leaf borders.",
    price: 1699,
    stock: 15,
    category: "Coasters",
    images: [
      {
        url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
        public_id: "seed_shore_coasters"
      }
    ],
    likesCount: 19,
    averageRating: 4.6,
    numReviews: 5,
    reviews: []
  },
  {
    title: "Enchanted Bloom Bridal Bouquet Preservation Block",
    description: "A solid, high-gloss hexagonal resin block (6x6 inches) preserving real dried flowers. Perfect keepsake example of our custom bridal bouquet preservation service. Note: This item is a replica; custom booking is required.",
    price: 2999,
    stock: 4,
    category: "Custom Preservations",
    images: [
      {
        url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80",
        public_id: "seed_preservation_block"
      }
    ],
    likesCount: 45,
    averageRating: 4.9,
    numReviews: 15,
    reviews: [
      {
        name: "Snehal K.",
        rating: 5,
        comment: "I got my wedding bouquet preserved in this shape, and it looks breath-taking. The resin is crystal clear!",
        user: new mongoose.Types.ObjectId()
      }
    ]
  },
  {
    title: "Turquoise Wave Geode Serving Board",
    description: "A luxury acacia wood cheese board decorated with premium turquoise and white resin ocean waves on the handle and edges. Impress your guests at dinner parties. Treated with food-safe oil.",
    price: 2199,
    stock: 6,
    category: "Trays & Dishes",
    images: [
      {
        url: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=600&q=80",
        public_id: "seed_wood_board"
      }
    ],
    likesCount: 28,
    averageRating: 4.5,
    numReviews: 8,
    reviews: []
  },
  {
    title: "Whispering Winds Abstract Canvas Painting",
    description: "A peaceful minimalist abstract painting (24x24 inches) featuring soft pastel gradients, gold line work, and subtle textures. High-quality acrylics on canvas, finished with a satin varnish.",
    price: 4299,
    stock: 2,
    category: "Canvas Paintings",
    images: [
      {
        url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        public_id: "seed_winds_canvas"
      }
    ],
    likesCount: 14,
    averageRating: 4.8,
    numReviews: 2,
    reviews: []
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";
    console.log(`Connecting to database at ${mongoUri}...`);
    
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB!");

    // Delete existing products
    console.log("Clearing existing products...");
    await Product.deleteMany({});
    
    // Seed new products
    console.log("Seeding sample products...");
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${createdProducts.length} products!`);

    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seedDB();
