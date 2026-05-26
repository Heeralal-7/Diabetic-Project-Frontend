const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

export const getCacheKey = (location, page) => {
  if (!location?.latitude || !location?.longitude) return null;
  const lat = location.latitude.toFixed(3);
  const lng = location.longitude.toFixed(3);
  return `pharmacy_shops_${lat}_${lng}_page_${page}`;
};

export const getCachedData = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
};

export const setCachedData = (key, data) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch {}
};
