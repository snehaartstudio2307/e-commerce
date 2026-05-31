import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, User, Search, Sparkles, Sun, Moon, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../context/ThemeContext";
import { logout } from "../redux/authSlice";
import { toast } from "react-toastify";
import { useState, useRef, useEffect } from "react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/75 dark:bg-gray-950/75 backdrop-blur-lg border-b border-gray-100/80 dark:border-gray-900/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
          >
            <Sparkles size={22} className="text-pink-500 animate-pulse" />
            <span className="font-serif">Sneha Art Studio</span>
          </Link>

          {/* Search bar placeholder (aesthetic) */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full w-72 focus-within:border-pink-300 dark:focus-within:border-pink-500 focus-within:bg-white dark:focus-within:bg-gray-950 transition-all">
            <Search size={16} className="text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              placeholder="Search collections..." 
              className="bg-transparent border-none text-xs text-gray-700 dark:text-gray-200 outline-none w-full placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Navigation & Icon Actions */}
          <div className="flex gap-5 sm:gap-6 items-center font-medium text-sm text-gray-600 dark:text-gray-300">
            <Link 
              to="/products"
              className={`hover:text-pink-600 dark:hover:text-pink-500 transition-colors py-2 relative ${
                isActive("/products") ? "text-pink-600 dark:text-pink-500 font-semibold" : ""
              }`}
            >
              Shop Collections
              {isActive("/products") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 dark:bg-pink-500 rounded-full" />
              )}
            </Link>

            {userInfo && userInfo.isAdmin && (
              <Link 
                to="/admin/dashboard"
                className={`hover:text-pink-600 dark:hover:text-pink-500 transition-colors py-2 relative ${
                  isActive("/admin/dashboard") ? "text-pink-600 dark:text-pink-500 font-semibold" : ""
                }`}
              >
                Admin Panel
                {isActive("/admin/dashboard") && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 dark:bg-pink-500 rounded-full" />
                )}
              </Link>
            )}

            {/* Wishlist Link */}
            <Link 
              to="/wishlist" 
              className={`hover:text-pink-600 dark:hover:text-pink-500 hover:scale-105 transition-all p-1.5 rounded-full ${
                isActive("/wishlist") ? "text-pink-600 bg-pink-50 dark:bg-pink-950/40" : "hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
              title="Wishlist"
            >
              <Heart size={20} className={isActive("/wishlist") ? "fill-current" : ""} />
            </Link>

            {/* Cart Link with Badge */}
            <Link 
              to="/cart" 
              className={`relative hover:text-pink-600 dark:hover:text-pink-500 hover:scale-105 transition-all p-1.5 rounded-full ${
                isActive("/cart") ? "text-pink-600 bg-pink-50 dark:bg-pink-950/40" : "hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
              title="Cart"
            >
              <ShoppingCart size={20} />
              {cartItems && cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-950 animate-bounce">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* User Profile / Logout Dropdown */}
            {userInfo ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 hover:text-pink-600 dark:hover:text-pink-500 hover:scale-105 transition-all p-1.5 rounded-full ${
                    dropdownOpen ? "text-pink-600 bg-pink-50 dark:bg-pink-950/40" : "hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
                  title={`Hello, ${userInfo.name}`}
                >
                  {userInfo.avatar ? (
                    <img 
                      src={userInfo.avatar} 
                      alt="" 
                      className="w-5 h-5 rounded-full object-cover border border-pink-100/50 dark:border-pink-900/50 shadow-sm" 
                    />
                  ) : (
                    <User size={20} />
                  )}
                  <span className="hidden lg:inline text-xs font-semibold max-w-[80px] truncate text-left">
                    {userInfo.name.split(" ")[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-850/50 flex items-center gap-2.5">
                      {userInfo.avatar && (
                        <img 
                          src={userInfo.avatar} 
                          alt="" 
                          className="w-8 h-8 rounded-full object-cover border border-pink-200/50 dark:border-pink-900/50 shadow-sm shrink-0" 
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{userInfo.name}</p>
                      </div>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-left block px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all border-b border-gray-50 dark:border-gray-850/50"
                    >
                      My Profile & Orders
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 font-bold transition-all flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                className={`flex items-center gap-2 hover:text-pink-600 dark:hover:text-pink-500 hover:scale-105 transition-all p-1.5 rounded-full ${
                  isActive("/login") ? "text-pink-600 bg-pink-50 dark:bg-pink-950/40" : "hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
                title="Login"
              >
                <User size={20} />
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="hover:text-pink-600 dark:hover:text-pink-500 hover:scale-105 transition-all p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-300"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;