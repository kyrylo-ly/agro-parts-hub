import "server-only";

import { createVerify } from "crypto";

let cachedPubKey: string | null = null;
let cachedAt = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch Monobank merchant public key (ECDSA P-256).
 * Cached in-memory for 24h to avoid redundant API calls.
 */
async function getMonobankPublicKey(): Promise<string> {
  if (cachedPubKey && Date.now() - cachedAt < CACHE_TTL) {
    return cachedPubKey;
  }

  const monoToken = process.env.MONO_TOKEN;
  if (!monoToken) {
    throw new Error("MONO_TOKEN is not set");
  }

  const res = await fetch("https://api.monobank.ua/api/merchant/pubkey", {
    headers: { "X-Token": monoToken },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Monobank public key: ${res.status}`);
  }

  const data = await res.json();
  const pemKey = data.key;

  if (!pemKey) {
    throw new Error("Monobank returned empty public key");
  }

  cachedPubKey = pemKey;
  cachedAt = Date.now();
  return pemKey;
}

/**
 * Verify Monobank X-Sign header.
 * The signature is a Base64-encoded ECDSA-SHA256 signature of the raw body.
 */
export async function verifyMonobankSignature(
  bodyText: string,
  xSign: string | null
): Promise<boolean> {
  if (!xSign) return false;

  try {
    const publicKey = await getMonobankPublicKey();
    const verify = createVerify("SHA256");
    verify.update(bodyText);
    verify.end();
    return verify.verify(publicKey, xSign, "base64");
  } catch (error) {
    console.error("Monobank signature verification error:", error);
    return false;
  }
}
