import api from "./api";

let wishlistPromise = null;

export const fetchWishlistCached = async (userInfo) => {
  if (!userInfo) return [];
  if (window.__wishlistCache) return window.__wishlistCache;
  if (wishlistPromise) return wishlistPromise;

  wishlistPromise = api.get("/products/wishlist/me")
    .then(({ data }) => {
      const ids = data.map(item => item._id);
      window.__wishlistCache = ids;
      // Clear the cache after 2 seconds to ensure subsequent operations query fresh data
      setTimeout(() => {
        window.__wishlistCache = null;
      }, 2000);
      return ids;
    })
    .catch(err => {
      console.error(err);
      return [];
    })
    .finally(() => {
      wishlistPromise = null;
    });

  return wishlistPromise;
};

export const updateWishlistCache = (ids) => {
  window.__wishlistCache = ids;
};
