# Vinicius & Irish — wedding invitation

The invitation is a Vite/React site hosted on Cloudflare Pages. Its wedding-day guestbook uses:

- Cloudflare Pages Functions for the small backend API
- TiDB Cloud for private messages, moderation state, and photo metadata
- ImgBB for the uploaded image files

Guest messages remain private. Photos appear on the public wedding wall only after approval.

## Local development

```bash
npm install
npm run dev
```

The regular invitation is at `http://localhost:3500`. The QR experience can be previewed at:

```text
http://localhost:3500/?guestbook=YOUR_EVENT_CODE#section-guestbook
```

Vite does not run Cloudflare Pages Functions by itself. Use a deployed preview for an end-to-end upload test.

## One-time setup

### 1. TiDB Cloud

1. Create a TiDB Cloud Starter cluster and a database.
2. Open the TiDB SQL editor and run [`schema.sql`](./schema.sql). If you already ran the earlier six-column schema, run [`schema-upgrade.sql`](./schema-upgrade.sql) once instead.
3. Copy the connection string. Keep TLS enabled.

The schema is ordinary MySQL-compatible SQL and avoids TiDB-specific features. To migrate later, create the same table on another MySQL-compatible host and export/import the `submissions` rows with standard SQL tools.

The schedule in `guestbook_settings` is stored in UTC. If the submissions table already exists, run [`guestbook-settings.sql`](./guestbook-settings.sql) to add only this new table. Edit its single row whenever the timing changes:

If `guestbook_settings` was created before the automatic-approval option was added, run [`auto-approve-upgrade.sql`](./auto-approve-upgrade.sql) once. The admin page can then switch automatic approval on or off.

```sql
SET time_zone = '+00:00';

UPDATE guestbook_settings
SET submissions_open_at = '2026-08-12 00:00:00',
    submissions_close_at = '2026-08-13 00:00:00'
WHERE id = 1;
```

Those example UTC values correspond to 9:00 AM on August 12 through 9:00 AM on August 13 in Japan. Set a value to `NULL` to remove that limit.

### 2. ImgBB

1. Create an ImgBB account and API key.
2. Keep the key private; the browser never receives it.

ImgBB stores the image files. TiDB stores only each image URL and ImgBB deletion URL. This keeps database storage small, but ImgBB is still a third-party dependency—download a backup of approved wedding photos after the event.

### 3. Cloudflare Pages

Use these build settings:

```text
Build command: npm run build
Build output directory: dist
```

In **Workers & Pages → your project → Settings → Variables and Secrets**, add these as encrypted secrets for both Preview and Production:

```text
TIDB_DATABASE_URL
IMGBB_API_KEY
EVENT_CODE
ADMIN_TOKEN
```

Use two different long random values for `EVENT_CODE` and `ADMIN_TOKEN`. An example variable file is in [`.env.example`](./.env.example), but real secrets must never be committed.

The included `public/_routes.json` makes only `/api/*` invoke a Pages Function; the invitation assets remain static.

## Wedding-day links

Encode this URL in the guest QR code:

```text
https://YOUR-DOMAIN/?guestbook=YOUR_EVENT_CODE#section-guestbook
```

The event code is an invitation gate, not account-grade authentication. Anyone who receives the QR link can submit.

Open moderation from a trusted device at:

```text
https://YOUR-DOMAIN/?admin=1#section-guestbook
```

Enter `ADMIN_TOKEN` when prompted. Approving a submission publishes its photos; the groom's message is never returned by the public gallery API.

## Checks

```bash
npm run lint
npm test
npm run build
```

Before the wedding, submit one real photo on the production link, approve it in the moderation view, confirm it appears on the wedding wall, and then reject or remove the test entry.
