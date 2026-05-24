import { useState } from "react";
import { useDispatch } from "react-redux";
import { X, Sparkles, LogIn, UserPlus } from "lucide-react";
import { setUser } from "../redux/authSlice";
import api from "../services/api";
import { toast } from "react-toastify";

function AuthModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin 
        ? { email: formData.email, password: formData.password } 
        : formData;

      const { data } = await api.post(endpoint, payload);
      dispatch(setUser(data));
      toast.success(isLogin ? "Logged in successfully!" : "Account created successfully!");
      onClose();
    } catch (err) {
      console.error("Auth error:", err);
      toast.error(err.response?.data?.message || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden z-10 transform scale-100 transition-all duration-300">
        
        {/* Top Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-pink-600 dark:text-pink-400 uppercase mb-2">
              <Sparkles size={10} /> Sneha Art Studio Members
            </div>
            <h2 className="text-2xl font-serif font-extrabold text-gray-900 dark:text-white">
              {isLogin ? "Welcome Back" : "Join the Studio"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isLogin ? "Sign in to complete your checkout and payments" : "Register to track purchases and preservation logs"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input (Sign Up Only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Your Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Aditi Sharma" 
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                />
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Email Address</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. aditi@gmail.com" 
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Password</label>
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters" 
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:opacity-95 shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {isLogin ? <LogIn size={14} /> : <UserPlus size={14} />}
              {loading ? "Authenticating..." : isLogin ? "Log In" : "Register"}
            </button>
          </form>

          {/* Toggle form footer */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100 dark:border-gray-800/80 text-xs text-gray-500">
            <span>
              {isLogin ? "New to Sneha Art Studio?" : "Already registered?"}
            </span>{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-pink-600 dark:text-pink-500 hover:underline focus:outline-none"
            >
              {isLogin ? "Create an account" : "Log in here"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AuthModal;
