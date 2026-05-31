import { Link } from "react-router-dom";
import { Heart, Star, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../services/api";
import { fetchWishlistCached, updateWishlistCache } from "../services/wishlist";

function ProductCard({ product }) {
  const { userInfo } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const checkWishlist = async () => {
      if (userInfo) {
        const ids = await fetchWishlistCached(userInfo);
        if (active) {
          setIsWishlisted(ids.includes(product._id));
        }
      } else {
        const guestWishlist = localStorage.getItem("wishlist")
          ? JSON.parse(localStorage.getItem("wishlist"))
          : [];
        if (active) {
          setIsWishlisted(guestWishlist.includes(product._id));
        }
      }
    };
    checkWishlist();
    return () => {
      active = false;
    };
  }, [product._id, userInfo]);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistLoading) return;
    setWishlistLoading(true);

    if (userInfo) {
      try {
        const { data } = await api.post(`/products/${product._id}/wishlist`);
        const updatedWishlist = data.wishlist || [];
        updateWishlistCache(updatedWishlist);
        setIsWishlisted(updatedWishlist.includes(product._id));
        toast.success(data.message);
        window.dispatchEvent(new Event("wishlistUpdate"));
      } catch (err) {
        console.error("Error toggling wishlist:", err);
        toast.error("Failed to update wishlist.");
      } finally {
        setWishlistLoading(false);
      }
    } else {
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

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Wishlist Button */}
      <button 
        onClick={handleToggleWishlist}
        disabled={wishlistLoading}
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 dark:bg-gray-950/80 border border-white/50 dark:border-gray-800/50 hover:scale-110 shadow-sm transition-all duration-300 ${
          isWishlisted 
            ? "text-rose-500 hover:bg-white dark:hover:bg-gray-950" 
            : "text-gray-400 dark:text-gray-500 hover:text-rose-500 hover:bg-white dark:hover:bg-gray-950"
        }`}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart 
          size={18} 
          className={isWishlisted ? "fill-rose-500 text-rose-500" : "fill-none"} 
        />
      </button>

      {/* Product Image */}
      <div className="relative overflow-hidden aspect-[4/5] bg-gray-50 dark:bg-gray-950">
        <Link to={`/products/${product._id}`} className="block h-full">
          <img
            src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80"}
            alt={product.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>
        
        {/* Category Tag */}
        {product.category && (
          <span className="absolute bottom-4 left-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-400 bg-pink-50/90 dark:bg-pink-950/80 rounded-full border border-pink-100/50 dark:border-pink-900/50 shadow-sm">
            {product.category}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
          Handmade Resin Art
        </span>
        
        <Link to={`/products/${product._id}`} className="hover:text-pink-600 dark:hover:text-pink-500 transition-colors duration-200">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-base leading-snug line-clamp-2 h-[2.5rem] mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Rating and Price */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">₹{product.price.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">INR</span>
            </div>
            
            {/* Star Rating */}
            <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-500 font-semibold">
              <div className="flex text-amber-400">
                <Star size={12} className="fill-current" />
              </div>
              <span>{product.averageRating?.toFixed(1) || "5.0"}</span>
              <span className="text-gray-400 dark:text-gray-500 font-normal">({product.numReviews || 0})</span>
            </div>
          </div>

          <Link 
            to={`/products/${product._id}`} 
            className="flex items-center justify-center p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 hover:bg-pink-600 dark:hover:bg-pink-500 hover:text-white transition-all duration-300 group-hover:translate-x-0"
          >
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;