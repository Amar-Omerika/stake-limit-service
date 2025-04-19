import { createClient } from 'redis';

class RedisCache {
  constructor() {
    this.enabled = false;
    this.client = null;
    
    try {
      this.client = createClient({
				url: process.env.REDIS_URL || "redis://localhost:6379",
				socket: {
					reconnectStrategy: (retries) => {
						if (retries > 3) {
							this.enabled = false;
							return false; // stop trying to reconnect
						}
						return Math.min(retries * 100, 3000); // reconnect after
					},
				},
			});

			this.client.on("error", (err) => {
				console.warn("Redis connection issue:", err.message);
				this.enabled = false;
			});
      
      this.connect();
    } catch (error) {
      console.warn('Redis initialization failed, running without cache');
    }
  }
  
  async connect() {
    try {
      if (this.client) {
        await this.client.connect();
        this.enabled = true;
        console.log('Redis cache connected');
      }
    } catch (error) {
      console.warn('Redis connection failed, running without cache:', error.message);
      this.enabled = false;
    }
  }

  async get(key) {
    if (!this.enabled) return null;
    
    try {
      const value = await this.client.get(`device:${key}`);
      if (value) {
        console.log(`Cache hit for device: ${key}`);
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      console.warn('Redis get error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    if (!this.enabled) return;
    
    try {
      await this.client.set(
        `device:${key}`, 
        JSON.stringify(value),
        { EX: ttl }
      );
      console.log(`Added device to cache: ${key}`);
    } catch (error) {
      console.warn('Redis set error:', error.message);
    }
  }

  async delete(key) {
    if (!this.enabled) return;
    
    try {
      await this.client.del(`device:${key}`);
      console.log(`Removed device from cache: ${key}`);
    } catch (error) {
      console.warn('Redis delete error:', error.message);
    }
  }

  async disconnect() {
    if (this.enabled && this.client) {
      try {
        await this.client.quit();
        console.log('Redis connection closed');
      } catch (error) {
        console.warn('Redis disconnect error:', error.message);
      }
    }
  }
}

export default new RedisCache();