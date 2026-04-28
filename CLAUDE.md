# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe a UI component, Claude generates React/JSX code into a virtual file system, and the result is rendered live in a sandboxed iFrame.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run test         # Run Vitest
npm run lint         # ESLint
npm run setup        # First-time setup: install + Prisma migrate
npm run db:reset     # Wipe and reinitialize SQLite database
```

Run a single test file:
```bash
npx vitest run src/path/to/file.test.ts
```

## Environment

Copy `.env` and set `ANTHROPIC_API_KEY`. If left empty, the app falls back to a `MockLanguageModel` so the UI still works without a real key.

## Architecture

### Request Flow

1. User types a prompt → `ChatContext` (`src/lib/contexts/chat-context.tsx`) calls the Vercel AI SDK `useChat()` hook
2. `POST /api/chat` (`src/app/api/chat/route.ts`) streams a response from `claude-haiku-4-5` via `streamText()`
3. Claude calls two tools during generation: `str_replace_editor` (edit file content) and `file_manager` (create/delete files)
4. Tool calls are executed client-side in `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`), updating the in-memory virtual file system
5. The preview iFrame (`src/components/preview/PreviewFrame.tsx`) picks up file changes and re-renders via the JSX transformer

### Virtual File System

There is no disk I/O for generated components. `src/lib/file-system.ts` is an in-memory abstraction serialized to JSON. This JSON blob is stored in Prisma's `Project.data` field (SQLite). Claude is instructed to write `/App.jsx` as the entry point and use `@/` for internal imports.

### Live Preview

`src/lib/transform/jsx-transformer.ts` transforms the virtual file system into browser-runnable code. It injects Babel standalone into the iFrame so JSX compiles at runtime, and builds an import map so `@/` aliases resolve correctly. The iFrame is sandboxed, so component errors don't crash the outer app.

### Auth & Sessions

JWT-based, stored in an HttpOnly cookie (7-day TTL). Logic lives in `src/lib/auth.ts`. Projects belong to a user, but anonymous users can still create and preview components — their work is tracked in client state and can be saved upon sign-up.

### AI Provider

`src/lib/provider.ts` selects the model. `src/lib/prompts/generation.tsx` holds the system prompt, which is sent with Anthropic's ephemeral cache-control to reduce repeated token costs.

### State Management

No Redux or Zustand. Two React contexts handle global state:
- `FileSystemContext` — virtual FS state + tool-call handlers
- `ChatContext` — wraps `useChat()`, coordinates with FileSystemContext

### Data Layer

Prisma with SQLite (`prisma/dev.db`). Two models: `User` (email/password auth) and `Project` (stores messages and file system as JSON strings).

## Key File Locations

| Concern | Path |
|---|---|
| AI API route | `src/app/api/chat/route.ts` |
| System prompt | `src/lib/prompts/generation.tsx` |
| AI provider/model | `src/lib/provider.ts` |
| Virtual file system | `src/lib/file-system.ts` |
| FS context + tool handlers | `src/lib/contexts/file-system-context.tsx` |
| Chat context | `src/lib/contexts/chat-context.tsx` |
| JSX → browser transform | `src/lib/transform/jsx-transformer.ts` |
| Preview iFrame | `src/components/preview/PreviewFrame.tsx` |
| Auth utilities | `src/lib/auth.ts` |
| Main layout | `src/app/main-content.tsx` |
| Database schema | `prisma/schema.prisma` |

## UI Stack

- Next.js 15 App Router with React 19
- Tailwind CSS v4 (no config file — uses CSS-first configuration)
- Shadcn/UI components (New York style, Radix primitives, Lucide icons) in `src/components/ui/`
- Monaco Editor for the code view
- `react-resizable-panels` for the split-pane layout
