import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { 
  Sparkles, 
  Clock, 
  Flower, 
  Layers, 
  Gem, 
  Palette, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Gift, 
  Star,
  ChevronRight,
  CheckCircle
} from "lucide-react";
import { toast } from "react-toastify";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Sneha Art Studio | Handcrafted Resin & Canvas Art";
  }, []);
  const [homeConfig, setHomeConfig] = useState({
    heroTitle: "Exquisite Resin & Canvas Creations, Crafted to Elevate Your Spaces.",
    heroSubtitle: "From glass-like geode wall clocks and gilded crystal coasters to preserving your most precious wedding flowers in crystal-clear resin blocks, every creation is hand-poured with love and premium pigments.",
    heroImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80"
  });
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "Wedding",
    eventDate: "",
    details: ""
  });

  // Fetch home config and featured products
  useEffect(() => {
    const fetchHomeConfigAndProducts = async () => {
      try {
        setLoading(true);
        const { data: config } = await api.get("/home-config");
        if (config) {
          setHomeConfig({
            heroTitle: config.heroTitle || "Exquisite Resin & Canvas Creations, Crafted to Elevate Your Spaces.",
            heroSubtitle: config.heroSubtitle || "From glass-like geode wall clocks and gilded crystal coasters to preserving your most precious wedding flowers in crystal-clear resin blocks, every creation is hand-poured with love and premium pigments.",
            heroImage: config.heroImage || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80"
          });
          
          if (config.featuredProducts && config.featuredProducts.length > 0) {
            setFeaturedProducts(config.featuredProducts);
          } else {
            const { data: prods } = await api.get("/products");
            setFeaturedProducts(prods.slice(0, 4));
          }
        }
      } catch (error) {
        console.error("Error fetching home config:", error);
        try {
          const { data: prods } = await api.get("/products");
          setFeaturedProducts(prods.slice(0, 4));
        } catch (err) {
          console.error("Error fetching fallback products:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHomeConfigAndProducts();
  }, []);

  const renderHeroTitle = () => {
    const title = homeConfig.heroTitle;
    const commaIndex = title.lastIndexOf(",");
    if (commaIndex !== -1) {
      const part1 = title.substring(0, commaIndex + 1);
      const part2 = title.substring(commaIndex + 1);
      return (
        <>
          {part1}{" "}
          <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
            {part2}
          </span>
        </>
      );
    }
    return title;
  };

  const handleInquiryChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySubmitted(true);
    toast.success("Thank you! Your custom preservation request has been received. Sneha will contact you shortly.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      eventType: "Wedding",
      eventDate: "",
      details: ""
    });
  };

  // Category list with icons and image backgrounds
  const categories = [
    {
      name: "Resin Clocks",
      description: "Functional luxury clocks with silent quartz mechanisms.",
      bgImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      icon: <Clock className="text-pink-600" size={20} />,
      link: "/products?category=Resin Clocks"
    },
    {
      name: "Coasters",
      description: "Agate and geode resin sets finished with gilded gold edges.",
      bgImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
      icon: <Gem className="text-amber-600" size={20} />,
      link: "/products?category=Coasters"
    },
    {
      name: "Trays & Dishes",
      description: "High-gloss vanity trays with elegant brass hardware handles.",
      bgImage: "https://images.unsplash.com/photo-1579783928621-7a13d66a6211?auto=format&fit=crop&w=600&q=80",
      icon: <Layers className="text-purple-600" size={20} />,
      link: "/products?category=Trays & Dishes"
    },
    {
      name: "Canvas Paintings",
      description: "Abstract acrylic fluid paintings topped with crystal-clear resin.",
      bgImage: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
      icon: <Palette className="text-emerald-600" size={20} />,
      link: "/products?category=Canvas Paintings"
    },
    {
      name: "Custom Preservations",
      description: "Everlasting preservation of wedding and ceremonial flowers in resin.",
      bgImage: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80",
      icon: <Flower className="text-rose-600" size={20} />,
      link: "/products?category=Custom Preservations"
    }
  ];

  const testimonials = [
    {
      name: "Anjali Rao",
      role: "Bridal Client",
      quote: "Sneha preserved my wedding varmala flowers in a hexagonal resin block, and it's absolute magic. It sits on our entryway table and gets compliments from every visitor! The detail is incredible.",
      rating: 5
    },
    {
      name: "Vikram Malhotra",
      role: "Homeowner",
      quote: "Bought the Deep Ocean Geode Wall Clock. The wave details, cell structures, and high-gloss shine are remarkable. A real centerpiece of art that also happens to tell time.",
      rating: 5
    },
    {
      name: "Riya Sen",
      role: "Gifting Client",
      quote: "The Rose Quartz coasters were the perfect housewarming gift for my sister. They arrived beautifully packaged with personalized care instructions.",
      rating: 5
    }
  ];

  return (
    <div className="overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-tr from-pink-50 via-rose-50/30 to-amber-50/50 dark:from-pink-950/20 dark:via-rose-950/10 dark:to-amber-950/10 py-20 px-4 sm:px-6 lg:px-8">
        
        {/* Background decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100/60 dark:bg-pink-950/40 backdrop-blur-md rounded-full text-pink-700 dark:text-pink-400 text-xs font-semibold tracking-wider uppercase border border-pink-200/40 dark:border-pink-900/40">
              <Sparkles size={12} className="animate-spin" />
              <span>100% Handcrafted Luxury Art</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              {renderHeroTitle()}
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {homeConfig.heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Link
                to="/products"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-95 shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                Shop Current Collection
                <ArrowRight size={18} />
              </Link>
              <a
                href="#preservation-section"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold px-8 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                Book Floral Preservation
              </a>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200/60 dark:border-gray-800/60 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-pink-600">500+</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Custom Pieces Poured</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-pink-600">4.9★</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Client Rating</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-pink-600">100%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Unique Craftsmanship</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Media */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 transform hover:scale-[1.02] transition-all duration-500">
              <img 
                src={homeConfig.heroImage} 
                alt="Sneha Resin Art Painting in Progress"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-8">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl w-full border border-white/50 dark:border-gray-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wide">Featured Artwork</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Whispering Winds Abstract</p>
                  </div>
                  <Link to="/products" className="p-2 bg-pink-600 rounded-lg text-white hover:bg-pink-500">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Small decorative frame */}
            <div className="absolute -bottom-6 -left-6 hidden md:block w-36 h-36 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl rotate-6 transform hover:rotate-0 hover:scale-110 transition-all duration-300">
              <img 
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80" 
                alt="Agate Coaster Detail" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
        </div>
      </section>

      {/* 2. CATEGORY SHOWCASE */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">Handcrafted Categories</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-900 dark:text-white mt-2">Explore Our Collections</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
            Browse through unique items crafted for home decor, gifting, and custom flower preservation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((cat, idx) => (
            <Link 
              key={idx}
              to={cat.link}
              className="group relative h-[360px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-end p-5 bg-gray-900 border border-gray-100 dark:border-gray-800"
            >
              {/* Image backdrop */}
              <img 
                src={cat.bgImage} 
                alt={cat.name} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
              
              {/* Floating Icon */}
              <div className="relative z-10 p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/50 dark:border-gray-800">
                {cat.icon}
              </div>

              {/* Title & Description */}
              <div className="relative z-10 text-white">
                <h3 className="font-serif font-bold text-lg group-hover:text-pink-300 transition-colors flex items-center gap-1.5">
                  {cat.name}
                  <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-[11px] text-gray-300 mt-1 line-clamp-2 font-light leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="py-20 bg-white dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">New Pours</span>
              <h2 className="text-3xl font-serif font-extrabold text-gray-900 dark:text-white mt-2">Featured Artworks</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Explore the latest, unique additions freshly polished and ready for your home.
              </p>
            </div>
            
            <Link 
              to="/products" 
              className="group flex items-center gap-2 text-pink-600 dark:text-pink-500 font-semibold text-sm hover:text-pink-700 transition-colors shrink-0"
            >
              View Full Gallery
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Product Loader/Display */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((id) => (
                <div key={id} className="animate-pulse space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl aspect-[4/5]" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400 font-medium">Art collections are currently loading or database is empty.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fadeIn">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 4. VALUE STATEMENT / WHY CHOOSE US */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">Our Studio Philosophy</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-900 dark:text-white mt-2">Beautifully Crafting Moments</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
            Every layer of resin takes up to 24 hours to cure. We believe in taking time to create perfect, high-gloss, crystal-clear art pieces.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow text-center">
            <div className="mx-auto w-12 h-12 bg-pink-50 dark:bg-pink-950/40 rounded-xl flex items-center justify-center text-pink-600 dark:text-pink-400 mb-5">
              <Sparkles size={24} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">Premium Materials</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
              We exclusively use non-yellowing, VOC-free, high-grade artist resin and vivid luxury pigments for a liquid glass-like finish.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow text-center">
            <div className="mx-auto w-12 h-12 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5">
              <Gift size={24} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">Custom Handcrafting</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
              No two resin pours are ever the same. You are purchasing a completely unique, one-of-a-kind art piece crafted exclusively for you.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-450 mb-5">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">Perfect Preservation</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
              Specialized multi-step drying techniques that preserve the natural shape and color of bridal varmala or wedding flowers.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow text-center">
            <div className="mx-auto w-12 h-12 bg-purple-50 dark:bg-purple-950/40 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-405 mb-5">
              <Truck size={24} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">Secure Nationwide Shipping</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
              All fragile art pieces are double-boxed in high-impact resistant sheets to guarantee safe transit to your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE COMMISSION & PRESERVATION BOOKING */}
      <section id="preservation-section" className="py-24 bg-gradient-to-tr from-pink-50/50 via-white to-amber-50/40 dark:from-pink-950/10 dark:via-gray-950 dark:to-amber-950/10 border-t border-gray-100 dark:border-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Form Description */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100/60 dark:bg-pink-950/40 rounded-full text-pink-700 dark:text-pink-400 text-xs font-semibold uppercase tracking-wider">
              <Flower size={12} />
              <span>Floral Preservation & Custom Commissions</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-900 dark:text-white leading-tight">
              Preserve Your Precious Flowers & Moments Forever
            </h2>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
              Don't let your beautiful wedding bouquet, varmala, or milestone flowers wither away. Our customized preservation process locks their beauty in solid, crystal-clear archival-grade resin blocks.
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
              Whether you want a geometric bookend, a large block, decorative tea lights, or custom geode tables, fill out the form. We will contact you with shipping instructions for your fresh or dried flowers.
            </p>

            {/* Checklist */}
            <ul className="space-y-3 pt-3">
              {[
                "Archival preservation process to maintain colors.",
                "Custom geometric shapes (Hexagon, Arch, Cube, Heart).",
                "Includes complimentary digital preview layout before casting.",
                "Secure flower courier pickup guidelines provided."
              ].map((item, index) => (
                <li key={index} className="flex gap-3 items-center text-xs font-semibold text-gray-700 dark:text-gray-200">
                  <span className="w-5 h-5 bg-pink-100 dark:bg-pink-950/40 rounded-full flex items-center justify-center text-pink-600 dark:text-pink-400 text-[10px]">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The Form Card */}
          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden min-h-[400px] flex flex-col justify-center">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500" />
              
              {inquirySubmitted ? (
                <div className="text-center py-8 space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center text-emerald-650 dark:text-emerald-400 mx-auto mb-4 border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle size={28} className="animate-bounce" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white">Inquiry Received!</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto font-normal">
                    Thank you! Your custom preservation request has been received. Sneha will contact you shortly to review your event details.
                  </p>
                  <button
                    onClick={() => setInquirySubmitted(false)}
                    className="inline-block text-xs font-bold text-pink-600 dark:text-pink-500 hover:underline pt-4"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white mb-6">
                    Submit a Preservation Inquiry
                  </h3>
                                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Your Name</label>
                        <input 
                          type="text" 
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInquiryChange}
                          placeholder="e.g. Aditi Sharma" 
                          className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInquiryChange}
                          placeholder="e.g. aditi@gmail.com" 
                          className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Phone Number</label>
                        <input 
                          type="tel" 
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInquiryChange}
                          placeholder="e.g. +91 9876543210" 
                          className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Preservation Type</label>
                        <select 
                          name="eventType"
                          value={formData.eventType}
                          onChange={handleInquiryChange}
                          className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                        >
                          <option value="Wedding">Wedding Varmala / Bouquet</option>
                          <option value="Engagement">Engagement Flowers</option>
                          <option value="Memorial">Memorial Flowers</option>
                          <option value="Anniversary">Anniversary Bouquet</option>
                          <option value="Custom Table">Custom Resin Art / Geode Clock</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Event / Delivery Date</label>
                      <input 
                        type="date" 
                        name="eventDate"
                        required
                        value={formData.eventDate}
                        onChange={handleInquiryChange}
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Request Details / Floral Layout Ideas</label>
                      <textarea 
                        name="details"
                        rows="3"
                        value={formData.details}
                        onChange={handleInquiryChange}
                        placeholder="Describe what flowers you have, shapes you are interested in (hexagon, cube, bookends), or custom color themes..." 
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:opacity-95 shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Send Inquiry Request
                      <ChevronRight size={14} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">Client Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-900 dark:text-white mt-2">What Art Lovers Say</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
            Read comments from patrons who have collected our resin work or trusted us with special flower preservation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <div key={index} className="p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm relative flex flex-col justify-between">
              <div>
                {/* Stars */}
                <div className="flex text-amber-400 gap-0.5 mb-5">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-current" />
                  ))}
                </div>
                <p className="text-sm italic text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                  "{test.quote}"
                </p>
              </div>

              {/* Author */}
              <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center font-bold text-sm">
                  {test.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{test.name}</h4>
                  <p className="text-[11px] text-pink-600 dark:text-pink-400 font-medium">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;