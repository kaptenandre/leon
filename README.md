# LÉON

Artist site for LÉON at https://leon.site. Astro on Netlify, same stack as grantissoindie.com: one centered column of buttons (current release, streaming, socials) plus email + SMS signup.

## Edit content

Everything lives in `src/site.ts`:

- `release`: release time (`outAt`), pre-save/smart link and optional video. Before `outAt` the top button reads "Pre-save" and flips to "Listen now" on its own at release time.
- `streaming` / `socials`: the Listen and Follow buttons.
- `background`: image or video (webm/mp4 + mobile version) behind everything.

## Signup (Mailchimp)

The form posts to `/api/subscribe` (Netlify function), which upserts the contact in Mailchimp with email, phone (E.164, merge field `PHONE`, also opted into Mailchimp SMS), country from the visitor's IP (merge field `COUNTRY`, plus `ip_signup` for Mailchimp's own location segments) and the tag `Hemsida`. If Mailchimp rejects the SMS opt-in, the email signup is kept. Set these in Netlify under Site configuration > Environment variables (see `.env.example`):

| Variable | |
| --- | --- |
| `MAILCHIMP_API_KEY` | API key, e.g. `xxxx-us21` |
| `MAILCHIMP_AUDIENCE_ID` | Audience ID |
| `MAILCHIMP_DOUBLE_OPTIN` | `true` = confirmation email first |
| `MAILCHIMP_SMS` | `true` = also opt the number into Mailchimp SMS |
| `MAILCHIMP_PHONE_FIELD` | Merge field for the number (default `PHONE`) |
| `MAILCHIMP_COUNTRY_FIELD` | Merge field for the country code (default `COUNTRY`) |
| `MAILCHIMP_TAGS` | Tags, comma separated (default `website`) |

The provider sits in `src/lib/mailchimp.ts`. Switching provider later means replacing that module only.

## Development

```sh
npm install
npm run dev     # http://localhost:4321
npm run check   # typecheck
npm run build
```
