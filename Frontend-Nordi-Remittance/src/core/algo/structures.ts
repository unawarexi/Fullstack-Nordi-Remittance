// ============================================================================
// DATA STRUCTURES — Reusable structures for banking frontend
// ============================================================================

/**
 * LRU Cache — Least Recently Used eviction.
 * Use for caching API responses, exchange rates, or user lookups client-side.
 * O(1) get/set via Map + doubly-linked list behavior from Map ordering.
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();

  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      // Evict least recently used (first entry)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  entries(): IterableIterator<[K, V]> {
    return this.cache.entries();
  }
}

/**
 * Priority Queue (min-heap) — useful for scheduling, alerts ranking.
 * O(log n) insert/extract.
 */
export class PriorityQueue<T> {
  private heap: T[] = [];

  constructor(private readonly compareFn: (a: T, b: T) => number) {}

  get size(): number {
    return this.heap.length;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  push(value: T): void {
    this.heap.push(value);
    this.siftUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >>> 1;
      if (this.compareFn(this.heap[i], this.heap[parent]) >= 0) break;
      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.compareFn(this.heap[left], this.heap[smallest]) < 0)
        smallest = left;
      if (right < n && this.compareFn(this.heap[right], this.heap[smallest]) < 0)
        smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}

/**
 * Trie — prefix tree for fast autocomplete.
 * Use for user name suggestions, currency code lookup, country search.
 */
export class Trie {
  private root: TrieNode = { children: new Map(), isEnd: false, data: [] };

  insert(word: string, data?: unknown): void {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, { children: new Map(), isEnd: false, data: [] });
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
    if (data !== undefined) node.data.push(data);
  }

  search(prefix: string, limit = 10): { word: string; data: unknown[] }[] {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children.has(char)) return [];
      node = node.children.get(char)!;
    }
    return this.collect(node, prefix.toLowerCase(), limit);
  }

  private collect(
    node: TrieNode,
    prefix: string,
    limit: number,
  ): { word: string; data: unknown[] }[] {
    const results: { word: string; data: unknown[] }[] = [];

    if (node.isEnd) {
      results.push({ word: prefix, data: node.data });
    }

    if (results.length >= limit) return results;

    for (const [char, child] of node.children) {
      results.push(...this.collect(child, prefix + char, limit - results.length));
      if (results.length >= limit) break;
    }

    return results;
  }
}

interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  data: unknown[];
}

/**
 * Sliding Window Counter — for client-side rate limiting / throttling.
 * Tracks event counts within a sliding time window.
 */
export class SlidingWindowCounter {
  private timestamps: number[] = [];

  constructor(
    private readonly windowMs: number,
    private readonly maxEvents: number,
  ) {}

  /**
   * Record an event. Returns true if the event is allowed (under limit).
   */
  record(): boolean {
    const now = Date.now();
    this.prune(now);
    if (this.timestamps.length >= this.maxEvents) return false;
    this.timestamps.push(now);
    return true;
  }

  /**
   * Check if an event would be allowed without recording it.
   */
  canProceed(): boolean {
    this.prune(Date.now());
    return this.timestamps.length < this.maxEvents;
  }

  get count(): number {
    this.prune(Date.now());
    return this.timestamps.length;
  }

  reset(): void {
    this.timestamps = [];
  }

  private prune(now: number): void {
    const cutoff = now - this.windowMs;
    // Binary search for the first timestamp within the window
    let lo = 0;
    let hi = this.timestamps.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.timestamps[mid] <= cutoff) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) this.timestamps = this.timestamps.slice(lo);
  }
}
