# M.I. Engineering Works — Fasteners Website

Full-stack website + private admin dashboard for **M.I. Engineering Works**, Mumbai (industrial fasteners — MS, SS, Brass, Aluminium, hex bolts, foundation bolts, anchor bolts, U-bolts, J-bolts and custom hardware).

---

## Tech Stack

- **Frontend** — React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query + React Router (wouter compatible)
- **Backend** — Express (Node.js) serving the same port as Vite in dev
- **Database** — PostgreSQL via Drizzle ORM (schema in `shared/schema.ts`)
- **Auth** — JWT bearer tokens (12-hour expiry) for the admin area
- **Email** — Nodemailer (SMTP) for the public contact form

---

## Local Development

```bash
npm install
npm run db:push       # sync schema to your Postgres
npm run dev           # starts Vite + Express on :5000
```

App will be live at <http://localhost:5000>. The admin panel is at `/admin/login`.

> The Replit workflow named **"Start application"** runs `npm run dev` automatically.

---

## Required Environment Variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | Postgres connection string | `postgres://user:pass@host:5432/dbname` |
| `JWT_SECRET` | Sign admin login JWTs (use a long random string) | `change-me-to-64-random-chars` |
| `ADMIN_USERNAME` | Comma-separated admin emails / usernames | `owner@miengineeringworks.com` |
| `ADMIN_PASSWORD` | Initial admin password (default `6392061892` if unset) | `your-strong-password` |
| `SMTP_HOST` | SMTP server for contact-form emails | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP login | `notify@miengineeringworks.com` |
| `SMTP_PASS` | SMTP password / app password | `…` |
| `SMTP_FROM` | "From" address shown on emails | `M.I. Engineering Works <notify@miengineeringworks.com>` |
| `NODE_ENV` | `development` or `production` | `production` |
| `PORT` | Web port (defaults to `5000`) | `5000` |

Create a `.env` file at the project root for local dev. **Do not commit `.env`.**

---

## Production Build

```bash
npm run build         # builds the React client into dist/public + bundles the server
npm start             # runs the production server (Express serves the built client)
```

The production server is a **single Node process** listening on `PORT` (defaults to `5000`) that serves both the static frontend assets and the `/api/*` JSON endpoints.

---

## Deploying

This is a **dynamic Node.js + PostgreSQL** application. It cannot be deployed as a pure static site (Netlify free / Vercel static hosting), because the admin dashboard, ledger, contact form and content APIs all need a live server and database.

### Option A — Replit Deployments (recommended, one-click)

1. Open the project on Replit.
2. Click **Deploy** in the top-right.
3. Choose **Reserved VM** (always-on) or **Autoscale**.
4. Replit will use `npm run build` and `npm start` automatically.
5. Add the environment variables listed above in the **Secrets** panel before deploying.

### Option B — Render.com / Railway.app / Fly.io

1. Create a new **Web Service** from this repository.
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Add the environment variables from the table above.
5. Provision a managed Postgres database and paste the connection string into `DATABASE_URL`.
6. Run `npm run db:push` once after first deploy (Render/Railway both expose a shell or "post-deploy" hook).

### Option C — VPS / Self-hosted (DigitalOcean, AWS EC2, Hetzner, …)

```bash
# on the server
git clone <your-repo-url> mi-website && cd mi-website
npm install
npm run build

# create .env with the required variables
nano .env

npm run db:push

# run with pm2 so it stays alive
npm i -g pm2
pm2 start "npm start" --name mi-website
pm2 save
```

Then put **nginx** in front to handle TLS:

```nginx
server {
    listen 443 ssl http2;
    server_name miengineeringworks.com www.miengineeringworks.com;
    # ssl_certificate / ssl_certificate_key from Let's Encrypt

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option D — cPanel / shared hosting (only if your plan offers Node.js)

Most cPanel plans expose **"Setup Node.js App"** under the Software section.

1. In **Setup Node.js App**, create an app:
   - Node version: **20.x** (or the latest supported by your host)
   - Application root: the folder where you uploaded this project
   - Application URL: your domain
   - Application startup file: `dist/index.js`
2. SSH into the server (or use the host's terminal):
   ```bash
   cd ~/<your-app-folder>
   npm install
   npm run build
   npm run db:push
   ```
3. In the **Setup Node.js App** page, click **Add variable** and add every key from the env-vars table.
4. Click **Restart**.
5. Use cPanel's **PostgreSQL Databases** tool (or any external Postgres host like Neon / Supabase / Render) and paste the connection string into `DATABASE_URL`.

> ❗ A pure static cPanel plan **without Node support** cannot host this app.

### What about Vercel / Netlify?

Vercel and Netlify can host this project too, but only if you use their **serverless functions** or a long-running server platform — the same constraints as Render/Railway. Static-only deploys will not work because the admin panel and ledger require an Express backend with Postgres.

---

## Admin Panel

- URL: `https://your-domain/admin/login`
- Username: as set in `ADMIN_USERNAME`
- Password: as set in `ADMIN_PASSWORD` (or the default `6392061892` if not set — **change this on production**)

Inside the panel you can manage:

- Branding & identity (logo, colors)
- Animations (product card + page background)
- Site content (key/value editor)
- Custom homepage sections
- Products / Industries / Standards / Grade chart / Specifications
- PDF catalog upload
- Photos & videos (gallery)
- **Calculator** — internal weight / pricing tool for fasteners
- **Ledger / Khata** — customer-first bookkeeping (add a customer, then record their invoices)
- Contact form submissions

---

## Project Layout

```
shared/schema.ts        # Drizzle tables + Zod insert schemas (single source of truth)
server/
  index.ts              # Express routes + auth + email
  storage.ts            # Database access layer (used by routes)
  db.ts                 # Drizzle client
src/
  pages/                # Public site pages
  pages/admin/          # Admin dashboard pages (gated by RequireAdmin)
  components/           # Reusable UI
  hooks/, lib/          # Shared client-side helpers
```

---

## License

Proprietary — © M.I. Engineering Works, Mumbai. All rights reserved.
