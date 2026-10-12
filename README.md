# LÉON

Artist site for LÉON. Astro on Netlify, same setup as grantissoindie.com: one page with the current release, streaming links, email + SMS signup and socials.

## Edit content

Everything lives in `src/site.ts`:

- `release`: title, type, release time (`outAt`), pre-save/smart link, video and platform links. Before `outAt` the button reads "Pre-save" and flips to "Listen" on its own at release time.
- `streaming` / `socials`: the links in the footer.
- `background`: image or video (webm/mp4 + mobile version) behind everything.

## Signup (Mailchimp)

The form posts to `/api/subscribe` (Netlify function), which upserts the contact in Mailchimp with email, phone (merge field `PHONE`) and the tag `website`. Set these in Netlify under Site configuration > Environment variables (see `.env.example`):

| Variable | |
| --- | --- |
| `MAILCHIMP_API_KEY` | API key, e.g. `xxxx-us21` |
| `MAILCHIMP_AUDIENCE_ID` | Audience ID |
| `MAILCHIMP_DOUBLE_OPTIN` | `true` = confirmation email first |
| `MAILCHIMP_SMS` | `true` = also opt the number into Mailchimp SMS |
| `MAILCHIMP_PHONE_FIELD` | Merge field for the number (default `PHONE`) |
| `MAILCHIMP_TAGS` | Tags, comma separated (default `website`) |

The provider sits in `src/lib/mailchimp.ts`. Switching provider later means replacing that module only.

## Development

```sh
npm install
npm run dev     # http://localhost:4321
npm run check   # typecheck
npm run build
```
