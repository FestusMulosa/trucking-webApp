/**
 * Simple API cache utility to reduce unnecessary API calls
 */

class ApiCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes default timeout
  }

  /**
   * Generate a cache key from URL and options
   * @param {string} url - The API URL
   * @param {Object} options - Request options
   * @returns {string} Cache key
   */
  generateKey(url, options = {}) {
    const { method = 'GET', body } = options;
    const key = `${method}:${url}`;
    if (body) {
      return `${key}:${JSON.stringify(body)}`;
    }
    return key;
  }

  /**
   * Get cached data if it exists and is not expired
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if not found/expired
   */
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    const { data, timestamp, timeout = this.cacheTimeout } = cached;
    const now = Date.now();

    if (now - timestamp > timeout) {
      this.cache.delete(key);
      return null;
    }

    console.log(`Cache hit for key: ${key}`);
    return data;
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} timeout - Custom timeout in milliseconds
   */
  set(key, data, timeout = this.cacheTimeout) {
    console.log(`Caching data for key: ${key}`);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      timeout
    });
  }

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key to clear
   */
  clear(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clearAll() {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpired() {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      const { timestamp, timeout = this.cacheTimeout } = cached;
      if (now - timestamp > timeout) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create a singleton instance
const apiCache = new ApiCache();

// Clear expired entries every 10 minutes
setInterval(() => {
  apiCache.clearExpired();
}, 10 * 60 * 1000);

export default apiCache;
