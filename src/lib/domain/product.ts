export function isNewProduct(createdAt: Date): boolean {
  // Use performance.timeOrigin to avoid Next.js prerender block on new Date()
  const nowMs = typeof performance !== 'undefined' && performance.timeOrigin 
    ? performance.timeOrigin + performance.now() 
    : Date.now(); // Fallback if Date.now is somehow not blocked or in client
  
  const fourteenDaysAgo = new Date(nowMs);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  return createdAt > fourteenDaysAgo;
}

export function calculateDiscount(price: string, compareAtPrice: string): number {
  const p = parseFloat(price);
  const cp = parseFloat(compareAtPrice);
  if (cp <= 0 || p >= cp) return 0;
  return Math.round(((cp - p) / cp) * 100);
}

export function formatPrice(price: string | number): string {
  const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;
  return parsedPrice.toLocaleString("uk-UA");
}
