import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  ShoppingBag, 
  Users, 
  Coins, 
  Sliders, 
  Eye, 
  X, 
  ShieldAlert, 
  Calendar,
  CreditCard,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Image,
  Package,
  Upload
} from "lucide-react";
import api from "../../services/api";
import { toast } from "react-toastify";

function Dashboard() {
  const { userInfo } = useSelector((state) => state.auth);

  // States
  const [activeAdminTab, setActiveAdminTab] = useState("orders");
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Product Catalog States
  const [productsList, setProductsList] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "Resin Clocks",
    images: [] // file objects
  });
  const [currentProductImages, setCurrentProductImages] = useState([]);

  // Invoice Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Homepage Control States
  const [homeConfig, setHomeConfig] = useState({
    heroTitle: "",
    heroSubtitle: "",
    heroImage: ""
  });
  const [selectedFeaturedProducts, setSelectedFeaturedProducts] = useState([]);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState("");
  const [homeConfigLoading, setHomeConfigLoading] = useState(false);

  // Fetch admin dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      await Promise.resolve();
      setStatsLoading(true);
      const { data } = await api.get("/orders/admin/dashboard/stats");
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast.error("Failed to load dashboard metrics.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    try {
      await Promise.resolve();
      setLoading(true);
      const { data } = await api.get("/orders/admin/all");
      setOrders(data);
    } catch (err) {
      console.error("Error fetching admin orders:", err);
      toast.error("Failed to load customer orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all products
  const fetchProductsList = useCallback(async () => {
    try {
      await Promise.resolve();
      setProductsLoading(true);
      const { data } = await api.get("/products");
      setProductsList(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load product catalog.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Fetch homepage curation config
  const fetchHomeConfig = useCallback(async () => {
    try {
      await Promise.resolve();
      const { data } = await api.get("/home-config");
      if (data) {
        setHomeConfig({
          heroTitle: data.heroTitle || "",
          heroSubtitle: data.heroSubtitle || "",
          heroImage: data.heroImage || ""
        });
        setHeroImagePreview(data.heroImage || "");
        setSelectedFeaturedProducts(
          data.featuredProducts ? data.featuredProducts.map((p) => p._id || p) : []
        );
      }
    } catch (err) {
      console.error("Error fetching homepage settings:", err);
      toast.error("Failed to load homepage settings.");
    }
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      Promise.resolve().then(() => {
        fetchStats();
        fetchOrders();
        fetchProductsList();
        fetchHomeConfig();
      });
    }
  }, [userInfo, fetchStats, fetchOrders, fetchProductsList, fetchHomeConfig]);

  const toggleFeaturedProduct = (prodId) => {
    if (selectedFeaturedProducts.includes(prodId)) {
      setSelectedFeaturedProducts(selectedFeaturedProducts.filter((id) => id !== prodId));
    } else {
      setSelectedFeaturedProducts([...selectedFeaturedProducts, prodId]);
    }
  };

  const handleHomeConfigSubmit = async (e) => {
    e.preventDefault();
    setHomeConfigLoading(true);
    try {
      const formData = new FormData();
      formData.append("heroTitle", homeConfig.heroTitle);
      formData.append("heroSubtitle", homeConfig.heroSubtitle);
      formData.append("featuredProducts", JSON.stringify(selectedFeaturedProducts));
      
      if (heroImageFile) {
        formData.append("heroImage", heroImageFile);
      }

      const { data } = await api.put("/home-config", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Homepage layout settings updated successfully!");
      if (data) {
        setHomeConfig({
          heroTitle: data.heroTitle || "",
          heroSubtitle: data.heroSubtitle || "",
          heroImage: data.heroImage || ""
        });
        setHeroImagePreview(data.heroImage || "");
        setSelectedFeaturedProducts(
          data.featuredProducts ? data.featuredProducts.map((p) => p._id || p) : []
        );
      }
      setHeroImageFile(null);
    } catch (err) {
      console.error("Error saving homepage settings:", err);
      toast.error(err.response?.data?.message || "Failed to update homepage settings.");
    } finally {
      setHomeConfigLoading(false);
    }
  };

  // Product CRUD Action Handlers
  const handleProductDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted successfully.");
      fetchProductsList();
      fetchStats();
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Failed to delete product.");
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", productForm.title);
      formData.append("description", productForm.description);
      formData.append("price", productForm.price);
      formData.append("stock", productForm.stock);
      formData.append("category", productForm.category);
      if (productForm.images && productForm.images.length > 0) {
        for (const file of productForm.images) {
          formData.append("images", file);
        }
      }

      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Product updated successfully.");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("New product created successfully.");
      }

      setProductModalOpen(false);
      fetchProductsList();
      fetchStats();
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error(err.response?.data?.message || "Failed to save product.");
    } finally {
      setProductsLoading(false);
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      title: "",
      description: "",
      price: "",
      stock: "",
      category: "Resin Clocks",
      images: []
    });
    setCurrentProductImages([]);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProductId(prod._id);
    setProductForm({
      title: prod.title,
      description: prod.description,
      price: prod.price,
      stock: prod.stock,
      category: prod.category || "Resin Clocks",
      images: []
    });
    setCurrentProductImages(prod.images || []);
    setProductModalOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/admin/${orderId}/status`, { orderStatus: newStatus });
      toast.success("Order fulfillment status updated.");
      // Update local state list
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      fetchStats(); // Recalculate revenue if needed
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // 1. ROUTE GUARD (CHECK ADMIN ROLE)
  if (!userInfo || !userInfo.isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-450 mx-auto mb-6 border border-rose-100 dark:border-rose-900/40 shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 px-4 leading-relaxed font-normal">
          This portal is restricted to authorized studio administrators. Please log in with an administrator account to continue.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/login" className="bg-pink-650 hover:bg-pink-600 text-white font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-all">
            Log In As Admin
          </Link>
          <Link to="/" className="border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all">
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      
      {/* Header */}
      <div className="pb-6 border-b border-gray-100 dark:border-gray-800 mb-10">
        <span className="text-xs font-bold text-pink-650 dark:text-pink-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Sparkles size={14} /> Studio Operations
        </span>
        <h1 className="text-3xl font-serif font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Sliders size={26} className="text-pink-650" />
          Admin Operations Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Monitor studio metrics, track customer payments, and manage shipping fulfillment stages.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-gray-100 dark:border-gray-800 pb-5 mb-8">
        <button
          onClick={() => setActiveAdminTab("orders")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeAdminTab === "orders"
              ? "bg-pink-600 text-white shadow-md shadow-pink-500/10"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
        >
          <Sliders size={14} />
          Fulfillment Orders
        </button>

        <button
          onClick={() => setActiveAdminTab("products")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeAdminTab === "products"
              ? "bg-pink-600 text-white shadow-md shadow-pink-500/10"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
        >
          <Package size={14} />
          Product Catalog Management
        </button>

        <button
          onClick={() => setActiveAdminTab("homepage")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeAdminTab === "homepage"
              ? "bg-pink-600 text-white shadow-md shadow-pink-500/10"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
        >
          <Sparkles size={14} />
          Homepage Control
        </button>
      </div>

      {activeAdminTab === "orders" && (
        <>
          {/* 2. ANALYTICS METRICS WIDGETS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Metric 1: Total Revenue */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-pink-500" />
              <div className="p-3 bg-pink-50 dark:bg-pink-950/20 text-pink-650 dark:text-pink-400 rounded-2xl">
                <Coins size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Sales Revenue</p>
                {statsLoading ? (
                  <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-20 mt-1 animate-pulse" />
                ) : (
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                    ₹{stats?.totalRevenue?.toLocaleString() || "0"}
                  </p>
                )}
              </div>
            </div>

            {/* Metric 2: Total Orders */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-605 dark:text-amber-400 rounded-2xl">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Fulfillment Orders</p>
                {statsLoading ? (
                  <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-16 mt-1 animate-pulse" />
                ) : (
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{stats?.totalOrders || "0"}</p>
                )}
              </div>
            </div>

            {/* Metric 3: Total Products */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500" />
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-405 rounded-2xl">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Artworks</p>
                {statsLoading ? (
                  <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-16 mt-1 animate-pulse" />
                ) : (
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{stats?.totalProducts || "0"}</p>
                )}
              </div>
            </div>

            {/* Metric 4: Total Users */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-purple-500" />
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-2xl">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Registered Collectors</p>
                {statsLoading ? (
                  <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-16 mt-1 animate-pulse" />
                ) : (
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{stats?.totalUsers || "0"}</p>
                )}
              </div>
            </div>
          </div>

          {/* 3. ORDERS FULFILLMENT LIST TABLE */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-6 shadow-sm space-y-6 overflow-hidden">
            <h2 className="text-xl font-serif font-extrabold text-gray-900 dark:text-white px-2">Fulfillment Orders Tracker</h2>
            
            {loading ? (
              <div className="py-24 text-center flex flex-col items-center">
                <Loader2 className="animate-spin text-pink-650 mb-3" size={32} />
                <p className="text-xs text-gray-500 dark:text-gray-400">Fetching order database records...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center bg-gray-50 dark:bg-gray-950 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 m-2">
                <p className="text-gray-500 dark:text-gray-400 text-xs">No orders found in the database system yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">
                      <th className="py-4 px-4">Order Reference</th>
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4">Collector</th>
                      <th className="py-4 px-4 text-right">Paid Amount</th>
                      <th className="py-4 px-4 text-center">Payment</th>
                      <th className="py-4 px-4">Fulfillment Status</th>
                      <th className="py-4 px-4 text-center">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60 text-gray-700 dark:text-gray-300 font-medium">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/40 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-gray-900 dark:text-white max-w-[120px] truncate">{order._id}</td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{order.user?.name || "Guest Collector"}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">{order.user?.email || "n/a"}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-extrabold text-gray-900 dark:text-white whitespace-nowrap">
                          ₹{order.totalPrice?.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.paymentStatus === "Paid" 
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30" 
                              : order.paymentStatus === "Failed"
                              ? "bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-900/30"
                              : "bg-amber-50 dark:bg-amber-950/20 text-amber-605 border border-amber-105/30"
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {updatingId === order._id ? (
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Loader2 size={12} className="animate-spin text-pink-650" />
                              <span>Updating...</span>
                            </div>
                          ) : (
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 focus:outline-none focus:border-pink-500 font-semibold cursor-pointer text-xs"
                            >
                              <option value="Placed">Placed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setModalOpen(true);
                            }}
                            className="p-1.5 border border-gray-100 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-900 hover:text-pink-650 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 text-gray-400 dark:text-gray-500 rounded-lg transition-all focus:outline-none"
                            title="View Invoice Details"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* 3. PRODUCT CATALOG MANAGEMENT VIEW */}
      {activeAdminTab === "products" && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-6 shadow-sm space-y-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
            <div>
              <h2 className="text-xl font-serif font-extrabold text-gray-900 dark:text-white">Studio Product Catalog</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage and curate your handcrafted resin clocks, coasters, trays, and paintings.</p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-650 to-rose-500 hover:from-pink-600 hover:to-rose-450 text-white font-semibold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>

          {productsLoading ? (
            <div className="py-24 text-center flex flex-col items-center">
              <Loader2 className="animate-spin text-pink-650 mb-3" size={32} />
              <p className="text-xs text-gray-500 dark:text-gray-400">Fetching product database records...</p>
            </div>
          ) : productsList.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 dark:bg-gray-950 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 m-2">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">No products found in the database system yet.</p>
              <button
                onClick={handleOpenAddProduct}
                className="inline-flex items-center gap-1.5 text-xs text-pink-650 dark:text-pink-400 hover:underline font-bold"
              >
                Create your first product artwork <Plus size={12} />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">
                    <th className="py-4 px-4">Artwork Image</th>
                    <th className="py-4 px-4">Title & Category</th>
                    <th className="py-4 px-4 text-right">Price</th>
                    <th className="py-4 px-4 text-center">Stock Availability</th>
                    <th className="py-4 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60 text-gray-700 dark:text-gray-300 font-medium">
                  {productsList.map((prod) => (
                    <tr key={prod._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/40 transition-colors">
                      {/* Product Thumbnail */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="w-14 h-14 bg-gray-50 dark:bg-gray-950 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                          <img
                            src={prod.images?.[0]?.url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=150&q=80"}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Title & Category */}
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{prod.title}</p>
                          <span className="inline-block px-2.5 py-0.5 mt-1 text-[10px] font-semibold text-pink-700 dark:text-pink-400 bg-pink-50/80 dark:bg-pink-950/40 rounded-full border border-pink-100/30 dark:border-pink-900/30">
                            {prod.category}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 text-right font-extrabold text-gray-900 dark:text-white whitespace-nowrap text-sm">
                        ₹{prod.price?.toLocaleString()}
                      </td>

                      {/* Stock availability */}
                      <td className="py-4 px-4 text-center">
                        {prod.stock > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-450 border border-emerald-100/30 dark:border-emerald-900/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            In Stock ({prod.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100/30 dark:border-rose-900/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Out of Stock
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-center font-semibold">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-2 border border-gray-100 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-900 hover:text-pink-650 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 text-gray-400 dark:text-gray-500 rounded-xl transition-all focus:outline-none"
                            title="Edit Product Details"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleProductDelete(prod._id)}
                            className="p-2 border border-gray-100 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-900 hover:text-red-650 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-gray-400 dark:text-gray-500 rounded-xl transition-all focus:outline-none"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. HOMEPAGE CONFIGURATION SETTINGS VIEW */}
      {activeAdminTab === "homepage" && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-6 shadow-sm space-y-6 overflow-hidden">
          <div>
            <h2 className="text-xl font-serif font-extrabold text-gray-900 dark:text-white px-2">Homepage Layout Curation</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">Update the hero text and select which creations to showcase as top featured products on the homepage.</p>
          </div>

          <form onSubmit={handleHomeConfigSubmit} className="space-y-6 max-w-4xl px-2">
            {/* Grid for hero title and image */}
            <div className="grid md:grid-cols-12 gap-6 items-start">
              
              {/* Text Fields (Left Column) */}
              <div className="md:col-span-7 space-y-4 text-xs font-semibold">
                {/* Hero Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Hero Headline</label>
                  <input
                    type="text"
                    required
                    value={homeConfig.heroTitle}
                    onChange={(e) => setHomeConfig({ ...homeConfig, heroTitle: e.target.value })}
                    placeholder="e.g. Exquisite Resin & Canvas Creations, Crafted to Elevate Your Spaces."
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-semibold"
                  />
                </div>

                {/* Hero Subtitle */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Hero Subheading Description</label>
                  <textarea
                    required
                    rows="4"
                    value={homeConfig.heroSubtitle}
                    onChange={(e) => setHomeConfig({ ...homeConfig, heroSubtitle: e.target.value })}
                    placeholder="Describe the studio creation philosophy..."
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Banner Image Uploader (Right Column) */}
              <div className="md:col-span-5 space-y-4 text-xs font-semibold">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <Image size={12} className="text-pink-655" /> Hero Visual Image
                  </label>
                  
                  {heroImagePreview && (
                    <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 shadow-sm">
                      <img src={heroImagePreview} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-950 hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-colors px-4 text-center">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-1" />
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                          {heroImageFile ? heroImageFile.name : "Click to upload banner image"}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setHeroImageFile(file);
                            setHeroImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Product Picker */}
            <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div>
                <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Featured Creations Showcase</label>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Toggle checkmarks to feature specific artworks on the homepage (typically curate up to 4 items). Selected: <strong>{selectedFeaturedProducts.length}</strong></p>
              </div>

              {productsLoading ? (
                <div className="py-12 flex flex-col items-center">
                  <Loader2 className="animate-spin text-pink-655 mb-2" size={24} />
                  <p className="text-xs text-gray-500">Loading catalog artworks...</p>
                </div>
              ) : productsList.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-4">No products available in the catalog to curate.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-2 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl bg-gray-50/30 dark:bg-gray-950/20">
                  {productsList.map((prod) => {
                    const isChecked = selectedFeaturedProducts.includes(prod._id);
                    return (
                      <button
                        type="button"
                        key={prod._id}
                        onClick={() => toggleFeaturedProduct(prod._id)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] ${
                          isChecked 
                            ? "bg-pink-50/50 dark:bg-pink-955/15 border-pink-300 dark:border-pink-900 shadow-sm" 
                            : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800 bg-gray-100">
                          <img src={prod.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 text-[10px] font-semibold flex-grow">
                          <p className="text-gray-900 dark:text-white truncate" title={prod.title}>{prod.title}</p>
                          <p className="text-gray-400 dark:text-gray-500 mt-0.5">₹{prod.price?.toLocaleString()}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                          isChecked 
                            ? "bg-pink-655 border-pink-655 text-white" 
                            : "border-gray-300 dark:border-gray-700 text-transparent"
                        }`}>
                          ✓
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={homeConfigLoading}
                className="bg-gradient-to-r from-pink-650 to-rose-500 hover:from-pink-600 hover:to-rose-450 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                {homeConfigLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Saving Settings...
                  </>
                ) : (
                  "Save Homepage Settings"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. DETAILED INVOICE MODAL POPUP */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          {/* Card container */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-2xl z-10 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Top accent border */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-6">
              <div>
                <h3 className="text-lg font-serif font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                  Order Invoice details
                </h3>
                <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mt-0.5">Reference: {selectedOrder._id}</p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable invoice details */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              
              {/* Row 1: Dates & Billing info */}
              <div className="grid sm:grid-cols-2 gap-6 bg-gray-50/50 dark:bg-gray-950/30 p-5 border border-gray-100 dark:border-gray-800/60 rounded-2xl text-xs space-y-4 sm:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[9px]">
                    <Calendar size={12} /> Date Placed
                  </div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[9px]">
                    <CreditCard size={12} /> Payment Particulars
                  </div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">Method: {selectedOrder.paymentMethod || "COD"}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5 font-normal">Status: <strong className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedOrder.paymentStatus}</strong></p>
                  {selectedOrder.razorpayPaymentId && (
                    <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 font-normal">Txn ID: {selectedOrder.razorpayPaymentId}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Customer Shipping Address */}
              <div className="text-xs space-y-2">
                <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[9px] block">Shipping Destination Address</span>
                <div className="bg-gray-50/50 dark:bg-gray-950/30 border border-gray-100 dark:border-gray-800/60 rounded-2xl leading-relaxed text-gray-700 dark:text-gray-300 font-normal">
                  <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.shippingAddress?.fullName}</p>
                  <p>House / Flat: {selectedOrder.shippingAddress?.house}</p>
                  <p>Area / Locality: {selectedOrder.shippingAddress?.area}</p>
                  <p>City & State: {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - <strong className="font-semibold">{selectedOrder.shippingAddress?.pincode}</strong></p>
                  {selectedOrder.shippingAddress?.landmark && <p>Landmark: {selectedOrder.shippingAddress?.landmark}</p>}
                  <p className="mt-2 text-gray-900 dark:text-white font-semibold">Phone Contact: {selectedOrder.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Row 3: Product Items List */}
              <div className="space-y-3">
                <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[9px] block">Items in Order ({selectedOrder.items?.length || 0})</span>
                <div className="space-y-2.5">
                  {selectedOrder.items?.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-3 border border-gray-100 dark:border-gray-800 rounded-xl"
                    >
                      {/* Product thumbnail */}
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-950 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>

                      {/* Title details */}
                      <div className="flex-grow text-xs font-semibold">
                        <h4 className="text-gray-900 dark:text-white line-clamp-1">{item.title}</h4>
                        <p className="text-gray-400 dark:text-gray-500 font-normal mt-0.5">₹{item.price?.toLocaleString()} x {item.quantity}</p>
                      </div>

                      {/* Price subtotal */}
                      <span className="text-xs font-extrabold text-gray-950 dark:text-white text-right">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Totals Invoice cost summary */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 text-xs font-semibold text-gray-600 dark:text-gray-300 space-y-2.5 max-w-xs ml-auto">
                <div className="flex justify-between font-normal text-gray-400 dark:text-gray-500">
                  <span>Cart Subtotal</span>
                  <span>₹{selectedOrder.totalPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-normal text-gray-400 dark:text-gray-500">
                  <span>Est. GST (18%)</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between font-normal text-gray-400 dark:text-gray-500">
                  <span>Courier delivery fee</span>
                  <span className="text-emerald-650 font-bold uppercase text-[10px]">Free Shipping</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white">
                  <span className="font-bold text-sm">Amount Paid</span>
                  <span className="text-lg font-extrabold">₹{selectedOrder.totalPrice?.toLocaleString()} INR</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 5. PRODUCT ADD/EDIT MODAL POPUP */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setProductModalOpen(false)} />
          
          {/* Card container */}
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-2xl z-10 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Top accent border */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-6">
              <div>
                <h3 className="text-lg font-serif font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                  {editingProductId ? "Edit Artwork Details" : "Create New Artwork"}
                </h3>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {editingProductId ? `Artwork ID: ${editingProductId}` : "Add a new masterpiece to the studio catalog"}
                </p>
              </div>
              <button 
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleProductSubmit} className="flex flex-col flex-grow overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-grow text-xs">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Artwork Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Ocean Blue Resin Clock"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-semibold"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Creation Notes / Description</label>
                  <textarea
                    required
                    rows="3"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Detail the materials used, finishing details, and dimensions..."
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-medium animate-none"
                  />
                </div>

                {/* Grid for Category, Price, Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-semibold cursor-pointer"
                    >
                      <option value="Resin Clocks">Resin Clocks</option>
                      <option value="Coasters">Coasters</option>
                      <option value="Trays & Dishes">Trays & Dishes</option>
                      <option value="Canvas Paintings">Canvas Paintings</option>
                      <option value="Custom Preservations">Custom Preservations</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Price (₹ INR)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="Price in INR"
                      className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-semibold"
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Stock Count</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="e.g. 5"
                      className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Artwork Images Upload */}
                <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Image size={12} className="text-pink-650" /> Upload Artwork Images
                  </label>

                  {/* Current/Existing Product Images (only for editing) */}
                  {editingProductId && currentProductImages.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block font-bold">Current Images:</span>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {currentProductImages.map((img, idx) => (
                          <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 shrink-0">
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Multiple File Upload input */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-950 hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-colors px-4 py-2 text-center">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-1 animate-pulse" />
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                          {productForm.images.length > 0 
                            ? `${productForm.images.length} file(s) selected` 
                            : "Click to select files (Max 5 images)"
                          }
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        required={!editingProductId}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 5) {
                            toast.warning("You can upload a maximum of 5 images. Selecting the first 5.");
                            setProductForm({ ...productForm, images: files.slice(0, 5) });
                          } else {
                            setProductForm({ ...productForm, images: files });
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <p className="text-[9px] text-gray-400 dark:text-gray-500 italic mt-1 leading-relaxed">
                    {editingProductId 
                      ? "Uploading new files will replace all existing images. Leave blank to retain current ones." 
                      : "Please upload at least 1 and up to 5 images for the product."
                    }
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-4 border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50/50 dark:bg-gray-950/20 shrink-0">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="w-1/2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productsLoading}
                  className="w-1/2 bg-pink-650 hover:bg-pink-600 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-center focus:outline-none"
                >
                  {productsLoading ? "Saving..." : (editingProductId ? "Update Product" : "Create Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
