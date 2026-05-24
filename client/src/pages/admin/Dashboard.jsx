import { useEffect, useState } from "react";
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
  Truck,
  ArrowRight,
  Loader2
} from "lucide-react";
import api from "../../services/api";
import { toast } from "react-toastify";

function Dashboard() {
  const { userInfo } = useSelector((state) => state.auth);

  // States
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Invoice Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch admin dashboard stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await api.get("/orders/admin/dashboard/stats");
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast.error("Failed to load dashboard metrics.");
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders/admin/all");
      setOrders(data);
    } catch (err) {
      console.error("Error fetching admin orders:", err);
      toast.error("Failed to load customer orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      fetchStats();
      fetchOrders();
    }
  }, [userInfo]);

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
                <tr className="border-b border-gray-100 dark:border-gray-850 text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">
                  <th className="py-4 px-4">Order Reference</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Collector</th>
                  <th className="py-4 px-4 text-right">Paid Amount</th>
                  <th className="py-4 px-4 text-center">Payment</th>
                  <th className="py-4 px-4">Fulfillment Status</th>
                  <th className="py-4 px-4 text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850/60 text-gray-700 dark:text-gray-300 font-medium">
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
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-850 p-6">
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
              <div className="grid sm:grid-cols-2 gap-6 bg-gray-50/50 dark:bg-gray-950/30 p-5 border border-gray-100 dark:border-gray-850/60 rounded-2xl text-xs space-y-4 sm:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[9px]">
                    <Calendar size={12} /> Date Placed
                  </div>
                  <p className="font-bold text-gray-850 dark:text-gray-200">
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
                  <p className="font-bold text-gray-850 dark:text-gray-200">Method: {selectedOrder.paymentMethod || "COD"}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5 font-normal">Status: <strong className="font-semibold text-emerald-600 dark:text-emerald-450">{selectedOrder.paymentStatus}</strong></p>
                  {selectedOrder.razorpayPaymentId && (
                    <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 font-normal">Txn ID: {selectedOrder.razorpayPaymentId}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Customer Shipping Address */}
              <div className="text-xs space-y-2">
                <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[9px] block">Shipping Destination Address</span>
                <div className="bg-gray-50/50 dark:bg-gray-950/30 p-5 border border-gray-100 dark:border-gray-850/60 rounded-2xl leading-relaxed text-gray-700 dark:text-gray-300 font-normal">
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
                      className="flex items-center gap-4 p-3 border border-gray-100 dark:border-gray-850 rounded-xl"
                    >
                      {/* Product thumbnail */}
                      <div className="w-12 h-12 bg-gray-50 dark:bg-gray-950 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-gray-850">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>

                      {/* Title details */}
                      <div className="flex-grow text-xs font-semibold">
                        <h4 className="text-gray-900 dark:text-white line-clamp-1">{item.title}</h4>
                        <p className="text-gray-400 dark:text-gray-550 font-normal mt-0.5">₹{item.price?.toLocaleString()} x {item.quantity}</p>
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
              <div className="border-t border-gray-100 dark:border-gray-850 pt-4 text-xs font-semibold text-gray-600 dark:text-gray-300 space-y-2.5 max-w-xs ml-auto">
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
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 dark:border-gray-850 text-gray-900 dark:text-white">
                  <span className="font-bold text-sm">Amount Paid</span>
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

export default Dashboard;
