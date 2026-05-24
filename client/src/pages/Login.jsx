import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Sparkles, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { setUser } from "../redux/authSlice";
import api from "../services/api";
import { toast } from "react-toastify";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo } = useSelector((state) => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  // Redirect source path if any, or default to home
  const redirectPath = new URLSearchParams(location.search).get("redirect") || "/";

  // Redirect if already logged in
  useEffect(() => {
    if (userInfo) {
      navigate(redirectPath);
    }
  }, [userInfo, navigate, redirectPath]);

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
      navigate(redirectPath);
    } catch (err) {
      console.error("Login page error:", err);
      toast.error(err.response?.data?.message || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Return home link */}
      <div className="mx-auto w-full max-w-md mb-6">
        <Link 
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-pink-650 dark:hover:text-pink-500 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Studio Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Card wrapper */}
        <div className="bg-white dark:bg-gray-900 py-8 px-6 sm:px-10 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl relative overflow-hidden">
          
          {/* Top Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500" />

          {/* Title Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-pink-600 dark:text-pink-400 uppercase mb-2">
              <Sparkles size={10} /> Sneha Art Studio
            </div>
            <h2 className="text-3xl font-serif font-extrabold text-gray-900 dark:text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-405 mt-1 leading-relaxed">
              {isLogin 
                ? "Sign in to access your order logs, cart pre-fills, and saved wishlists" 
                : "Sign up as a studio collector to log flower preservation projects"}
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
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-205 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
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
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-205 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
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
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-205 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:opacity-95 shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {isLogin ? <LogIn size={14} /> : <UserPlus size={14} />}
              {loading ? "Authenticating..." : isLogin ? "Sign In" : "Sign Up"}
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
              {isLogin ? "Create an account" : "Sign in here"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
