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

  const { products } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = categoryFilter 
          ? `/products?category=${encodeURIComponent(categoryFilter)}` 
          : "/products";
        const { data } = await api.get(url);
        dispatch(setProducts(data));
      } catch (error) {
        console.log(error);
      }
    };

    fetchProducts();
  }, [dispatch, categoryFilter]);

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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
        <div>
          <span className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Sparkles size={14} /> Studio Collections
          </span>
          <h1 className="text-3xl font-serif font-extrabold text-gray-900">
            {categoryFilter ? `${categoryFilter}` : "Our Full Art Collection"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Discover one-of-a-kind, hand-poured art pieces and preservation keepsakes.
          </p>
        </div>

        {/* Category quick selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
          <SlidersHorizontal size={16} className="text-gray-400 mr-2 hidden sm:block" />
          {categories.map((cat) => {
            const isSelected = (!categoryFilter && cat === "All") || (categoryFilter === cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-pink-600 border-pink-600 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600"
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
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No artworks found in this collection.</p>
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