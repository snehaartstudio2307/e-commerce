import { useEffect } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "../redux/productSlice";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Sparkles } from "lucide-react";

function Products() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const keywordFilter = searchParams.get("keyword");

  const { products } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    if (keywordFilter) {
      document.title = `Search: "${keywordFilter}" | Sneha Art Studio`;
    } else if (categoryFilter) {
      document.title = `${categoryFilter} | Sneha Art Studio`;
    } else {
      document.title = "Shop Collections | Sneha Art Studio";
    }
  }, [categoryFilter, keywordFilter]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = [];
        if (categoryFilter) params.push(`category=${encodeURIComponent(categoryFilter)}`);
        if (keywordFilter) params.push(`keyword=${encodeURIComponent(keywordFilter)}`);
        
        const url = params.length > 0 ? `/products?${params.join("&")}` : "/products";
        const { data } = await api.get(url);
        dispatch(setProducts(data));
      } catch (error) {
        console.log(error);
      }
    };

    fetchProducts();
  }, [dispatch, categoryFilter, keywordFilter]);

  const categories = [
    "All",
    "Resin Clocks",
    "Coasters",
    "Trays & Dishes",
    "Canvas Paintings",
    "Custom Preservations"
  ];

  const handleCategoryClick = (category) => {
    if (category === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Active Search Filter Badge */}
      {keywordFilter && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-100/30 px-3.5 py-1.5 rounded-full flex items-center gap-2 font-semibold">
            Search query: "{keywordFilter}"
            <button 
              onClick={() => {
                searchParams.delete("keyword");
                setSearchParams(searchParams);
              }}
              className="text-pink-400 hover:text-pink-600 transition-colors font-bold text-xs ml-1"
              title="Clear search query"
            >
              ✕
            </button>
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <span className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Sparkles size={14} /> Studio Collections
          </span>
          <h1 className="text-3xl font-serif font-extrabold text-gray-900 dark:text-white">
            {keywordFilter 
              ? `Results for "${keywordFilter}"` 
              : categoryFilter 
                ? `${categoryFilter}` 
                : "Our Full Art Collection"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Discover one-of-a-kind, hand-poured art pieces and preservation keepsakes.
          </p>
        </div>

        {/* Category quick selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
          <SlidersHorizontal size={16} className="text-gray-400 dark:text-gray-500 mr-2 hidden sm:block" />
          {categories.map((cat) => {
            const isSelected = (!categoryFilter && cat === "All") || (categoryFilter === cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-pink-600 border-pink-600 text-white shadow-sm"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-pink-300 dark:hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid List */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 font-medium">No artworks found in this collection.</p>
          <button 
            onClick={() => handleCategoryClick("All")}
            className="mt-4 text-xs font-semibold text-pink-600 hover:underline"
          >
            Clear Filters & View All
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;