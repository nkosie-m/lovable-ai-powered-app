# Workplace AI — AI Productivity Assistant

An AI workspace that turns rough notes into polished work: professional emails, structured meeting notes, and research briefs. Built with Lovable.

## Features

- **Email Generator** — draft emails from a recipient, tone, goal, and context.
- **Meeting Notes** — turn a raw transcript into a clean summary with decisions and action items.
- **Research Assistant** — produce a structured brief from a topic and source content, tuned to audience and depth.
- **Header search** — jump straight to a tool or reopen a saved draft; press Enter to pick the first match.
- **Editable output panel** — edit the draft in place, copy it, or export it as a `.txt` file.
- **Session history** — the last 8 drafts stay one click away.
- **Settings** — Appearance (light/dark, remembered on your device), About, and FAQs.
- **Google sign-in** — visitors sign in with Google before reaching the workspace.
- **Responsible AI** — prompts forbid invented facts and fabricated citations; a disclaimer reminds you to review output.

## Tech stack

- TanStack Start (React 19, Vite 7, file-based routing)
- TypeScript + Tailwind CSS v4 with semantic design tokens
- shadcn/ui components, sonner for toasts
- Lovable Cloud (database + authentication)
- Lovable AI Gateway via the Vercel AI SDK (`streamText`)

## Project structure

```text
src/
  routes/
    __root.tsx      app shell, fonts, toaster
    index.tsx       workspace: sidebar, tools, search, output, history
    auth.tsx        Google sign-in screen
  components/
    SettingsDialog.tsx
  hooks/
    useAuth.ts      session state
    useTheme.ts     light/dark preference
  lib/
    assistant.functions.ts   generateDraft server function
    ai-gateway.server.ts     AI gateway fetch wrapper
  styles.css        design tokens and theme
```

## How generation works

The UI calls the `generateDraft` server function with the active tool and its
form fields. The server picks a tool-specific system prompt, calls the Lovable
AI Gateway, and returns the finished text. API keys stay server-side.

## Development

Requires Node.js and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

The dev server runs at http://localhost:8080.

## Editing and deploying

Open the project in [Lovable](https://lovable.dev) and keep building, or work
locally and push — changes sync both ways once GitHub is connected. Publish from
the Lovable editor to go live.
