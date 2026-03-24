// ============================================================================
// BLOOM FILTER — Probabilistic set membership (no false negatives)
// Used for: blacklist checking, duplicate transaction detection, AML screening
// ============================================================================

export class BloomFilter {
  private bits: Uint8Array;
  private readonly numHashes: number;
  private readonly numBits: number;

  constructor(expectedItems: number, falsePositiveRate = 0.01) {
    this.numBits = Math.ceil(
      -(expectedItems * Math.log(falsePositiveRate)) / (Math.LN2 * Math.LN2),
    );
    this.numHashes = Math.ceil((this.numBits / expectedItems) * Math.LN2);
    this.bits = new Uint8Array(Math.ceil(this.numBits / 8));
  }

  add(item: string): void {
    for (const idx of this.hashes(item)) {
      this.bits[idx >>> 3] |= 1 << (idx & 7);
    }
  }

  /** Returns true if item *may* exist; false means *definitely not* present. */
  test(item: string): boolean {
    for (const idx of this.hashes(item)) {
      if ((this.bits[idx >>> 3] & (1 << (idx & 7))) === 0) return false;
    }
    return true;
  }

  /** Export filter state for persistence / sharing. */
  serialize(): { bits: number[]; numBits: number; numHashes: number } {
    return {
      bits: Array.from(this.bits),
      numBits: this.numBits,
      numHashes: this.numHashes,
    };
  }

  static deserialize(data: {
    bits: number[];
    numBits: number;
    numHashes: number;
  }): BloomFilter {
    const bf = Object.create(BloomFilter.prototype) as BloomFilter;
    (bf as any).bits = new Uint8Array(data.bits);
    (bf as any).numBits = data.numBits;
    (bf as any).numHashes = data.numHashes;
    return bf;
  }

  // ---- FNV-1a based double hashing ----
  private *hashes(item: string): Generator<number> {
    const h1 = BloomFilter.fnv1a(item);
    const h2 = BloomFilter.fnv1a(item + '\x00');
    for (let i = 0; i < this.numHashes; i++) {
      yield Math.abs((h1 + i * h2) % this.numBits);
    }
  }

  private static fnv1a(str: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) | 0;
    }
    return hash >>> 0;
  }
}
