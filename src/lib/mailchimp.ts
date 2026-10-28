// Mailchimp provider for newsletter signups. Swap this module to change provider;
// the API route only depends on `subscribe()` and `SubscribeError`.
import { createHash } from "node:crypto";

export type Signup = {
  email: string;
  /** E.164, e.g. +46701234567 */
  phone?: string;
  /** ISO 3166-1 alpha-2 from the visitor's IP, e.g. "SE" */
  country?: string;
  /** Approximate coordinates from the visitor's IP; Mailchimp derives country and timezone. */
  location?: { latitude: number; longitude: number };
  ip?: string;
  source?: string;
};

export class SubscribeError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type Env = Record<string, string | undefined>;

export async function subscribe(signup: Signup, env: Env): Promise<void> {
  const apiKey = env.MAILCHIMP_API_KEY;
  const audienceId = env.MAILCHIMP_AUDIENCE_ID;
  const dc = apiKey?.split("-")[1];
  if (!apiKey || !audienceId || !dc) {
    console.error("Mailchimp is not configured (MAILCHIMP_API_KEY / MAILCHIMP_AUDIENCE_ID).");
    throw new SubscribeError("Signup is not available right now.", 500);
  }

  const base = `https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members`;
  const hash = createHash("md5").update(signup.email.toLowerCase()).digest("hex");
  const headers = {
    Authorization: `Basic ${btoa(`anystring:${apiKey}`)}`,
    "Content-Type": "application/json",
  };

  const mergeFields: Record<string, string> = {};
  if (signup.phone) mergeFields[env.MAILCHIMP_PHONE_FIELD || "PHONE"] = signup.phone;
  if (signup.country) mergeFields[env.MAILCHIMP_COUNTRY_FIELD || "COUNTRY"] = signup.country;

  const member: Record<string, unknown> = {
    email_address: signup.email,
    status_if_new: env.MAILCHIMP_DOUBLE_OPTIN === "true" ? "pending" : "subscribed",
    merge_fields: mergeFields,
  };
  if (signup.ip) member.ip_signup = signup.ip;
  // Mailchimp does not geolocate ip_signup from the API; coordinates fill its Location segments.
  if (signup.location) member.location = signup.location;

  const withSms = !!signup.phone && env.MAILCHIMP_SMS === "true";
  const put = (body: Record<string, unknown>) =>
    fetch(`${base}/${hash}`, { method: "PUT", headers, body: JSON.stringify(body) });

  // PUT upserts, so returning fans don't get a "Member Exists" error.
  let res = await put(
    withSms ? { ...member, sms_phone_number: signup.phone, sms_subscription_status: "subscribed" } : member,
  );
  if (!res.ok && withSms) {
    // SMS can be rejected (no SMS program for that country, etc). Keep the email signup.
    const body = (await res.json().catch(() => ({}))) as { title?: string; detail?: string };
    console.error("Mailchimp SMS rejected, retrying without SMS", res.status, body.title, body.detail);
    res = await put(member);
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { title?: string; detail?: string };
    console.error("Mailchimp error", res.status, body.title, body.detail);
    if (body.title === "Forgotten Email Not Subscribed") {
      throw new SubscribeError("This email was unsubscribed earlier and can't be re-added here.");
    }
    if (body.title === "Invalid Resource") {
      throw new SubscribeError("Please check your email and phone number.");
    }
    throw new SubscribeError("Something went wrong, please try again.", 502);
  }

  const tags = [...(env.MAILCHIMP_TAGS || "website").split(","), signup.source]
    .map((t) => t?.trim())
    .filter((t, i, all): t is string => !!t && all.indexOf(t) === i);
  if (tags.length) {
    await fetch(`${base}/${hash}/tags`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tags: tags.map((name) => ({ name, status: "active" })) }),
    }).catch((err) => console.error("Mailchimp tag error", err));
  }
}
