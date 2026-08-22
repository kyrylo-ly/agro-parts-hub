<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Context & Tech Stack
- **Framework**: Next.js (App Router) with TypeScript.
- **Database**: PostgreSQL hosted on Neon.tech (Free tier).
- **ORM**: Drizzle ORM.
- **Storage**: Cloudflare R2 for images.
- **Styling**: Tailwind CSS + Shadcn UI.
- **Hosting**: Vercel (Hobby/Free tier).

## Priorities (Strict Order)
1. **Zero Cost**: Maintain a completely free infrastructure (Vercel free tier, Neon free tier, Cloudflare R2).
2. **Server Optimization**: Fast TTFB, efficient DB queries, optimal rendering strategies (SSR/SSG/ISR).
3. **SEO**: Server-rendered content, proper metadata, semantics.
4. **Minimal JS Bundle**: Avoid heavy client-side libraries.
5. **Client Optimization**: Fast LCP, CLS, smooth interactions.
