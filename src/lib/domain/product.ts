export function isNewProduct(createdAt: Date): boolean {
  const fourteenDaysAgo = new Date();
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
