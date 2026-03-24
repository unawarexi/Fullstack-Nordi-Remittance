// ============================================================================
// TRIE (Prefix Tree) — O(k) lookup / autocomplete (k = key length)
// Used for: account number lookup, SWIFT/BIC code search, name autocomplete
// ============================================================================

interface TrieNode<V> {
  children: Map<string, TrieNode<V>>;
  value?: V;
  isEnd: boolean;
}

export class Trie<V = boolean> {
  private root: TrieNode<V> = { children: new Map(), isEnd: false };
  private count = 0;

  get size(): number { return this.count; }

  insert(key: string, value: V = true as unknown as V): void {
    let node = this.root;
    for (const ch of key) {
      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), isEnd: false });
      }
      node = node.children.get(ch)!;
    }
    if (!node.isEnd) this.count++;
    node.isEnd = true;
    node.value = value;
  }

  search(key: string): V | undefined {
    const node = this.traverse(key);
    return node?.isEnd ? node.value : undefined;
  }

  has(key: string): boolean {
    const node = this.traverse(key);
    return !!node?.isEnd;
  }

  startsWith(prefix: string): boolean {
    return !!this.traverse(prefix);
  }

  /** Return up to `limit` keys matching `prefix`. */
  autocomplete(prefix: string, limit = 10): Array<{ key: string; value: V }> {
    const node = this.traverse(prefix);
    if (!node) return [];
    const results: Array<{ key: string; value: V }> = [];
    this.collect(node, prefix, results, limit);
    return results;
  }

  delete(key: string): boolean {
    return this.deleteRecursive(this.root, key, 0);
  }

  // ---- internals ----

  private traverse(key: string): TrieNode<V> | undefined {
    let node: TrieNode<V> | undefined = this.root;
    for (const ch of key) {
      node = node.children.get(ch);
      if (!node) return undefined;
    }
    return node;
  }

  private collect(
    node: TrieNode<V>,
    prefix: string,
    results: Array<{ key: string; value: V }>,
    limit: number,
  ): void {
    if (results.length >= limit) return;
    if (node.isEnd) results.push({ key: prefix, value: node.value! });
    for (const [ch, child] of node.children) {
      this.collect(child, prefix + ch, results, limit);
      if (results.length >= limit) return;
    }
  }

  private deleteRecursive(node: TrieNode<V>, key: string, depth: number): boolean {
    if (depth === key.length) {
      if (!node.isEnd) return false;
      node.isEnd = false;
      node.value = undefined;
      this.count--;
      return node.children.size === 0;
    }
    const ch = key[depth];
    const child = node.children.get(ch);
    if (!child) return false;
    const shouldDeleteChild = this.deleteRecursive(child, key, depth + 1);
    if (shouldDeleteChild) node.children.delete(ch);
    return !node.isEnd && node.children.size === 0;
  }
}
