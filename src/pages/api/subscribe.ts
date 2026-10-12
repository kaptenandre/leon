import type { APIRoute } from "astro";
import { subscribe, SubscribeError } from "../../lib/mailchimp";

export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Light normalisation: keep digits and a leading +, convert 00 prefix. */
function normalisePhone(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  let phone = trimmed.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  return phone;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const wantsJson = request.headers.get("accept")?.includes("application/json");
  const reply = (ok: boolean, error?: string, status = ok ? 200 : 400) =>
    wantsJson
      ? Response.json(ok ? { ok } : { ok, error }, { status })
      : redirect(ok ? "/?subscribed=1#newsletter" : `/?error=${encodeURIComponent(error ?? "")}#newsletter`, 303);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(false, "Invalid request.");
  }

  // Honeypot: pretend success so bots move on.
  if (String(form.get("company") ?? "").trim()) return reply(true);

  const email = String(form.get("email") ?? "").trim();
  const phoneRaw = String(form.get("phone") ?? "");
  const phone = normalisePhone(phoneRaw);
  const source = String(form.get("source") ?? "website").trim().slice(0, 40);

  if (!EMAIL.test(email) || email.length > 254) return reply(false, "Please enter a valid email.");
  if (phoneRaw.trim() && (!phone || !/^\+?\d{6,15}$/.test(phone))) {
    return reply(false, "Please enter a valid phone number.");
  }
  if (!form.get("consent")) return reply(false, "Please accept the terms to sign up.");

  try {
    await subscribe({ email, phone, source }, process.env);
    return reply(true);
  } catch (err) {
    if (err instanceof SubscribeError) return reply(false, err.message, err.status);
    console.error(err);
    return reply(false, "Something went wrong, please try again.", 500);
  }
};
