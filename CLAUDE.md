# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite HMR)
npm run build      # production build → dist/
npm run preview    # serve the dist/ build locally
npm run lint       # ESLint
```

No test suite is configured.

## Environment

Copy `.env.example` to `.env` and set both variables before running:

```
VITE_BASE_API_URL=http://localhost:8000/api
VITE_BASE_CDN_URL=http://localhost:8000/public
```

## Architecture

**Stack:** React 19, Vite, React Router v7, TanStack Query v5, Axios, Gravity UI (`@gravity-ui/uikit` + `@gravity-ui/navigation`), react-hook-form, Socket.IO client.

**Path alias:** `@/` maps to `src/`.

### Provider tree (top-down)

`ToasterProvider` → `BrowserRouter` → `ResourceLocaleProvider` → `AuthProvider` → `HeaderProvider` → routes

- **`AuthProvider`** (`src/providers/auth.jsx`) — calls `/user/me`, exposes `{ user, role, isAdmin, isTeacher, isStudent, logout }`. JWT tokens (`access_token`, `refresh_token`) live in `localStorage`; the Axios interceptor in `src/services/api.js` handles silent refresh on 401s and redirects to `/login` on refresh failure.
- **`ResourceLocaleProvider`** (`src/providers/resource-locale.jsx`) — persists a content locale (`uz` default) in `localStorage`.

### Routing

Two authenticated role-shells, both rendered through `AppLayout`:
- `/admin/*` — admin dashboard, teacher/student/course CRUD
- `/teacher/*` — teacher dashboard, groups, sessions, chat, settings

`AppLayout` (`src/ui/layouts/app-layout/index.jsx`) renders a `Sidebar` + `Topbar` + `<Outlet>`. Nav items are hardcoded per role inside that file. Role mismatch redirects to the correct home.

### Data layer

Each domain (course, lesson, unit, teacher, student, enrollment, assessment, assignment, group, chat, auth, user) has two files under `src/services/<domain>/`:

- **`api.js`** — plain async functions that call `src/services/api.js` (the Axios instance).
- **`query.js`** — TanStack Query hooks (`useQuery` / `useMutation`) that wrap the api functions.

The shared `useInfoMutation` helper in `src/services/query.js` auto-invalidates a query key, shows a success toast from `data.message`, and shows an error toast from `error.response.data.message`.

CDN asset URLs are resolved through `cdnUrl()` in `src/services/config.js` — always use it for media paths; it passes through `blob:` and `data:` URLs untouched for local previews.

### Real-time chat

`src/services/chat/socket.js` manages a singleton Socket.IO connection to the `/chat` namespace (origin derived from `VITE_BASE_API_URL`). Consumers call `subscribeChatSocket(listener)` to attach and get a cleanup function; the socket disconnects automatically when the last listener unsubscribes.

### UI layer

- Components live in `src/ui/components/<name>/index.jsx` — these are project-specific wrappers (not Gravity UI pass-throughs).
- Pages live in `src/ui/pages/<role>-<feature>/index.jsx`.
- Global CSS custom properties and utility classes are in `src/index.css`; component-scoped styles are in `src/ui/components.css`. CSS variables follow the `--it-*` naming convention.
- Icons come from Lucide via `src/ui/components/icon/index.jsx` (wraps `lucide-react`).
