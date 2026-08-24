"use server";

import "server-only";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/db";
import { user } from "@/db/schema/better-auth";

export async function updateProfileAction(formData: FormData) {
  const name = formData.get("name");

  if (typeof name !== "string" || !name.trim()) {
    return { success: false, error: "Ім'я обов'язкове" };
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return { success: false, error: "Не авторизовано" };
    }

    await db.update(user).set({ name: name.trim() }).where(eq(user.id, session.user.id));
    
    revalidatePath("/profile/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile", error);
    return { success: false, error: "Не вдалося оновити профіль" };
  }
}

