import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { order } from "@/db/schema/store";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Monobank Webhook Received:", body);

    const { reference, status } = body;

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // Monobank invoice statuses: created, processing, hold, success, failure, reversed, expired
    if (status === "success") {
      await db
        .update(order)
        .set({ paymentStatus: "paid", status: "processing" })
        .where(eq(order.id, reference));
    } else if (status === "failure" || status === "expired" || status === "reversed") {
      await db
        .update(order)
        .set({ status: "cancelled" })
        .where(eq(order.id, reference));
    }

    // Always respond 200 OK so Monobank stops retrying
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Monobank Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
