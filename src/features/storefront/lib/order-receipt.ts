const ORDER_RECEIPT_STORAGE_KEY = 'trendingnow.order-receipt';
let inMemoryReceipt: StoredOrderReceipt | null = null;

type StoredOrderReceipt = {
  publicCode: string;
  issuedAt: number;
};

export function rememberOrderReceipt(publicCode: string): void {
  if (typeof window === 'undefined' || !publicCode.trim()) return;

  const receipt: StoredOrderReceipt = {
    publicCode: publicCode.trim(),
    issuedAt: Date.now(),
  };
  inMemoryReceipt = receipt;
  try {
    window.sessionStorage.setItem(ORDER_RECEIPT_STORAGE_KEY, JSON.stringify(receipt));
  } catch {
    // Private browsing or a full storage quota must not turn a successful API response into a client error.
  }
}

export function hasOrderReceipt(publicCode: string): boolean {
  if (typeof window === 'undefined' || !publicCode.trim()) return false;

  if (inMemoryReceipt?.publicCode === publicCode.trim()) return true;

  try {
    const stored = JSON.parse(window.sessionStorage.getItem(ORDER_RECEIPT_STORAGE_KEY) ?? 'null') as Partial<StoredOrderReceipt> | null;
    return stored?.publicCode === publicCode.trim() && typeof stored.issuedAt === 'number';
  } catch {
    return false;
  }
}
