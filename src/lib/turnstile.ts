/**
 * Verifies a Cloudflare Turnstile token natively via fetch.
 */
export async function verifyTurnstileToken(token: string | null | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn("TURNSTILE_SECRET_KEY is missing. Skipping verification.");
    return true; // Fail open if not configured for local dev
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Turnstile API error:", await res.text());
      return false;
    }

    const data = await res.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}
