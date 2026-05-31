import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  ChevronLeft, 
  Plus, 
  Minus, 
  AlertCircle, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import { addToCart } from "../redux/cartSlice";
import api from "../services/api";
import { toast } from "react-toastify";
import { updateWishlistCache } from "../services/wishlist";

function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product details
  const fetchProduct = useCallback(async () => {
    try {
      await Promise.resolve();
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Product could not be loaded. It may have been removed.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchProduct();
    });
  }, [fetchProduct]);

  // Check wishlist state
  useEffect(() => {
    let active = true;
    const checkWishlist = async () => {
      if (!product) return;
      await Promise.resolve();
      if (!active) return;

      if (userInfo) {
        // Authenticated user wishlist check
        try {
          const { data } = await api.get("/products/wishlist/me");
          if (!active) return;
          const inWishlist = data.some((item) => item._id === product._id);
          setIsWishlisted(inWishlist);
        } catch (err) {
          console.error("Error fetching authenticated wishlist:", err);
        }
      } else {
        // Guest user wishlist check in localStorage
        const guestWishlist = localStorage.getItem("wishlist")
          ? JSON.parse(localStorage.getItem("wishlist"))
          : [];
        setIsWishlisted(guestWishlist.includes(product._id));
      }
    };
    checkWishlist();
    return () => {
      active = false;
    };
  }, [product, userInfo]);

  const handleQtyChange = (val) => {
    if (val < 1) return;
    if (product && val > product.stock) {
      toast.warning(`Only ${product.stock} items left in stock.`);
      return;
    }
    setQty(val);
  };

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    dispatch(addToCart({ ...product, qty }));
    toast.success(`${qty} item(s) added to cart.`);
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    setWishlistLoading(true);
    if (userInfo) {
      // Authenticated user wishlist toggle on server
      try {
        const { data } = await api.post(`/products/${product._id}/wishlist`);
        const updatedWishlist = data.wishlist || [];
        updateWishlistCache(updatedWishlist);
        setIsWishlisted(updatedWishlist.includes(product._id));
        toast.success(data.message);
        window.dispatchEvent(new Event("wishlistUpdate"));
      } catch (err) {
        console.error("Error toggling server wishlist:", err);
        toast.error("Failed to update wishlist on server.");
      } finally {
        setWishlistLoading(false);
      }
    } else {
      // Guest user wishlist toggle in localStorage
      let guestWishlist = localStorage.getItem("wishlist")
        ? JSON.parse(localStorage.getItem("wishlist"))
        : [];
      if (guestWishlist.includes(product._id)) {
        guestWishlist = guestWishlist.filter((x) => x !== product._id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        guestWishlist.push(product._id);
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
      localStorage.setItem("wishlist", JSON.stringify(guestWishlist));
      setWishlistLoading(false);
      window.dispatchEvent(new Event("wishlistUpdate"));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please add a comment.");
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
      fetchProduct(); // Refresh product reviews
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24 mb-8" />
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-6 space-y-4">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-3xl aspect-[4/5] w-full" />
            <div className="flex gap-4">
              <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl w-20" />
              <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl w-20" />
              <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl w-20" />
            </div>
          </div>
          <div className="md:col-span-6 space-y-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-3">Unable to Load Product</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">{error || "Product not found."}</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg">
          <ChevronLeft size={16} /> Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Breadcrumb Navigation */}
      <Link 
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-pink-650 dark:hover:text-pink-500 mb-8 transition-colors"
      >
        <ChevronLeft size={14} /> Back to Art Gallery
      </Link>

      <div className="grid md:grid-cols-12 gap-12">
        
        {/* Left Column - Product Images Gallery */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-[2rem] overflow-hidden aspect-[4/5] relative shadow-sm">
            <img 
              src={product.images?.[selectedImage]?.url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80"} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
            {product.category && (
              <span className="absolute bottom-6 left-6 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-400 bg-pink-50/95 dark:bg-pink-950/80 backdrop-blur-md rounded-full border border-pink-100/50 dark:border-pink-900/50 shadow-sm">
                {product.category}
              </span>
            )}
          </div>
          
          {/* Gallery Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === idx 
                      ? "border-pink-600 shadow-md scale-105" 
                      : "border-gray-100 dark:border-gray-800 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Purchase Form */}
        <div className="md:col-span-6 space-y-6 flex flex-col justify-center">
          
          {/* Header Info */}
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-pink-600 dark:text-pink-400 uppercase mb-2">
              <Sparkles size={10} /> Handcrafted Luxury
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-gray-900 dark:text-white leading-tight">
              {product.title}
            </h1>
            
            {/* Rating summary */}
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, idx) => (
                  <Star 
                    key={idx} 
                    size={16} 
                    className={`${idx < Math.round(product.averageRating) ? "fill-current" : "fill-none"}`} 
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-xs">
                {product.averageRating?.toFixed(1) || "5.0"}
              </span>
              <span>•</span>
              <span className="text-xs hover:underline cursor-pointer">{product.numReviews || 0} customer reviews</span>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="py-4 border-y border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Purchase Price</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₹{product.price?.toLocaleString()}</span>
                <span className="text-xs font-semibold text-pink-600 dark:text-pink-400">INR</span>
              </div>
            </div>

            {/* Stock indicator */}
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Availability</p>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-450 mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  In Stock ({product.stock} left)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 mt-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Creation Notes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
              {product.description}
            </p>
          </div>

          {/* Quantity and Actions Block */}
          {product.stock > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                
                {/* Quantity incrementor */}
                <div className="flex items-center justify-between border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-2.5 sm:w-32 shrink-0">
                  <button 
                    onClick={() => handleQtyChange(qty - 1)}
                    className="text-gray-400 hover:text-pink-600 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{qty}</span>
                  <button 
                    onClick={() => handleQtyChange(qty + 1)}
                    className="text-gray-400 hover:text-pink-600 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-grow flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-sm py-3.5 px-8 rounded-xl hover:opacity-95 shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <ShoppingCart size={18} />
                  Add to Shopping Cart
                </button>

                {/* Wishlist Button */}
                <button
                  disabled={wishlistLoading}
                  onClick={handleToggleWishlist}
                  className={`p-3.5 border rounded-xl flex items-center justify-center transition-all ${
                    isWishlisted 
                      ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-500 hover:scale-105" 
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:text-rose-500 hover:border-rose-250 dark:hover:border-rose-900 hover:scale-105"
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart size={18} className={isWishlisted ? "fill-current" : "fill-none"} />
                </button>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-16">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Side: Submit review form */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={22} className="text-pink-600" />
              Write a Review
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
              Share your thoughts about this artwork's quality, finishing gloss, and design with other collectors.
            </p>
            
            {userInfo ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                
                {/* Rating selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Rating</label>
                  <div className="flex text-amber-400 gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star size={24} className={`${star <= rating ? "fill-current" : "fill-none"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment area */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Review Description</label>
                  <textarea
                    required
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your experience with this purchase..."
                    className="w-full bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/30 rounded-2xl p-5 text-center">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  You must be logged in to leave reviews. 
                </p>
                <Link to="/login" className="mt-3 inline-block text-xs font-semibold text-pink-600 hover:underline">
                  Log in to your account
                </Link>
              </div>
            )}
          </div>

          {/* Right Side: Reviews listing */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
              Patron Reviews ({product.reviews?.length || 0})
            </h2>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {product.reviews.map((rev) => (
                  <div 
                    key={rev._id} 
                    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 p-5 rounded-2xl shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      {/* Name with avatar */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-950/40 text-pink-650 dark:text-pink-400 flex items-center justify-center text-xs font-bold">
                          {rev.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{rev.name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Review Star Rating */}
                      <div className="flex text-amber-400 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={i < rev.rating ? "fill-current" : "fill-none"} 
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed font-normal">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400 text-xs">No reviews have been left for this artwork yet.</p>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}

export default ProductDetails;
