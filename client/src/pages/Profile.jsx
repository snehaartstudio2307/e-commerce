import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  User, 
  MapPin, 
  ShoppingBag, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  X, 
  Check, 
  Truck, 
  Loader2, 
  Calendar, 
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Camera
} from "lucide-react";
import api from "../services/api";
import { setUser } from "../redux/authSlice";
import { toast } from "react-toastify";

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  // Profile Data & App State
  const [activeTab, setActiveTab] = useState("orders");
  
  // Profile settings states
  const [profileForm, setProfileForm] = useState({
    name: userInfo?.name || "",
    email: userInfo?.email || "",
    password: "",
    confirmPassword: ""
  });
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userInfo?.avatar || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (userInfo) {
      Promise.resolve().then(() => {
        setProfileForm({
          name: userInfo.name || "",
          email: userInfo.email || "",
          password: "",
          confirmPassword: ""
        });
        setAvatarPreview(userInfo.avatar || "");
      });
    }
  }, [userInfo]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profileForm.password !== profileForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("email", profileForm.email);
      if (profileForm.password) {
        formData.append("password", profileForm.password);
      }
      if (profileAvatar) {
        formData.append("avatar", profileAvatar);
      }

      const { data } = await api.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      dispatch(setUser(data));
      toast.success("Profile updated successfully!");
      setProfileForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setProfileAvatar(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // Modals for Address
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    house: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    landmark: ""
  });
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Detailed Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Fetch complete profile (addresses)
  const fetchProfile = useCallback(async () => {
    try {
      await Promise.resolve();
      setProfileLoading(true);
      const { data } = await api.get("/auth/profile");
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      toast.error("Failed to load saved addresses.");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Fetch my orders
  const fetchMyOrders = useCallback(async () => {
    try {
      await Promise.resolve();
      setOrdersLoading(true);
      const { data } = await api.get("/orders/my");
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching my orders:", err);
      toast.error("Failed to load your purchase history.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else {
      Promise.resolve().then(() => {
        fetchProfile();
        fetchMyOrders();
      });
    }
  }, [userInfo, navigate, fetchProfile, fetchMyOrders]);

  // Address Actions
  const handleAddressInputChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: "",
      phone: "",
      house: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      landmark: ""
    });
    setAddressModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      house: addr.house,
      area: addr.area,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      landmark: addr.landmark || ""
    });
    setAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        // Edit Address
        const { data } = await api.put(`/auth/addresses/${editingAddressId}`, addressForm);
        setAddresses(data);
        toast.success("Saved address updated successfully.");
      } else {
        // Add Address
        const { data } = await api.post("/auth/addresses", addressForm);
        setAddresses(data);
        toast.success("New address saved to your profile.");
      }
      setAddressModalOpen(false);
    } catch (err) {
      console.error("Error saving address:", err);
      toast.error(err.response?.data?.message || "Failed to save address details.");
    }
  };

  const handleAddressDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const { data } = await api.delete(`/auth/addresses/${id}`);
      setAddresses(data);
      toast.success("Saved address deleted successfully.");
    } catch (err) {
      console.error("Error deleting address:", err);
      toast.error("Failed to delete address.");
    }
  };

  // Order Stepper Helper
  const steps = ["Placed", "Processing", "Shipped", "Delivered"];
  const getStepIndex = (status) => {
    const map = { Placed: 0, Processing: 1, Shipped: 2, Delivered: 3 };
    return map[status] ?? 0;
  };

  if (!userInfo) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="pb-6 border-b border-gray-100 dark:border-gray-800 mb-10">
        <span className="text-xs font-bold text-pink-650 dark:text-pink-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Sparkles size={14} /> Studio Member Profile
        </span>
        <h1 className="text-3xl font-serif font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
          <User size={26} className="text-pink-650" />
          My Collector Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your delivery addresses and track live shipping updates on your art collection.
        </p>
      </div>

      {/* Profile Page Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Navigation Tabs Menu */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-1">
            
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "orders"
                  ? "bg-pink-600 text-white shadow-md shadow-pink-500/10"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              }`}
            >
              <ShoppingBag size={16} />
              My Orders & Live Tracking
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "addresses"
                  ? "bg-pink-600 text-white shadow-md shadow-pink-500/10"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              }`}
            >
              <MapPin size={16} />
              Saved Delivery Addresses
            </button>

            <button
              onClick={() => setActiveTab("account")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "account"
                  ? "bg-pink-600 text-white shadow-md shadow-pink-500/10"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              }`}
            >
              <User size={16} />
              Account Settings Info
            </button>

          </div>
        </div>

        {/* Right Side: Tab Panel Content */}
        <div className="lg:col-span-9 space-y-6">

          {/* TAB 1: MY ORDERS & TRACKING */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif font-extrabold text-gray-900 dark:text-white px-1">Track My Art Orders</h2>
              
              {ordersLoading ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-16 text-center flex flex-col items-center shadow-sm">
                  <Loader2 className="animate-spin text-pink-650 mb-3" size={32} />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Loading your purchases database...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-16 text-center shadow-sm">
                  <div className="w-14 h-14 bg-pink-50 dark:bg-pink-950/20 rounded-full flex items-center justify-center text-pink-600 dark:text-pink-400 mx-auto mb-5">
                    <ShoppingBag size={24} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-1.5">No orders recorded yet</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed mb-6 font-normal">
                    You haven't collected any handcrafted resin masterpieces yet. Start exploring our studio galleries to begin.
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:opacity-95 shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300"
                  >
                    View Art Gallery
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const stepIdx = getStepIndex(order.orderStatus);
                    const isCancelled = order.orderStatus === "Cancelled";

                    return (
                      <div
                        key={order._id}
                        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm space-y-6 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                        
                        {/* Order info row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 dark:border-gray-800/50 pb-4 text-xs font-semibold">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase">Order Date</p>
                            <p className="text-gray-800 dark:text-gray-200 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase">Reference</p>
                            <p className="font-mono text-gray-800 dark:text-gray-200 mt-0.5">{order._id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase">Payment Amount</p>
                            <p className="font-extrabold text-gray-900 dark:text-white mt-0.5">₹{order.totalPrice?.toLocaleString()}</p>
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setOrderModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-655 dark:text-pink-500 hover:underline border border-pink-100/30 dark:border-pink-900/30 bg-pink-50/30 dark:bg-pink-950/10 px-3 py-1.5 rounded-xl transition-all"
                            >
                              <Eye size={12} />
                              View Invoice
                            </button>
                          </div>
                        </div>

                        {/* Order Stepper (LIVE TRACKING TIMELINE) */}
                        <div className="py-4">
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase mb-6">Live Fulfillment Tracking</p>
                          
                          {isCancelled ? (
                            <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/35 rounded-2xl p-4 flex items-center gap-3 text-red-500 text-xs font-semibold">
                              <span className="w-6 h-6 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center font-bold text-[10px]">✕</span>
                              <span>This order has been cancelled. If this is unexpected, please contact support.</span>
                            </div>
                          ) : (
                            <div className="relative">
                              {/* Horizontal connector line */}
                              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 dark:bg-gray-800 -z-10 hidden sm:block" />
                              <div 
                                className="absolute top-4 left-4 h-0.5 bg-pink-500 -z-10 hidden sm:block transition-all duration-500" 
                                style={{ width: `${(stepIdx / 3) * 92}%` }}
                              />

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative z-10">
                                {steps.map((step, idx) => {
                                  const isCompleted = stepIdx >= idx;
                                  const isActive = stepIdx === idx;
                                  
                                  return (
                                    <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-2.5 text-center">
                                      {/* Indicator Bubble */}
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 shrink-0 ${
                                        isCompleted 
                                          ? "bg-pink-600 border-pink-600 text-white shadow-sm" 
                                          : "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-400"
                                      } ${isActive ? "ring-4 ring-pink-500/20 scale-110" : ""}`}>
                                        {isCompleted ? <Check size={14} /> : idx + 1}
                                      </div>

                                      {/* Step Label */}
                                      <div className="text-left sm:text-center">
                                        <p className={`text-xs font-bold ${
                                          isCompleted ? "text-gray-900 dark:text-white" : "text-gray-400"
                                        }`}>{step}</p>
                                        <p className="text-[9px] text-gray-400 mt-0.5 font-medium">
                                          {idx === 0 ? "Order placed" : idx === 1 ? "In production" : idx === 2 ? "Shipped out" : "Delivered safely"}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 px-1">
                <h2 className="text-xl font-serif font-extrabold text-gray-900 dark:text-white">Saved Delivery Addresses</h2>
                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-200"
                >
                  <Plus size={14} />
                  Add Address
                </button>
              </div>

              {profileLoading ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-16 text-center flex flex-col items-center shadow-sm">
                  <Loader2 className="animate-spin text-pink-650 mb-3" size={32} />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Loading your address book...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-16 text-center shadow-sm">
                  <div className="w-14 h-14 bg-pink-50 dark:bg-pink-950/20 rounded-full flex items-center justify-center text-pink-600 dark:text-pink-400 mx-auto mb-5">
                    <MapPin size={24} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-1.5">No saved addresses</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed mb-6 font-normal">
                    You haven't saved any delivery locations yet. Add a saved address to make checking out for future art purchases lightning fast.
                  </p>
                  <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-1.5 bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
                  >
                    <Plus size={14} /> Add Address
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm relative flex flex-col justify-between"
                    >
                      <div className="space-y-2 text-xs font-semibold leading-relaxed text-gray-700 dark:text-gray-300">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{addr.fullName}</p>
                        <p className="font-normal">{addr.house}, {addr.area}</p>
                        <p className="font-normal">{addr.city}, {addr.state} - <strong className="font-bold">{addr.pincode}</strong></p>
                        {addr.landmark && <p className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">Landmark: {addr.landmark}</p>}
                        <p className="text-gray-900 dark:text-white pt-1">Phone: {addr.phone}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-50 dark:border-gray-800/50">
                        <button
                          onClick={() => handleOpenEditModal(addr)}
                          className="flex-grow flex items-center justify-center gap-1 py-2 text-xs font-semibold text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-500 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-pink-50/30 dark:hover:bg-pink-950/10 transition-all"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleAddressDelete(addr._id)}
                          className="flex-grow flex items-center justify-center gap-1 py-2 text-xs font-semibold text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/10 transition-all"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT INFO */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif font-extrabold text-gray-900 dark:text-white px-1">Account Settings</h2>
              
              <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
                
                {/* Profile Picture Uploader */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800/50">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-pink-200 dark:border-pink-900/60 shadow-md bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-extrabold text-pink-655 dark:text-pink-400">
                          {userInfo.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center sm:text-left space-y-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Profile Photo</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 max-w-xs leading-normal">
                      Update your profile picture. Only JPG, JPEG, and PNG formats are accepted (Max 5MB).
                    </p>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800/85 text-gray-700 dark:text-gray-300 font-bold text-[10px] uppercase tracking-wider px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl transition-all">
                      <Camera size={12} className="text-pink-655" />
                      {profileAvatar ? "Change Selected" : "Upload Picture"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.warning("Profile picture cannot exceed 5MB.");
                              return;
                            }
                            setProfileAvatar(file);
                            setAvatarPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                    {profileAvatar && (
                      <span className="block text-[10px] font-mono text-pink-655 font-semibold">{profileAvatar.name}</span>
                    )}
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid sm:grid-cols-2 gap-5 text-xs">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">Collector Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">Registered Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">New Password (Optional)</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button & membership indicator */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                    <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                    <span>
                      {userInfo.isAdmin ? "Studio Admin Account" : "Verified Studio Member"}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="bg-gradient-to-r from-pink-650 to-rose-500 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {updatingProfile ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        Updating...
                      </>
                    ) : (
                      "Save Profile Changes"
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>

      </div>

      {/* 1. SAVED ADDRESS MODAL DIALOG (ADD/EDIT) */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddressModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-2xl z-10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500" />
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-6">
              <h3 className="text-lg font-serif font-extrabold text-gray-900 dark:text-white">
                {editingAddressId ? "Modify Saved Address" : "Save New Address"}
              </h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={addressForm.fullName}
                    onChange={handleAddressInputChange}
                    placeholder="Aditi Sharma"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={addressForm.phone}
                    onChange={handleAddressInputChange}
                    placeholder="9876543210"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">House / Flat No.</label>
                  <input
                    type="text"
                    name="house"
                    required
                    value={addressForm.house}
                    onChange={handleAddressInputChange}
                    placeholder="Flat 302, Royal Apt"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Area / Street</label>
                  <input
                    type="text"
                    name="area"
                    required
                    value={addressForm.area}
                    onChange={handleAddressInputChange}
                    placeholder="Indiranagar 12th Main"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={addressForm.city}
                    onChange={handleAddressInputChange}
                    placeholder="Bengaluru"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={addressForm.state}
                    onChange={handleAddressInputChange}
                    placeholder="Karnataka"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Pin Code</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={addressForm.pincode}
                    onChange={handleAddressInputChange}
                    placeholder="560038"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Landmark (Optional)</label>
                <input
                  type="text"
                  name="landmark"
                  value={addressForm.landmark}
                  onChange={handleAddressInputChange}
                  placeholder="Near Metro Station"
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:opacity-95 shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all mt-6"
              >
                {editingAddressId ? "Save Changes" : "Save Delivery Address"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. ORDER DETAILS INVOICE MODAL POPUP */}
      {orderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOrderModalOpen(false)} />

          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500" />
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-6">
              <div>
                <h3 className="text-lg font-serif font-extrabold text-gray-900 dark:text-white">Order Invoice Details</h3>
                <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mt-0.5">Reference: {selectedOrder._id}</p>
              </div>
              <button 
                onClick={() => setOrderModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              
              {/* Timeline status header */}
              <div className="bg-pink-50/20 dark:bg-pink-950/10 border border-pink-100/40 dark:border-pink-900/30 rounded-2xl p-4 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Truck className="text-pink-600" size={16} />
                  <span className="text-gray-500">Status:</span>
                  <span className="text-pink-650 dark:text-pink-500 font-bold uppercase tracking-wider text-[10px] bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-md border border-pink-100/30">
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <div className="text-gray-400 font-normal">
                  Fulfillment Stage {getStepIndex(selectedOrder.orderStatus) + 1} of 4
                </div>
              </div>

              {/* Grid block info */}
              <div className="grid sm:grid-cols-2 gap-6 bg-gray-50/50 dark:bg-gray-950/30 p-5 border border-gray-100 dark:border-gray-800/60 rounded-2xl text-xs space-y-4 sm:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                    <Calendar size={12} /> Date Ordered
                  </div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                    <CreditCard size={12} /> Payment Particulars
                  </div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">Method: {selectedOrder.paymentMethod || "Razorpay"}</p>
                  <p className="text-gray-500 font-normal mt-0.5">Status: <strong className="font-semibold text-emerald-600">{selectedOrder.paymentStatus}</strong></p>
                  {selectedOrder.razorpayPaymentId && (
                    <p className="text-[10px] font-mono text-gray-400 font-normal mt-0.5">Txn ID: {selectedOrder.razorpayPaymentId}</p>
                  )}
                </div>
              </div>

              {/* Shipping address details */}
              <div className="text-xs space-y-2">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Shipping Destination</span>
                <div className="bg-gray-50/50 dark:bg-gray-950/30 border border-gray-100 dark:border-gray-800/60 rounded-2xl leading-relaxed text-gray-700 dark:text-gray-300 font-normal">
                  <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.shippingAddress?.fullName}</p>
                  <p>{selectedOrder.shippingAddress?.house}, {selectedOrder.shippingAddress?.area}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - <strong className="font-bold">{selectedOrder.shippingAddress?.pincode}</strong></p>
                  {selectedOrder.shippingAddress?.landmark && <p>Landmark: {selectedOrder.shippingAddress?.landmark}</p>}
                  <p className="mt-2 text-gray-900 dark:text-white font-semibold">Contact: {selectedOrder.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-3">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Items ({selectedOrder.items?.length || 0})</span>
                <div className="space-y-2.5">
                  {selectedOrder.items?.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-3 border border-gray-100 dark:border-gray-800 rounded-xl"
                    >
                      <div className="w-12 h-12 bg-gray-50 dark:bg-gray-950 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-grow text-xs font-semibold">
                        <h4 className="text-gray-900 dark:text-white line-clamp-1">{item.title}</h4>
                        <p className="text-gray-400 font-normal mt-0.5">₹{item.price?.toLocaleString()} x {item.quantity}</p>
                      </div>

                      <span className="text-xs font-extrabold text-gray-950 dark:text-white text-right">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial invoice totals */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 text-xs font-semibold text-gray-600 dark:text-gray-300 space-y-2.5 max-w-xs ml-auto">
                <div className="flex justify-between font-normal text-gray-400">
                  <span>Cart Subtotal</span>
                  <span>₹{selectedOrder.totalPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-normal text-gray-400">
                  <span>Est. GST (18%)</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between font-normal text-gray-400">
                  <span>Delivery fee</span>
                  <span className="text-emerald-600 font-bold uppercase text-[9px]">Free Shipping</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white">
                  <span className="font-bold text-sm">Total Paid</span>
                  <span className="text-lg font-extrabold">₹{selectedOrder.totalPrice?.toLocaleString()} INR</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;
