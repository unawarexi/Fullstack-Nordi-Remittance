// ============================================================================
// PRIORITY QUEUE (Min-Heap) — O(log n) insert/extract
// Used for alert prioritization, task scheduling, rate limiting
// ============================================================================

export class PriorityQueue<T> {
  private heap: T[] = [];

  constructor(private readonly cmp: (a: T, b: T) => number) {}

  get size(): number { return this.heap.length; }
  peek(): T | undefined { return this.heap[0]; }

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

  toArray(): T[] { return [...this.heap]; }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >>> 1;
      if (this.cmp(this.heap[i], this.heap[parent]) >= 0) break;
      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.cmp(this.heap[l], this.heap[smallest]) < 0) smallest = l;
      if (r < n && this.cmp(this.heap[r], this.heap[smallest]) < 0) smallest = r;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}
