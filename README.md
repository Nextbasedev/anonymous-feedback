# Nextbase Anonymous Feedback

Collect anonymous feedback from external stakeholders (clients, partners, freelancers, vendors) with verified one-per-person access.

## How It Works

1. **Admin generates invite links** — each email gets a unique, one-time URL
2. **Person clicks their link** — the system validates the token and shows a Google Form
3. **They submit feedback** — responses go directly to Google Forms (trusted third party)
4. **Token is burned** — the same link can't be used twice
5. **Admin views responses** — pulled from Google Forms API, displayed anonymously

### Why This Architecture?

- **Google Forms = trust.** People trust Google more than a company-hosted form
- **Token gateway = verification.** Only invited people can access the form
- **Separation = anonymity.** Token data and response data never touch each other
- **One-time links = deduplication.** Each person submits exactly once

## Setup

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nextbase-nextjs/anonymous-feedback)

### 2. Add Vercel Postgres

In your Vercel project → Storage → Add → Postgres. Environment variables are auto-configured.

### 3. Create a Google Form

Create your feedback form at [forms.google.com](https://forms.google.com). Get the published form ID from the share link.

### 4. Set Up Google Forms API (for reading responses)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable **Google Forms API**
4. Create a **Service Account** → download the JSON key
5. Share your Google Form with the service account email (Viewer access)

### 5. Configure Environment Variables

```
ADMIN_PASSWORD=your-secure-password
GOOGLE_FORM_ID=your-published-form-id
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
NEXT_PUBLIC_URL=https://your-app.vercel.app
```

## Tech Stack

- **Next.js 15** (App Router)
- **Vercel Postgres** (Neon) for token storage
- **Google Forms API** for form hosting + response reading
- **TypeScript**

## Local Development

```bash
bun install
cp .env.example .env.local
# Fill in your env vars
bun dev
```

## License

MIT
