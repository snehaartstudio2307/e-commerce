import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles, Star } from "lucide-react";
import { addToCart } from "../redux/cartSlice";
import api from "../services/api";
import { toast } from "react-toastify";

function Wishlist() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      await Promise.resolve();
      setLoading(true);
      if (userInfo) {
        // Logged-in: Fetch populated wishlist from backend
        const { data } = await api.get("/products/wishlist/me");
        setWishlistItems(data);
      } else {
        // Guest: Read IDs from localStorage and fetch all products to filter
        const guestWishlistIds = localStorage.getItem("wishlist")
          ? JSON.parse(localStorage.getItem("wishlist"))
          : [];
        
        if (guestWishlistIds.length === 0) {
          setWishlistItems([]);
        } else {
          const { data } = await api.get("/products");
          const filtered = data.filter((p) => guestWishlistIds.includes(p._id));
          setWishlistItems(filtered);
        }
      }
    } catch (err) {
      console.error("Error loading wishlist:", err);
      toast.error("Failed to load wishlist items.");
    } finally {
      setLoading(false);
    }
  }, [userInfo]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchWishlist();
    });
  }, [fetchWishlist]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      if (userInfo) {
        // Authenticated removal
        const { data } = await api.post(`/products/${productId}/wishlist`);
        toast.success(data.message || "Removed from wishlist");
        // Refetch wishlist
        fetchWishlist();
      } else {
        // Guest removal
        let guestWishlist = localStorage.getItem("wishlist")
          ? JSON.parse(localStorage.getItem("wishlist"))
          : [];
        guestWishlist = guestWishlist.filter((id) => id !== productId);
        localStorage.setItem("wishlist", JSON.stringify(guestWishlist));
        setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
        toast.success("Removed from wishlist");
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      toast.error("Failed to remove item.");
    }
  };

  const handleMoveToCart = (product) => {
    if (product.stock === 0) {
      toast.error("Item is out of stock.");
      return;
    }
    dispatch(addToCart({ ...product, qty: 1 }));
    handleRemoveFromWishlist(product._id);
    toast.success("Moved item to shopping cart.");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-8" />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((id) => (
            <div key={id} className="space-y-4">
              <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl aspect-[4/5]" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="pb-6 border-b border-gray-100 dark:border-gray-800 mb-10">
        <span className="text-xs font-bold text-pink-650 dark:text-pink-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Sparkles size={14} /> My Saved Collection
        </span>
        <h1 className="text-3xl font-serif font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Heart size={26} className="text-pink-600 fill-current" />
          Wishlist
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Keep track of items you love and add them to your cart when ready.
        </p>
      </div>

      {/* Grid or Empty state */}
      {wishlistItems.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-pink-50 dark:bg-pink-950/20 rounded-full flex items-center justify-center text-pink-600 dark:text-pink-400 mx-auto mb-6">
            <Heart size={28} className="fill-none" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 px-4 font-normal">
            Browse through Sneha Art Studio's functional resin wall clocks, gilded agate coasters, and luxury abstract canvas collections.
          </p>
          <Link 
            to="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-95 shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300"
          >
            Explore Collections
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlistItems.map((product) => (
            <div 
              key={product._id} 
              className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
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
                </div>

                {/* Wishlist Actions Footer */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="flex items-center justify-center gap-1 py-2 text-xs font-semibold text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="flex items-center justify-center gap-1 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-500 rounded-xl shadow-sm hover:shadow transition-all"
                  >
                    <ShoppingCart size={14} />
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
