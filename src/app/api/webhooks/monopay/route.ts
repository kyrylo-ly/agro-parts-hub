import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { order } from "@/db/schema/store";
import { eq } from "drizzle-orm";
import { verifyMonobankSignature } from "@/lib/monopay";

export async function POST(req: Request) {
  try {
    const xSign = req.headers.get("x-sign");
    const bodyText = await req.text();

    // Verify Monobank signature
    const isValid = await verifyMonobankSignature(bodyText, xSign);
    if (!isValid) {
      console.warn("Monobank Webhook: Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const body = JSON.parse(bodyText);
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
