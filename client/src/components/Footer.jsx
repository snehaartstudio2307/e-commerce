import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Sparkles, Send } from "lucide-react";


function Footer() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <footer className="bg-gray-950 text-gray-300 mt-28 border-t border-gray-900">
      {/* Top Banner (Aesthetic Value Statement) */}
      <div className="bg-gradient-to-r from-pink-600/10 via-rose-500/10 to-amber-500/10 border-b border-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <Sparkles size={16} className="text-pink-500" />
            <span>Join our VIP list for exclusive drops and custom preorder access.</span>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full sm:w-auto items-center">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-gray-900/80 border border-gray-800 text-xs px-4 py-2.5 rounded-l-xl focus:outline-none focus:border-pink-500 text-white w-full sm:w-64 transition-all"
              required
            />
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-500 text-white p-2.5 rounded-r-xl transition-colors flex items-center justify-center"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* About column */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 text-white font-serif text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">Sneha Art Studio</span>
          </Link>
          <p className="text-gray-400 text-xs leading-relaxed">
            Unique, handmade resin creations and custom canvas paintings crafted with precision, premium pigments, and high-gloss finishes to bring elegance to your spaces.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-900 hover:bg-pink-600 hover:text-white text-gray-400 transition-all flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-900 hover:bg-pink-600 hover:text-white text-gray-400 transition-all flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-900 hover:bg-pink-600 hover:text-white text-gray-400 transition-all flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/><path d="m10 15 5-3-5-3z"/></svg>
            </a>
          </div>
        </div>

        {/* Collections column */}
        <div className="space-y-4">
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Collections</h4>
          <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
            <li><Link to="/products?category=Resin Clocks" className="hover:text-pink-400 transition-colors">Resin Wall Clocks</Link></li>
            <li><Link to="/products?category=Coasters" className="hover:text-pink-400 transition-colors">Agate & Geode Coasters</Link></li>
            <li><Link to="/products?category=Trays & Dishes" className="hover:text-pink-400 transition-colors">Luxury Vanity Trays</Link></li>
            <li><Link to="/products?category=Canvas Paintings" className="hover:text-pink-400 transition-colors">Canvas Fluid Art</Link></li>
            <li><Link to="/products?category=Custom Preservations" className="hover:text-pink-400 transition-colors">Flower Preservation</Link></li>
          </ul>
        </div>

        {/* Info / Support column */}
        <div className="space-y-4">
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Studio Support</h4>
          <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
            <li><Link to="/shipping-policy" className="hover:text-pink-400 transition-colors">Shipping & Delivery</Link></li>
            <li><Link to="/care-instructions" className="hover:text-pink-400 transition-colors">Resin Care Instructions</Link></li>
            <li><Link to="/custom-orders" className="hover:text-pink-400 transition-colors">Book Custom Preservation</Link></li>
            <li><Link to="/faqs" className="hover:text-pink-400 transition-colors">Frequently Asked Questions</Link></li>
          </ul>
        </div>

        {/* Contact column */}
        <div className="space-y-4">
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Contact Us</h4>
          <ul className="space-y-3.5 text-xs text-gray-400 font-medium">
            <li className="flex gap-3 items-start">
              <MapPin size={16} className="text-pink-500 shrink-0 mt-0.5" />
              <span>Bengaluru, Karnataka, India</span>
            </li>
            <li className="flex gap-3 items-center">
              <Phone size={16} className="text-pink-500 shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex gap-3 items-center">
              <Mail size={16} className="text-pink-500 shrink-0" />
              <span>sneha@artstudio.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/40 py-6 border-t border-gray-900/60 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Sneha Art Studio. All rights reserved.</p>
          <div className="flex gap-6 font-medium">
            <Link to="/privacy-policy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;