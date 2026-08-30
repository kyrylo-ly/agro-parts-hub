"use server";

import { revalidatePath } from "next/cache";
import { type BrandInput } from "@/entities/brand";
import { requireAdmin } from "./admin-auth";
import { createBrandUseCase, updateBrandUseCase, deleteBrandUseCase } from "@/use-cases/brands";

export async function createBrand(input: BrandInput) {
  try {
    await requireAdmin();
    const result = await createBrandUseCase(input);
    if (result.success) {
      revalidatePath("/admin/brands");
    }
    return result;
  } catch (error) {
    console.error("Failed to create brand:", error);
    return { success: false as const, error: "Failed to create brand" };
  }
}

export async function updateBrand(id: number, input: BrandInput) {
  try {
    await requireAdmin();
    const result = await updateBrandUseCase(id, input);
    if (result.success) {
      revalidatePath("/admin/brands");
    }
    return result;
  } catch (error) {
    console.error("Failed to update brand:", error);
    return { success: false as const, error: "Failed to update brand" };
  }
}

export async function deleteBrand(id: number) {
  try {
    await requireAdmin();
    const result = await deleteBrandUseCase(id);
    if (result.success) {
      revalidatePath("/admin/brands");
    }
    return result;
  } catch (error) {
    console.error("Failed to delete brand:", error);
    return { success: false as const, error: "Failed to delete brand" };
  }
}
