// Mailchimp provider for newsletter signups. Swap this module to change provider;
// the API route only depends on `subscribe()` and `SubscribeError`.
import { createHash } from "node:crypto";

export type Signup = { email: string; phone?: string; source?: string };

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
  const phoneField = env.MAILCHIMP_PHONE_FIELD || "PHONE";

  const member: Record<string, unknown> = {
    email_address: signup.email,
    status_if_new: env.MAILCHIMP_DOUBLE_OPTIN === "true" ? "pending" : "subscribed",
    merge_fields: signup.phone ? { [phoneField]: signup.phone } : {},
  };
  if (signup.phone && env.MAILCHIMP_SMS === "true") {
    member.sms_phone_number = signup.phone;
    member.sms_subscription_status = "subscribed";
  }

  // PUT upserts, so returning fans don't get a "Member Exists" error.
  const res = await fetch(`${base}/${hash}`, { method: "PUT", headers, body: JSON.stringify(member) });
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
