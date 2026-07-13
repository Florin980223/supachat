# Supachat

A realtime chat application built with Next.js and Supabase, featuring public/private chat rooms, GitHub OAuth login, and live messaging powered by Supabase Realtime broadcast channels.

## Description

Supachat lets authenticated users create chat rooms (public or invite-only), join public rooms, invite other users to private ones, and chat in real time. Messages are delivered instantly through a private Supabase Realtime channel per room, with presence tracking to show how many users are currently online, optimistic UI for sent messages, and infinite-scroll pagination for message history.

## Features

- GitHub OAuth authentication (Supabase Auth)
- Create public or private chat rooms
- Join / leave rooms, invite specific users to a room
- Realtime messaging via Supabase Realtime **broadcast** channels (database-trigger driven, not `postgres_changes`)
- Online presence indicator per room
- Optimistic message sending with pending / error / success states
- Infinite scroll to load older messages
- Responsive UI built with shadcn/ui and Tailwind CSS

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Backend/DB:** Supabase (Postgres, Auth, Realtime)
- **UI:** Tailwind CSS v4, shadcn/ui, lucide-react icons
- **Forms/Validation:** react-hook-form, zod
- **Deployment:** Vercel

## Local Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone <repo-url>
   cd realtime-chat
   npm install
   ```

2. Create a Supabase project (or use an existing one) and enable GitHub as an OAuth provider.

3. Copy the environment variables below into a `.env.local` file at the project root and fill in your own project values.

4. Start the dev server:

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file with the following variables (no real values are included here):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — used by the browser and server Supabase clients (safe to expose, respects Row Level Security).
- `SUPABASE_SECRET_KEY` — used only server-side by the admin client to bypass RLS after manual authorization checks. Never expose this to the client or commit it to version control.

## Project Structure

```
src/
  app/                     Next.js App Router pages
    auth/                  login, OAuth callback, error page
    rooms/new/             create room form
    rooms/[id]/            chat room page (server) + realtime client component
    page.tsx               home page: public rooms + joined rooms
  components/              chat UI (input, messages, navbar, join/leave/invite)
  components/ui/           shadcn/ui components
  services/supabase/
    client.ts / server.ts  browser, server, and admin Supabase clients
    middleware.ts          session refresh (invoked from src/proxy.ts)
    actions/               server actions for rooms and messages
    schemas/                zod validation schemas
    types/database.ts       generated Supabase types
supabase/                  Supabase CLI project link
```

## What I Learned

- Structuring a Next.js App Router project around three distinct Supabase clients (browser, server/RLS-aware, and admin) and when to use each one safely.
- Implementing realtime features the recommended way: private `broadcast` channels driven by Postgres triggers instead of the less scalable `postgres_changes`.
- Combining live broadcast data, paginated history, and local optimistic updates into a single consistent message list.
- Using Supabase Auth with GitHub OAuth end-to-end, including the server-side code exchange callback.
- Designing server actions with explicit authorization checks (membership/ownership) before touching the database.

## Project Status

Actively maintained as a portfolio project. Deployed on Vercel with real data; changes are made incrementally and carefully to avoid breaking authentication, rooms, or messaging. Some areas (SQL migrations history, invite UX, join/leave flow) are still being iterated on.

## Demo

[Live Demo](https://your-demo-url.vercel.app) — *replace with the actual deployment URL*
