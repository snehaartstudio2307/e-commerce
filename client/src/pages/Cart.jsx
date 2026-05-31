import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck,
  CheckCircle,
  CreditCard,
  ChevronLeft,
  Loader2,
  MapPin
} from "lucide-react";
import { removeFromCart, updateCartQty, clearCart } from "../redux/cartSlice";
import { toast } from "react-toastify";
import AuthModal from "../components/AuthModal";
import api from "../services/api";

function Cart() {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  // Steps and Modals
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Saved Addresses list & Checkbox states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Shipping Address Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    house: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    landmark: ""
  });

  // Pre-fill Name if user logs in
  useEffect(() => {
    let active = true;
    const prefill = async () => {
      await Promise.resolve();
      if (!active) return;
      if (userInfo && !shippingAddress.fullName) {
        setShippingAddress((prev) => ({ ...prev, fullName: userInfo.name }));
      }
    };
    prefill();
    return () => {
      active = false;
    };
  }, [userInfo, shippingAddress.fullName]);

  // Fetch saved addresses if logged in and on checkout step
  const fetchSavedAddresses = useCallback(async () => {
    try {
      await Promise.resolve();
      if (!userInfo) return;
      const { data } = await api.get("/auth/profile");
      setSavedAddresses(data.addresses || []);
    } catch (err) {
      console.error("Failed to load user saved addresses:", err);
    }
  }, [userInfo]);

  useEffect(() => {
    if (isCheckoutStep) {
      Promise.resolve().then(() => {
        fetchSavedAddresses();
      });
    }
  }, [isCheckoutStep, fetchSavedAddresses]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setShippingAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      house: addr.house,
      area: addr.area,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      landmark: addr.landmark || ""
    });
  };

  const handleQtyChange = (item, newQty) => {
    if (newQty < 1) return;
    if (newQty > item.stock) {
      toast.warning(`Sorry, only ${item.stock} units are currently available.`);
      return;
    }
    dispatch(updateCartQty({ id: item._id, qty: newQty }));
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
    toast.success("Item removed from cart");
  };

  const handleClear = () => {
    dispatch(clearCart());
    toast.success("Cart cleared");
  };

  const handleProceedToCheckout = () => {
    if (!userInfo) {
      setAuthModalOpen(true);
    } else {
      setIsCheckoutStep(true);
    }
  };

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  // Load Razorpay Script helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Sync client cart items to backend user cart
  const syncCartToServer = async () => {
    setLoadingText("Synchronising cart items to server...");
    // 1. Get current server cart
    const { data: serverCart } = await api.get("/orders/cart");
    
    // 2. Remove existing server cart items
    for (const item of serverCart) {
      const productId = item.product?._id || item.product;
      if (productId) {
        await api.delete(`/orders/cart/${productId}`);
      }
    }

    // 3. Push current client items to server
    for (const item of cartItems) {
      await api.post("/orders/cart", {
        productId: item._id,
        quantity: item.qty
      });
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setCheckoutLoading(true);

    try {
      // 1. Load Razorpay Script
      setLoadingText("Connecting to payment gateways...");
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toast.error("Razorpay SDK failed to load. Are you connected to the internet?");
        setCheckoutLoading(false);
        return;
      }

      // 2. Synchronise client-side cart to database
      await syncCartToServer();

      // 3. Create Backend Order
      setLoadingText("Creating your order receipt...");
      const { data: order } = await api.post("/orders", { 
        shippingAddress,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined
      });

      // 4. Create Razorpay Payment Order on Server
      setLoadingText("Generating secure Razorpay payment credentials...");
      const { data: paymentOrderData } = await api.post("/payment/create-order", { orderId: order._id });
      
      const { key, razorpayOrder } = paymentOrderData;

      // 5. Trigger Razorpay Popup Widget
      setLoadingText("Opening secure payment panel...");
      const options = {
        key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Sneha Art Studio",
        description: "Purchase of Handcrafted Art",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            setCheckoutLoading(true);
            setLoadingText("Verifying payment security signature...");
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };
            const { data: verifyData } = await api.post("/payment/verify", verifyPayload);
            setPlacedOrder(verifyData.order);
            setPaymentSuccess(true);
            dispatch(clearCart());
            toast.success("Payment successful!");

            // Save address to profile if checked
            if (saveAddressChecked) {
              try {
                await api.post("/auth/addresses", shippingAddress);
              } catch (addrErr) {
                console.error("Failed to save address to profile:", addrErr);
              }
            }
          } catch (err) {
            console.error("Signature verification error:", err);
            toast.error("Payment verification failed on server.");
          } finally {
            setCheckoutLoading(false);
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: "#db2777" // Pink color matching theme
        },
        modal: {
          ondismiss: function () {
            toast.warning("Payment cancelled.");
            setCheckoutLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Checkout payment error:", err);
      toast.error(err.response?.data?.message || "Failed to create checkout order.");
      setCheckoutLoading(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.warning("Please enter a coupon code");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    try {
      const { data } = await api.post("/coupons/validate", { code: couponCode.trim() });
      setAppliedCoupon(data);
      toast.success(`Coupon "${data.code}" applied! ${data.discountPercentage}% discount`);
    } catch (err) {
      console.error(err);
      setCouponError(err.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
      toast.error(err.response?.data?.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast.info("Coupon removed");
  };

  // Math calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountPercentage = appliedCoupon ? appliedCoupon.discountPercentage : 0;
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = Math.round(subtotalAfterDiscount * 0.18); // 18% GST estimate
  const shippingThreshold = 5000;
  const shipping = subtotalAfterDiscount >= shippingThreshold || subtotalAfterDiscount === 0 ? 0 : 150;
  const total = subtotalAfterDiscount + shipping;

  // 1. PAYMENT SUCCESS OVERLAY
  if (paymentSuccess && placedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center text-emerald-650 dark:text-emerald-400 mx-auto mb-6 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
          <CheckCircle size={40} className="animate-bounce" />
        </div>
        <h1 className="text-3xl font-serif font-extrabold text-gray-900 dark:text-white">Payment Successful</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Thank you for collecting from Sneha Art Studio. Your order has been placed.
        </p>

        {/* Receipt Details Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 text-left my-8 shadow-md relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          
          <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-3 text-xs">
            <span className="text-gray-400 dark:text-gray-500 font-bold uppercase">Order Reference</span>
            <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">{placedOrder._id}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-3 text-xs">
            <span className="text-gray-400 dark:text-gray-500 font-bold uppercase">Razorpay Payment ID</span>
            <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">{placedOrder.razorpayPaymentId}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-3 text-xs">
            <span className="text-gray-400 dark:text-gray-500 font-bold uppercase">Paid Amount</span>
            <span className="font-extrabold text-gray-900 dark:text-white text-sm">₹{placedOrder.totalPrice?.toLocaleString()} INR</span>
          </div>

          <div className="text-xs">
            <span className="text-gray-400 dark:text-gray-500 font-bold uppercase block mb-1">Shipping To</span>
            <div className="text-gray-700 dark:text-gray-300 space-y-0.5 leading-relaxed font-normal">
              <p className="font-bold text-gray-900 dark:text-white">{placedOrder.shippingAddress?.fullName}</p>
              <p>{placedOrder.shippingAddress?.house}, {placedOrder.shippingAddress?.area}</p>
              <p>{placedOrder.shippingAddress?.city}, {placedOrder.shippingAddress?.state} - {placedOrder.shippingAddress?.pincode}</p>
              <p>Phone: {placedOrder.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>

        <Link 
          to="/products"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:opacity-95 shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300 w-full sm:w-auto"
        >
          Explore More Artworks
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      
      {/* Loading Overlay */}
      {checkoutLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50 transition-all">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col items-center max-w-sm text-center">
            <Loader2 className="animate-spin text-pink-600 mb-4" size={40} />
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-2">Processing Checkout</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{loadingText || "Please wait..."}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pb-6 border-b border-gray-100 dark:border-gray-800 mb-10">
        <span className="text-xs font-bold text-pink-650 dark:text-pink-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Sparkles size={14} /> Checkout Queue
        </span>
        <h1 className="text-3xl font-serif font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <ShoppingBag size={26} className="text-pink-600" />
          Shopping Cart
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Review your items and proceed to complete your handcrafted luxury purchase.
        </p>
      </div>

      {cartItems.length === 0 ? (
        // Empty State
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-pink-50 dark:bg-pink-950/20 rounded-full flex items-center justify-center text-pink-600 dark:text-pink-400 mx-auto mb-6">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 px-4 font-normal">
            Before checking out, explore Sneha Art Studio's luxury fluid canvas and high-gloss resin wall clocks.
          </p>
          <Link 
            to="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-95 shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300"
          >
            Start Shopping
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        // Cart Layout
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items List OR Shipping Address form */}
          <div className="lg:col-span-8 space-y-6">
            
            {!isCheckoutStep ? (
              // Step 1: List Items
              <>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div 
                      key={item._id}
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-6"
                    >
                      {/* Image */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950 shrink-0 border border-gray-100 dark:border-gray-800">
                        <img 
                          src={item.images?.[0]?.url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80"} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Title and Category */}
                      <div className="flex-grow text-center sm:text-left">
                        <span className="text-[10px] font-bold text-pink-650 dark:text-pink-400 uppercase tracking-wider">
                          {item.category || "Handmade Resin"}
                        </span>
                        <Link to={`/products/${item._id}`} className="hover:text-pink-650 transition-colors">
                          <h3 className="font-serif font-bold text-gray-900 dark:text-white text-base leading-snug mt-0.5 line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-emerald-600 dark:text-emerald-450 mt-1 font-semibold">
                          In Stock
                        </p>
                      </div>

                      {/* Pricing and Quantity Adjusters */}
                      <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                        
                        {/* Qty Incrementor */}
                        <div className="flex items-center justify-between border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-lg px-2.5 py-1.5 w-24 shrink-0">
                          <button 
                            onClick={() => handleQtyChange(item, item.qty - 1)}
                            className="text-gray-400 hover:text-pink-600 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.qty}</span>
                          <button 
                            onClick={() => handleQtyChange(item, item.qty + 1)}
                            className="text-gray-400 hover:text-pink-600 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price calculation */}
                        <div className="text-center sm:text-right w-24">
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block">Total Price</span>
                          <span className="text-sm font-extrabold text-gray-950 dark:text-white">
                            ₹{(item.price * item.qty).toLocaleString()}
                          </span>
                        </div>

                        {/* Delete button */}
                        <button 
                          onClick={() => handleRemove(item._id)}
                          className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 dark:text-gray-500 transition-all focus:outline-none"
                          title="Remove Item"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </div>
                  ))}
                </div>

                {/* Clear Cart button */}
                <div className="flex justify-between items-center pt-2">
                  <Link 
                    to="/products"
                    className="text-xs font-bold text-pink-600 dark:text-pink-500 hover:underline flex items-center gap-1"
                  >
                    ← Continue Shopping
                  </Link>
                  <button
                    onClick={handleClear}
                    className="text-xs font-bold text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none"
                  >
                    Clear Shopping Cart
                  </button>
                </div>
              </>
            ) : (
              // Step 2: Shipping Address Form
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h2 className="text-xl font-serif font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <Truck size={22} className="text-pink-650" />
                    Delivery Shipping Address
                  </h2>
                  <button
                    onClick={() => setIsCheckoutStep(false)}
                    className="text-xs font-semibold text-gray-400 hover:text-pink-650 flex items-center gap-1 focus:outline-none"
                  >
                    <ChevronLeft size={14} /> Back to Cart
                  </button>
                </div>

                {/* Saved Address Quick Selector */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-3 pb-5 border-b border-gray-100 dark:border-gray-800/80 mb-5">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={12} className="text-pink-650" />
                      Select from Saved Addresses
                    </span>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr._id;
                        return (
                          <button
                            key={addr._id}
                            type="button"
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-4 rounded-2xl border text-left shrink-0 w-64 transition-all hover:border-pink-300 dark:hover:border-pink-500 ${
                              isSelected
                                ? "border-pink-600 bg-pink-50/20 dark:bg-pink-950/10 ring-2 ring-pink-500/20"
                                : "border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/20"
                            }`}
                          >
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{addr.fullName}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate">{addr.house}, {addr.area}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{addr.city}, {addr.state} - {addr.pincode}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Receiver Full Name</label>
                      <input 
                        type="text" 
                        name="fullName"
                        required
                        value={shippingAddress.fullName}
                        onChange={handleAddressChange}
                        placeholder="e.g. Aditi Sharma" 
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Contact Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        placeholder="e.g. 9876543210" 
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">House / Flat / Building No.</label>
                      <input 
                        type="text" 
                        name="house"
                        required
                        value={shippingAddress.house}
                        onChange={handleAddressChange}
                        placeholder="e.g. Flat 302, Royal Residency" 
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Area / Colony / Street Name</label>
                      <input 
                        type="text" 
                        name="area"
                        required
                        value={shippingAddress.area}
                        onChange={handleAddressChange}
                        placeholder="e.g. Indiranagar, 12th Main Road" 
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
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
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        placeholder="e.g. Bengaluru" 
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">State</label>
                      <input 
                        type="text" 
                        name="state"
                        required
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        placeholder="e.g. Karnataka" 
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Postal Pin Code</label>
                      <input 
                        type="text" 
                        name="pincode"
                        required
                        value={shippingAddress.pincode}
                        onChange={handleAddressChange}
                        placeholder="e.g. 560038" 
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Landmark (Optional)</label>
                    <input 
                      type="text" 
                      name="landmark"
                      value={shippingAddress.landmark}
                      onChange={handleAddressChange}
                      placeholder="e.g. Near Metro Station" 
                      className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                    />
                  </div>

                  {/* Save address checkbox */}
                  <div className="flex items-center gap-2.5 py-2">
                    <input
                      type="checkbox"
                      id="saveAddressCheckbox"
                      checked={saveAddressChecked}
                      onChange={(e) => setSaveAddressChecked(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-pink-600 focus:ring-pink-500 cursor-pointer"
                    />
                    <label 
                      htmlFor="saveAddressCheckbox"
                      className="text-xs text-gray-600 dark:text-gray-400 font-semibold cursor-pointer select-none"
                    >
                      Save this address to my profile for future purchases
                    </label>
                  </div>

                  {/* Payment Submission Button Trigger */}
                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-xs uppercase tracking-wider py-4 rounded-xl hover:opacity-95 shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={14} />
                    Place Order & Pay securely
                  </button>

                </form>

                {/* Sandbox test credentials info banner */}
                <div className="bg-pink-50/45 dark:bg-pink-950/10 border border-pink-100/40 dark:border-pink-900/30 rounded-2xl p-5 text-xs mt-6 space-y-3 font-normal">
                  <div className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 font-bold uppercase tracking-wider text-[10px]">
                    <Sparkles size={12} /> Sandbox Mode Test Credentials
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    Use these mock credentials within the Razorpay checkout window to simulate a successful payment:
                  </p>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex justify-between border-b border-gray-100 dark:border-gray-800/60 pb-1">
                      <span>💳 Test Card Number:</span>
                      <span className="font-mono font-bold">4111 1111 1111 1111</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-100 dark:border-gray-800/60 pb-1">
                      <span>📅 Expiry / CVV:</span>
                      <span className="font-mono">Any future date (e.g. 12/30) / <strong className="font-bold">123</strong></span>
                    </li>
                    <li className="flex justify-between">
                      <span>🏦 Netbanking simulation:</span>
                      <span>Select any bank and click <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Success</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Checkout Summary Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500" />
              
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-6">
                Order Summary
              </h3>

              {/* Line items list */}
              <div className="space-y-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <div className="flex justify-between font-normal text-gray-400 dark:text-gray-500">
                  <span>Cart Subtotal</span>
                  <span className="text-gray-900 dark:text-white">₹{subtotal.toLocaleString()}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between font-bold text-pink-600 dark:text-pink-400">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toLocaleString()} ({appliedCoupon.discountPercentage}%)</span>
                  </div>
                )}
                
                <div className="flex justify-between font-normal text-gray-400 dark:text-gray-500">
                  <span>GST (18% estimated)</span>
                  <span className="text-gray-900 dark:text-white">₹{tax.toLocaleString()}</span>
                </div>

                <div className="flex justify-between font-normal text-gray-400 dark:text-gray-500">
                  <span>Secure Courier Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-emerald-650 font-bold uppercase tracking-wider text-[10px]">Free Shipping</span>
                  ) : (
                    <span className="text-gray-900 dark:text-white">₹{shipping.toLocaleString()}</span>
                  )}
                </div>

                {shipping > 0 && (
                  <div className="bg-pink-50/50 dark:bg-pink-950/10 border border-pink-100/50 dark:border-pink-900/30 rounded-xl p-3 text-[10px] text-pink-700 dark:text-pink-400 leading-normal font-normal flex items-start gap-2">
                    <Truck size={14} className="shrink-0 mt-0.5 text-pink-650 dark:text-pink-400" />
                    <span>
                      Add <strong>₹{(shippingThreshold - subtotalAfterDiscount).toLocaleString()}</strong> more to your order to unlock <strong>Free Shipping</strong>!
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-150 dark:border-gray-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Total Cost</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-gray-950 dark:text-white">₹{total.toLocaleString()}</span>
                    <span className="text-[10px] text-pink-650 dark:text-pink-400">INR</span>
                  </div>
                </div>
              </div>

              {/* Coupon Code Input Block */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3 font-semibold">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Have a promo code?</label>
                
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 rounded-xl px-4 py-2.5">
                    <div className="text-xs">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-455 uppercase">{appliedCoupon.code}</span>
                      <span className="text-gray-400 dark:text-gray-500 font-normal ml-1.5">Applied</span>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-655 font-bold text-xs focus:outline-none"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SAVE20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-xl px-3 py-2 text-xs font-mono uppercase text-gray-850 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-bold"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="px-4 py-2 bg-gray-900 dark:bg-gray-800 hover:bg-gray-850 dark:hover:bg-gray-700 text-white font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50 focus:outline-none"
                    >
                      {couponLoading ? "Applying..." : "Apply"}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[10px] text-red-500 font-bold mt-1">{couponError}</p>}
              </div>

              {/* Checkout CTA */}
              {!isCheckoutStep && (
                <button 
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-xs uppercase tracking-wider py-4 rounded-xl hover:opacity-95 shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300 flex items-center justify-center gap-2 mt-8"
                >
                  Proceed to Checkout
                  <ArrowRight size={14} />
                </button>
              )}

              {/* Secure Checkout Badges */}
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>100% Secure SSL checkout</span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Checkout Authentication Dialog popup */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => {
          setAuthModalOpen(false);
          if (userInfo) setIsCheckoutStep(true);
        }} 
      />

    </div>
  );
}

export default Cart;
