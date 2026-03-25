// ============================================================================
// SORT ALGORITHMS — Stable sorts for financial data tables
// ============================================================================

type CompareFn<T> = (a: T, b: T) => number;

/**
 * Merge sort — stable O(n log n).
 * Critical for financial tables where equal-value rows must retain order.
 */
export function mergeSort<T>(arr: T[], compareFn: CompareFn<T>): T[] {
  if (arr.length <= 1) return arr;
  const mid = arr.length >>> 1;
  const left = mergeSort(arr.slice(0, mid), compareFn);
  const right = mergeSort(arr.slice(mid), compareFn);
  return merge(left, right, compareFn);
}

function merge<T>(left: T[], right: T[], compareFn: CompareFn<T>): T[] {
  const result: T[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (compareFn(left[i], right[j]) <= 0) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

/**
 * Multi-key sort — sort by primary key, then secondary, etc.
 * e.g. sort transactions by date DESC, then amount DESC.
 */
export function multiKeySort<T>(
  arr: T[],
  keys: { getter: (item: T) => string | number | Date; direction: "asc" | "desc" }[],
): T[] {
  const compareFn: CompareFn<T> = (a, b) => {
    for (const { getter, direction } of keys) {
      const va = getter(a);
      const vb = getter(b);
      let cmp: number;

      if (va instanceof Date && vb instanceof Date) {
        cmp = va.getTime() - vb.getTime();
      } else if (typeof va === "number" && typeof vb === "number") {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb));
      }

      if (cmp !== 0) return direction === "desc" ? -cmp : cmp;
    }
    return 0;
  };

  return mergeSort(arr, compareFn);
}

/**
 * Top-K selection — efficiently get the K largest/smallest items.
 * O(n log k) — ideal for "top 10 transactions", "highest balances".
 */
export function topK<T>(arr: T[], k: number, compareFn: CompareFn<T>): T[] {
  if (k >= arr.length) return mergeSort(arr, compareFn);

  // Min-heap approach for top-K largest
  const heap = arr.slice(0, k);
  heap.sort(compareFn);

  for (let i = k; i < arr.length; i++) {
    if (compareFn(arr[i], heap[0]) > 0) {
      heap[0] = arr[i];
      // Re-sort (sift down) — for small k this is efficient
      heap.sort(compareFn);
    }
  }

  return heap;
}

/**
 * Create a reusable comparator for common field types.
 */
export function createComparator<T>(
  getter: (item: T) => string | number | Date,
  direction: "asc" | "desc" = "asc",
): CompareFn<T> {
  return (a, b) => {
    const va = getter(a);
    const vb = getter(b);
    let cmp: number;

    if (va instanceof Date && vb instanceof Date) {
      cmp = va.getTime() - vb.getTime();
    } else if (typeof va === "number" && typeof vb === "number") {
      cmp = va - vb;
    } else {
      cmp = String(va).localeCompare(String(vb));
    }

    return direction === "desc" ? -cmp : cmp;
  };
}
