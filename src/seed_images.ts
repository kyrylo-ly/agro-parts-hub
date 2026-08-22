import { db } from "./db/db";
import { category, brand, product, productImage } from "./db/schema/store";
import { eq, isNotNull } from "drizzle-orm";

async function main() {
  console.log("Seeding category images...");
  const categories = await db.select().from(category);
  for (const cat of categories) {
    const productsInCat = await db.select({ id: product.id }).from(product).where(eq(product.categoryId, cat.id));
    let imageUrl = null;
    for (const prod of productsInCat) {
      const images = await db.select().from(productImage).where(eq(productImage.productId, prod.id));
      if (images.length > 0) {
        imageUrl = images[0].url;
        break;
      }
    }
    if (imageUrl) {
      await db.update(category).set({ imageUrl }).where(eq(category.id, cat.id));
      console.log(`Updated category ${cat.name} with image ${imageUrl}`);
    } else {
      console.log(`No image found for category ${cat.name}`);
    }
  }

  console.log("Seeding brand images...");
  const brands = await db.select().from(brand);
  for (const br of brands) {
    const productsInBrand = await db.select({ id: product.id }).from(product).where(eq(product.brandId, br.id));
    let imageUrl = null;
    for (const prod of productsInBrand) {
      const images = await db.select().from(productImage).where(eq(productImage.productId, prod.id));
      if (images.length > 0) {
        imageUrl = images[0].url;
        break;
      }
    }
    if (imageUrl) {
      await db.update(brand).set({ imageUrl }).where(eq(brand.id, br.id));
      console.log(`Updated brand ${br.name} with image ${imageUrl}`);
    } else {
      console.log(`No image found for brand ${br.name}`);
    }
  }
  
  console.log("Done seeding images!");
}

main().catch(console.error).finally(() => process.exit(0));
