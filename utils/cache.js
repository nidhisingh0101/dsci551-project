export class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }
  
    get(key) {
        console.log(this.cache)
        if (this.cache.has(key)) {
            // Reinsert the key to make it the most recently used
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return false;
    }

    delete(key) {
        this.cache.delete(key)
    }
  
    put(key, value) {
        console.log(this.cache)
        if (this.cache.has(key)) {
            this.cache.delete(key); // Remove existing entry to reinsert it
        } else if (this.cache.size >= this.capacity) {
            // Remove the least recently used entry if the cache is full
            const lruKey = this.cache.keys().next().value;
            this.cache.delete(lruKey);
        }
        this.cache.set(key, value);
        console.log(this.cache)
    }

    contains(key) {
        return this.cache.has(key)
    }
}
  
  