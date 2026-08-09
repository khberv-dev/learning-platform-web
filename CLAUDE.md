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

**Stack:** React 19, Vite, React Router v7, TanStack Query v5, Axios, Gravity UI (`@gravity-ui/uikit` + `@gravity-ui/navigation`), react-hook-form, Recharts, Socket.IO client.

**Path alias:** `@/` maps to `src/`. Imports include the file extension (`@/services/course/query.js`).

### Provider tree (top-down)

`ThemeProvider` → `QueryClientProvider` (both in `src/main.jsx`) → `ToasterProvider` → `BrowserRouter` → `ResourceLocaleProvider` → `AuthProvider` → `HeaderProvider` → routes (`src/App.jsx`).

- **`AuthProvider`** (`src/providers/auth.jsx`) — calls `/user/me` via `useGetMe`, exposes `{user, isLoading, roles, role, isAdmin, isTeacher, isStudent, logout}`. JWT tokens (`access_token`, `refresh_token`) live in `localStorage`; the response interceptor in `src/services/api.js` handles silent refresh on 401 and hard-redirects to `/login` when refresh fails.
- **`HeaderProvider`** (`src/providers/header.jsx`) — pages own the topbar. Every page sets `{title, subtitle, onBack, actions}` in an effect and clears it on unmount (`setHeader({})`); `useSetHeader(deps, factory)` is the shorthand.
- **`ResourceLocaleProvider`** (`src/providers/resource-locale.jsx`) — content locale (`uz` default) persisted in `localStorage` under `locale`.

### Routing

`RequireAuth` gates on the presence of `access_token` only; role enforcement happens inside `AppLayout`, which redirects to the correct role home on mismatch. Two authenticated shells:

- `/admin/*` — teachers, students, courses (units → lessons → tasks), payments, settings
- `/teacher/*` — dashboard, students, live sessions, schedule, chat, settings

Students have no shell yet — `isStudent` redirects to `/login`.

`AppLayout` (`src/ui/layouts/app-layout/index.jsx`) renders `Sidebar` + `Topbar` + `<Outlet>`; nav items are hardcoded per role as `ADMIN_NAV`/`TEACHER_NAV` constants in that file, so adding a page means touching both `App.jsx` and this file.

### Data layer

Every domain under `src/services/<domain>/` has the same two files — assessment, assignment, auth, chat, course, enrollment, lesson, live-lesson, live-lesson-recording, material, payment, plan, stats, student, task, task-submission, teacher, unit, user:

- **`api.js`** — plain async functions over the shared Axios instance, returning `res.data`. Endpoints are unprefixed relative paths (`admin/courses`, `courses/me`).
- **`query.js`** — TanStack Query hooks. Query keys are `['<domain>', '<kind>', ...params]` (e.g. `['course', 'detail', id]`); detail hooks use `enabled: !!id`. Mutations wrap `useInfoMutation` with `queryKey: ['<domain>']` so the whole domain invalidates (`exact: false`), and forward an optional `opts.onSuccess`.

`useInfoMutation` (`src/services/query.js`) also toasts `data.message` on success and `error.response.data.message` on failure — so mutation call sites usually need no toast code of their own. The `QueryClient` defaults disable `refetchOnWindowFocus` and retries.

Endpoints that accept an upload build `FormData` via a local `asForm(payload, fileField)` helper duplicated per domain `api.js` — booleans are stringified and null/undefined keys dropped. Follow that pattern rather than sending JSON when a file field is involved.

CDN asset URLs must go through `cdnUrl()` (`src/services/config.js`); it passes `http(s):`, `blob:` and `data:` URLs through untouched so local upload previews work.

### Real-time chat

`src/services/chat/socket.js` owns a module-level singleton Socket.IO connection to the `/chat` namespace (origin derived by stripping `/api` off `VITE_BASE_API_URL`, auth via `access_token`). Consumers call `subscribeChatSocket(listener)` and get a cleanup function; the socket connects lazily on first subscribe and disconnects when the last listener unsubscribes. Emitters (`joinChatRoom`, `sendChatMessage`, `emitTyping`, …) queue on `connect` if the socket isn't up yet. REST history still comes from `chat/api.js` + `chat/query.js`.

### UI layer

- `src/ui/components/<name>/index.jsx` — project-specific building blocks (`DataTable`, `Toolbar`, `ConfirmDialog`, `FormField`, `StatCard`, `ResourceBadge`, …), not thin Gravity UI re-exports. Prefer composing these over reaching for `@gravity-ui/uikit` directly in pages.
- `src/ui/pages/<role>-<feature>/index.jsx` — one directory per route.
- Icons: `<Icon name="trash-2"/>` (`src/ui/components/icon/index.jsx`) converts kebab-case to a `lucide-react` export and renders nothing for unknown names. Components like `Button`/`IconButton` take an icon *name string*, not an element.
- Styling is plain CSS: global tokens and utilities in `src/index.css`, component classes in `src/ui/components.css`, both imported once in `main.jsx`. All custom properties and class names use the `--it-*` / `it-*` prefix. Colors always come from tokens; one-off layout is done with inline `style` props.

### Conventions

4-space indent, single quotes, semicolons mostly omitted (some service files keep them on imports — match the file you're in). Pages export both a named and a default component. ESLint runs `react-hooks` + `react-refresh` rules with `no-unused-vars` disabled.
