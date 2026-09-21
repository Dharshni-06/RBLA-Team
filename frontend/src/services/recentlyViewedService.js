// Service to manage recently viewed products in client storage
const MAX_RECENT_ITEMS = 15;

/**
 * Resolve product image to a complete, valid URL
 */
export const resolveProductImageUrl = (product) => {
  if (!product) return '/placeholder.jpg';

  let rawImg = product.image_url || (Array.isArray(product.images) && product.images[0]) || '';
  if (!rawImg) return '/placeholder.jpg';

  if (typeof rawImg !== 'string') return '/placeholder.jpg';

  if (rawImg.startsWith('http://') || rawImg.startsWith('https://') || rawImg.startsWith('data:')) {
    return rawImg;
  }

  const cleanPath = rawImg.startsWith('/') ? rawImg : `/${rawImg}`;
  return `http://localhost:5000${cleanPath}`;
};

/**
 * Storage key helper scoped to user
 */
const getStorageKey = (userId) => {
  return userId ? `rbla_recent_${userId}` : 'rbla_recent_guest';
};

/**
 * Get recently viewed products for a user
 */
export const getRecentlyViewed = (userId) => {
  try {
    const key = getStorageKey(userId);
    const stored = localStorage.getItem(key);
    let items = stored ? JSON.parse(stored) : [];

    // If logged in but user has no items yet, check if there are guest items to import
    if (userId && items.length === 0) {
      const guestStored = localStorage.getItem('rbla_recent_guest');
      if (guestStored) {
        items = JSON.parse(guestStored);
        // Persist to user's storage
        localStorage.setItem(key, JSON.stringify(items));
      }
    }

    return Array.isArray(items) ? items : [];
  } catch (err) {
    console.error('Error reading recently viewed products:', err);
    return [];
  }
};

/**
 * Add or update a product in recently viewed products
 */
export const addRecentlyViewed = (product, userId) => {
  if (!product || (!product._id && !product.id)) return;

  try {
    const productId = product._id || product.id;
    const resolvedImage = resolveProductImageUrl(product);

    const normalizedProduct = {
      _id: productId,
      name: product.name || product.title || 'Handcrafted Product',
      price: product.new_price || product.price || null,
      old_price: product.old_price || null,
      image: resolvedImage,
      category: product.category?.name || product.category || 'Handmade',
      viewedAt: new Date().toISOString()
    };

    const key = getStorageKey(userId);
    const existing = getRecentlyViewed(userId);

    // Filter out previous entry if this product was already viewed
    const updated = [
      normalizedProduct,
      ...existing.filter(item => (item._id || item.id) !== productId)
    ].slice(0, MAX_RECENT_ITEMS);

    localStorage.setItem(key, JSON.stringify(updated));

    // Also keep guest synced if guest
    if (!userId) {
      localStorage.setItem('rbla_recent_guest', JSON.stringify(updated));
    }

    // Notify any active listeners across the app
    window.dispatchEvent(
      new CustomEvent('recently_viewed_updated', {
        detail: { userId, product: normalizedProduct }
      })
    );
  } catch (err) {
    console.error('Error saving recently viewed product:', err);
  }
};
