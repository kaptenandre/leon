import type { APIRoute } from "astro";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { subscribe, SubscribeError } from "../../lib/mailchimp";

export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NetlifyGeo = { country?: { code?: string }; latitude?: number; longitude?: number };
type NetlifyLocals = { netlify?: { context?: { geo?: NetlifyGeo; ip?: string } } };

export const POST: APIRoute = async ({ request, redirect, locals, clientAddress }) => {
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

  // Visitor country and IP from Netlify's edge, for segmentation and phone parsing.
  const ctx = (locals as NetlifyLocals).netlify?.context;
  const geoCountry = (ctx?.geo?.country?.code || request.headers.get("x-country") || "").toUpperCase();
  const country = /^[A-Z]{2}$/.test(geoCountry) ? geoCountry : undefined;
  // Approximate visitor location; lets Mailchimp fill its own Location (country + timezone).
  const { latitude, longitude } = ctx?.geo ?? {};
  const location =
    typeof latitude === "number" && typeof longitude === "number" ? { latitude, longitude } : undefined;
  let ip = ctx?.ip || request.headers.get("x-nf-client-connection-ip") || undefined;
  if (!ip) {
    try {
      ip = clientAddress;
    } catch {
      // Not available in every runtime.
    }
  }

  const email = String(form.get("email") ?? "").trim();
  const phoneRaw = String(form.get("phone") ?? "").trim();
  const source = String(form.get("source") ?? "website").trim().slice(0, 40);

  if (!EMAIL.test(email) || email.length > 254) return reply(false, "Please enter a valid email.");

  let phone: string | undefined;
  if (phoneRaw) {
    // Numbers without a country code are read as local to the visitor's country.
    const parsed = parsePhoneNumberFromString(phoneRaw.replace(/^00/, "+"), (country as CountryCode) || undefined);
    if (!parsed?.isValid()) return reply(false, "Please enter a valid phone number, including country code.");
    phone = parsed.number;
  }
  if (!form.get("consent")) return reply(false, "Please accept the terms to sign up.");

  try {
    await subscribe({ email, phone, country, location, ip, source }, process.env);
    return reply(true);
  } catch (err) {
    if (err instanceof SubscribeError) return reply(false, err.message, err.status);
    console.error(err);
    return reply(false, "Something went wrong, please try again.", 500);
  }
};
