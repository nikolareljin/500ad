/**
 * Performance Monitoring and Optimization Utilities
 * Provides profiling, caching, and debug tools for large world performance
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.enabled = false;
        this.frameTimings = [];
        this.maxFrameTimings = 60;
    }

    enable() {
        this.enabled = true;
        console.log('Performance monitoring enabled');
    }

    disable() {
        this.enabled = false;
    }

    startTimer(label) {
        if (!this.enabled) return null;
        return {
            label,
            start: performance.now()
        };
    }

    endTimer(timer) {
        if (!this.enabled || !timer) return;
        const duration = performance.now() - timer.start;
        
        if (!this.metrics[timer.label]) {
            this.metrics[timer.label] = {
                count: 0,
                total: 0,
                min: Infinity,
                max: 0,
                avg: 0
            };
        }

        const metric = this.metrics[timer.label];
        metric.count++;
        metric.total += duration;
        metric.min = Math.min(metric.min, duration);
        metric.max = Math.max(metric.max, duration);
        metric.avg = metric.total / metric.count;
    }

    recordFrame(duration) {
        if (!this.enabled) return;
        this.frameTimings.push(duration);
        if (this.frameTimings.length > this.maxFrameTimings) {
            this.frameTimings.shift();
        }
    }

    getMetrics() {
        return { ...this.metrics };
    }

    getFrameStats() {
        if (this.frameTimings.length === 0) return null;
        
        const sorted = [...this.frameTimings].sort((a, b) => a - b);
        return {
            avg: this.frameTimings.reduce((a, b) => a + b, 0) / this.frameTimings.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            p50: sorted[Math.floor(sorted.length * 0.5)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)],
            fps: 1000 / (this.frameTimings.reduce((a, b) => a + b, 0) / this.frameTimings.length)
        };
    }

    reset() {
        this.metrics = {};
        this.frameTimings = [];
    }

    printReport() {
        console.log('=== Performance Report ===');
        console.log('Metrics:');
        Object.entries(this.metrics).forEach(([label, metric]) => {
            console.log(`  ${label}:`);
            console.log(`    Count: ${metric.count}`);
            console.log(`    Avg: ${metric.avg.toFixed(2)}ms`);
            console.log(`    Min: ${metric.min.toFixed(2)}ms`);
            console.log(`    Max: ${metric.max.toFixed(2)}ms`);
        });

        const frameStats = this.getFrameStats();
        if (frameStats) {
            console.log('Frame Stats:');
            console.log(`  FPS: ${frameStats.fps.toFixed(1)}`);
            console.log(`  Avg: ${frameStats.avg.toFixed(2)}ms`);
            console.log(`  P50: ${frameStats.p50.toFixed(2)}ms`);
            console.log(`  P95: ${frameStats.p95.toFixed(2)}ms`);
            console.log(`  P99: ${frameStats.p99.toFixed(2)}ms`);
        }
    }
}

class RenderCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.hits = 0;
        this.misses = 0;
    }

    get(key) {
        if (this.cache.has(key)) {
            this.hits++;
            const entry = this.cache.get(key);
            entry.lastAccess = Date.now();
            return entry.value;
        }
        this.misses++;
        return null;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }
        this.cache.set(key, {
            value,
            lastAccess: Date.now()
        });
    }

    evictOldest() {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccess < oldestTime) {
                oldestTime = entry.lastAccess;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    getStats() {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? (this.hits / total * 100).toFixed(1) + '%' : 'N/A'
        };
    }
}

class ChunkManager {
    constructor(chunkSize = 32) {
        this.chunkSize = chunkSize;
        this.chunks = new Map();
        this.dirtyChunks = new Set();
    }

    getChunkKey(x, y) {
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkY = Math.floor(y / this.chunkSize);
        return `${chunkX},${chunkY}`;
    }

    getChunk(x, y) {
        const key = this.getChunkKey(x, y);
        return this.chunks.get(key);
    }

    setChunk(x, y, data) {
        const key = this.getChunkKey(x, y);
        this.chunks.set(key, data);
    }

    markDirty(x, y) {
        const key = this.getChunkKey(x, y);
        this.dirtyChunks.add(key);
    }

    getDirtyChunks() {
        return Array.from(this.dirtyChunks);
    }

    clearDirty() {
        this.dirtyChunks.clear();
    }

    getVisibleChunks(viewX, viewY, viewWidth, viewHeight) {
        const chunks = [];
        const startChunkX = Math.floor(viewX / this.chunkSize);
        const startChunkY = Math.floor(viewY / this.chunkSize);
        const endChunkX = Math.ceil((viewX + viewWidth) / this.chunkSize);
        const endChunkY = Math.ceil((viewY + viewHeight) / this.chunkSize);

        for (let cy = startChunkY; cy <= endChunkY; cy++) {
            for (let cx = startChunkX; cx <= endChunkX; cx++) {
                const key = `${cx},${cy}`;
                chunks.push(key);
            }
        }

        return chunks;
    }
}

// Global instances
const perfMonitor = new PerformanceMonitor();
const renderCache = new RenderCache(4000);
const chunkManager = new ChunkManager(32);

// Expose to window for debugging
if (typeof window !== 'undefined') {
    window.perfMonitor = perfMonitor;
    window.renderCache = renderCache;
    window.chunkManager = chunkManager;
    window.enablePerformanceMonitoring = () => perfMonitor.enable();
    window.disablePerformanceMonitoring = () => perfMonitor.disable();
    window.getPerformanceReport = () => perfMonitor.printReport();
    window.getRenderCacheStats = () => renderCache.getStats();
}
