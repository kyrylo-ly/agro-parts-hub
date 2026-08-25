# Agro Parts Hub

Agro Parts Hub is a full-stack Next.js web application.

## Project Context & Tech Stack

- **Framework**: Next.js 16.3 (App Router) with TypeScript.
- **Database**: PostgreSQL hosted on Neon.tech (Free tier).
- **ORM**: Drizzle ORM.
- **Storage**: Cloudflare R2 for images.
- **Styling**: Tailwind CSS with Shadcn UI design patterns (using `@base-ui/react` for UI primitives instead of Radix UI).
- **Client State**: Zustand with `persist` middleware (localStorage).
- **Server State**: Drizzle + Next.js `unstable_cache`.
- **Hosting**: Vercel (Hobby/Free tier).

## Architecture & Design

- **Monolith Architecture**: Full-stack Next.js monolith. No microservices, no external CMS. The Admin panel is custom-built in `/admin`.
- **Routing**: Uses Next.js 16.3 `proxy.ts`.
- **Database Design**: Specific dynamic product characteristics are stored in a `JSONB` `attributes` column (GIN indexed) rather than complex EAV tables.
- **Pagination**: URL-based pagination (e.g., `?page=2`) is prioritized over infinite scroll for better SEO indexing and footer accessibility.

## Core Priorities

1. **Zero Cost**: Maintain a completely free infrastructure (Vercel free tier, Neon free tier, Cloudflare R2).
2. **Server Optimization**: Fast TTFB, efficient DB queries, optimal rendering strategies (SSR/SSG/ISR).
3. **SEO**: Server-rendered content, proper metadata, semantics.
4. **Client Optimization**: Fast LCP, CLS, smooth interactions.

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
