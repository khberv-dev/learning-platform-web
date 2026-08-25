# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Admin + mentor web panel for the iTeach learning platform. Backed by the NestJS API at `../learning-platform-api` (its own CLAUDE.md documents the server side).

## Commands

```bash
npm run dev        # start dev server (Vite HMR)
npm run build      # production build → dist/
npm run preview    # serve the dist/ build locally
npm run lint       # ESLint
```

No test suite is configured.

## Environment

Copy `.env.example` to `.env`:

```
VITE_BASE_API_URL=http://localhost:8000/api
VITE_BASE_CDN_URL=http://localhost:8000/public
```

Both are read only through `src/shared/config.js`, which normalises them to end with a slash. The one exception is the refresh call in `services/api.js`, which must bypass the shared axios instance.

## Roles

The API's `UserRole` enum is `student | teacher | admin`. **"Mentor" is this product's name for `teacher`** — the wire value stays `teacher` in every request and every `roles` array; only UI copy says "mentor". `src/shared/auth/roles.js` is the single place that mapping lives (`ROLE.MENTOR === 'teacher'`).

Students have no panel here. A student-only account is rejected at sign-in rather than being let in to bounce between guards.

## Architecture

**Stack:** React 19, Vite, React Router v7 (`react-router-dom`), TanStack Query v5, Axios, Gravity UI (`@gravity-ui/uikit` + `@gravity-ui/navigation`), Recharts, Socket.IO client, dayjs, lucide-react.

**Path alias:** `@/` maps to `src/` (`vite.config.js` + `jsconfig.json`). Imports include the file extension.

### Provider stack

`src/main.jsx` → `AppProviders` (`src/shared/providers/appProviders.jsx`) → `App`:

`QueryClientProvider` → `I18nProvider` → `ThemeModeProvider` → `AuthProvider` → `GravityThemeBridge` (feeds theme + lang into Gravity's `ThemeProvider`, mounts `ToasterProvider`/`ToasterComponent`) → `BrowserRouter`.

- `useI18n()` — `{locale, setLocale, t}`. Locales are plain objects in `src/shared/i18n/locales/{uz,ru}.js`; **`uz` is the default and the fallback** (a key missing from `ru` renders the Uzbek string, not the raw key). Gravity ships no `uz`, so it's mapped onto `en`. `t` takes a second argument of variables and fills `{{name}}` placeholders (`t('push.recipients', {count: 3})`) — don't hand-splice values into a translated string.
- `useThemeMode()` — `{themeMode, setThemeMode, toggleThemeMode}`, seeded from `prefers-color-scheme`.
- `useAuth()` — `{isAuthenticated, roles, role, isAdmin, isMentor, login, logout, syncRoles}`. Sign-in returns the role list inline, so it's cached in `localStorage` and the guards can pick a panel on the first render; `user/me` stays authoritative and `RoleRoute` re-syncs it.

### Auth flow

`POST auth/sign-in` takes exactly one identity — `{phoneNumber, password}` or `{email, password}` — and returns `{accessToken, refreshToken, roles}`. The login form accepts either in one field, normalises email to lowercase and phone to bare digits, and sends only the matching identity key.

**`POST auth/refresh` takes no body — it is guarded by `JwtRefreshGuard`, which reads the *refresh* token out of the `Authorization: Bearer` header.** This differs from most refresh endpoints; `services/api.js` sends it through bare axios so the request interceptor can't overwrite the header with the stale access token. A 401 from any non-auth endpoint triggers one refresh-and-retry, queuing concurrent requests behind it; 403 (the role guard) rejects normally, since refreshing can't fix it.

### Routing and navigation

`src/app.jsx`. `GuestRoute` → `/login`; `PrivateRoute` → `RoleRoute role={...}` → `MainLayout role={...}` → pages, under `/admin/*` and `/mentor/*`. `/` forwards via `RootRedirect`.

**`src/ui/layouts/navConfig.js` is the source of truth for both the sidebar tree and the URL layout.** A group's `id` is also its path segment, and the page files mirror it:

| Group | Routes | Files |
|---|---|---|
| — | `/admin` | `pages/admin/home.jsx` |
| `users` | `/admin/users/{students,mentors}` | `pages/admin/users/` |
| `course` | `/admin/course/{courses,enrollments,pending-enrollments}` | `pages/admin/course/` |
| `payment` | `/admin/payment/{payments,payment-types}` | `pages/admin/payment/` |
| `marketing` | `/admin/marketing/push-notifications` | `pages/admin/marketing/` |
| — | `/admin/settings` | `pages/admin/settings.jsx` |

A nav node with `children` renders as a collapsible group; one with `path` renders as a link. Groups are never navigable themselves. Adding a page means editing `app.jsx`, `navConfig.js`, and every locale file (the `titleKey`), and putting the file in the matching folder.

The sidebar (`src/ui/layouts/sidebar.jsx`) is a **custom `<aside>`, not Gravity's `AsideHeader`** — `AsideHeader`'s `MenuItem` type is flat (it supports `divider` but no children), so it cannot express a tree. Groups auto-expand when they contain the active route; a collapsed group holding the active route stays highlighted. In the icon-only rail, clicking a group re-expands the sidebar rather than doing nothing. Styles live under `.sidebar*` in `src/index.css`.

`/admin/assignments` is routed but deliberately **not** in the sidebar tree.

### Data layer

`src/services/<domain>/{api,query}.js` — `api.js` holds plain async functions returning `res.data`; `query.js` holds the `use*` hooks. Query keys are `['<domain>', '<kind>', ...params]`.

Mutations invalidate the whole domain (`['course']`, `['mentor']`, …) rather than a single key: list keys embed their pagination params, and nested payloads (a course carries its units, lessons and tasks) have no single key to patch. Sending a chat message is the deliberate exception — the server broadcasts it back over the socket, so invalidating would refetch a page of history per message.

List pages wrap their content in `.page-fill` and pass `className="page-fill__section"` to `PageSection` (see `index.css`). The section is `flex: 0 1 auto`: it never grows, so a short table sits directly above its own pagination, but it does shrink, so a long one is capped at the viewport, scrolls internally, and keeps the pagination pinned in view. The page itself never scrolls, and the table header sticks while the rows do. Adding a paginated page means applying both classes, or the pagination drops below the fold.

List pages page through `DataTable`, which renders Gravity's `Pagination` right-aligned with the page sizes from `src/shared/pagination.js` (15/20/30/50, default 15 — the API caps `limit` at 100). `compact` is left at its default so the arrows carry no "previous"/"next" labels. The control shows whenever `total` exceeds the *smallest* page size, not the current one: at 50/page with 20 rows there is one page, but hiding it would strand the user with no way back down to 15.

Multipart is required wherever a file rides along (course image, lesson media, task file, avatars, intro videos, payment-type icons, chat files). The local `asForm` helpers stringify booleans — the DTOs' `@Transform` compares against `'true'`/`'false'` — and drop null/undefined keys so a PATCH can't blank an untouched field.

The admin dashboard keeps growth and activity metrics visually separate. `stats/summary` exposes current totals. `stats/timeseries` returns `{businessMetrics, activeUserMetrics}`: business metrics are daily rows, while activity is split into daily `dau`, weekly range-based `wau`, and month-based `mau` arrays whose values live in `count`. Growth has a 7/14/30 period control. Activity uses the 30-day response and renders one selected DAU/WAU/MAU chart at a time, preserving each metric's natural time axis.

CDN paths go through `cdnUrl()` (`src/shared/utils/format.js`), which passes `http(s):`, `blob:` and `data:` through untouched so local previews work.

### Chat

`src/services/chat/socket.js` owns a module-level singleton connection to the `/chat` namespace (origin = API base minus `/api`, auth via `access_token`). `subscribeChatSocket(listener)` returns a cleanup function; the socket connects on the first subscriber and disconnects when the last one leaves. Emits queue until `connect`. REST history comes from `chat/{api,query}.js`; the page dedupes socket arrivals against history by id.

### Known API shapes

Most list endpoints return `{data, total, page, limit, totalPages}`, but **`GET admin/courses`, `GET admin/payment-types`, `GET admin/courses/:id/plans` and `GET assignments/pending` return bare arrays** — `DataTable` takes `rows` instead of reading the envelope for those.

**The course tree is paged out across three levels, not one nested payload.** The API deliberately stopped embedding children so a list request wouldn't drag the whole tree along:

| Request | Returns |
|---|---|
| `GET admin/courses` | courses with `unitsCount` + `lessonsCount`; **no `units`** |
| `GET admin/courses/:id` | `units[]`, each with `lessonsCount`; **no `lessons`** |
| `GET admin/courses/:courseId/units/:unitId/lessons` | that unit's lessons |
| `GET .../lessons/:lessonId/tasks` | that lesson's tasks |

So counts always come from `*Count` fields, never from `array.length`. `PATCH admin/courses/:id` returns the full detail shape.

Courses, units and lessons all carry an admin-set **`index`** (int, default 0) and the API returns them pre-sorted, so the client never re-sorts — it renders in the order received. The tiebreaker differs by level and is deliberate: units and lessons use `index ASC, createdAt ASC` (a curriculum reads oldest-first), while courses use `index ASC, createdAt **DESC**` so untouched courses keep the newest-first listing they had before. Rows that were never given an index all sit at 0 and stay where they were. The create forms pre-fill `index` with one past the highest in use, so a new row lands at the end. Clearing the field sends **no** `index` key at all (`toOptionalNumber` in `shared/utils/format.js`) rather than `NaN` → `null`, which the NOT NULL column would reject.

**Each level is a page, not a collapsible branch** — the URL nesting mirrors the API's:

```
/admin/course/courses/:courseId                                   units list
  .../units/:unitId                                               unit: title + lessons
  .../units/:unitId/lessons/:lessonId                             lesson: title, media, tasks
  .../lessons/:lessonId/tasks/:taskId                             task: name, file, questions
  .../tasks/:taskId/questions/:index                              question: text, options, answer
```

The API has no "get one unit/lesson/task" route, so `useUnit`/`useLesson`/`useTask` are `select`-based hooks over the *parent list's* query key — opening a detail page reuses the list's cached data instead of firing its own request.

`Task.questions` is a **jsonb array with no per-entry ids**, so a question is addressed by array index and every edit, add or delete PATCHes the whole rebuilt `questions` array back onto the task.

A question's `options` decides its type: a non-empty array makes it multiple-choice (the answer renders as a `Select` limited to those options), `null` makes it free-text (a plain input). The editor keeps one input per option rather than a comma-separated field, and drops blank rows on save — clearing every option is how a question becomes free-text again. `task-submission.service.ts` lowercases **both** sides when grading, so the answer-must-be-among-options check is case-insensitive too. The API itself does not cross-validate answer against options; that rule is ours, because an answer absent from the options can never be selected.

Pages inside a hierarchy pass a `breadcrumbs` trail to `PageHeader` (`[{title, to}, …]`, last entry omitting `to`). Ancestor titles come from the same `select`-based hooks the pages already use, so the trail costs no extra requests. `showRoot` keeps the first crumb pinned when Gravity collapses the middle on narrow viewports.

Admin access to payments is **read-only** by design; status changes only through the Click webhooks. Cash and transfer sales are recorded via `POST admin/enrollments` instead — reachable from the **student detail page** (`EnrollStudentDialog`), where the student is already fixed by the route, rather than from the enrollments list, which stays read-only. `dto.studentId` is the **Student entity id**, which is what `/admin/users/students/:id` carries.

`GET students` and `GET admin/teachers` share a shape: a case-insensitive `search`, an `isActive` filter on the *account*, a whitelisted `sortBy` and `sortOrder`. They differ in what's searchable and sortable — students add `level` (`A1`–`C2`), `hasCourse`, an `activeCoursesCount` response field, and sort on `points`/`coins`/`balance`; mentors add `profession` (searchable *and* sortable) and filter on `TeacherStatus`. A mentor's employment `status` and whether their account can sign in (`user.isActive`) are separate filters and separate columns.

Both search boxes are debounced through `useDebouncedValue`, but `page` resets on the keystroke itself, not on the debounced value — otherwise a search could land on a page number the narrowed results don't have.

List-page filter controls carry persistent labels through `FormField`; option text such as "all" is a value, not a substitute for naming the filter. This is especially important where multiple filters can simultaneously display the same "all" value.

**Sorting lives in the table header, not a dropdown.** `DataTable` wraps Gravity's `withTableSorting`: mark a column `meta: {sort: true}` and pass `sortBy`/`sortOrder`/`onSortChange`. A column's **`id` is sent verbatim as the API's `sortBy`**, so it has to be the field name the endpoint whitelists (hence the name column is keyed `firstName`) — and a column with no server-side counterpart, like the account-status one, simply omits `meta.sort` and renders a plain header. `disableDataSorting` is set because the rows on screen are one server-sorted page; re-sorting them locally would only shuffle that page. Clicks cycle asc → desc → cleared, and a cleared column falls back to `defaultSortBy` (`createdAt`, DESC) rather than sending no sort at all. `meta.defaultSortOrder: 'desc'` makes dates and numbers start newest/highest-first.

`GET admin/enrollments` filters on `studentId`, `courseId`, `status` and `isExpired`, and sorts by a whitelisted `sortBy` (`createdAt`/`updatedAt`/`start`/`end`/`status`) plus `sortOrder`. `isExpired` is a **filter only — rows do not carry it**; `isEnrollmentExpired()` in `services/enrollment/query.js` derives it from `end`, mirroring the server's rule (an *active* row whose `end` has passed). Expiry is deliberately distinct from status, because an enrollment can read `active` and already be past its term. Filtering on `isExpired` implies `status=active` server-side when no status is given, since only an active enrollment has a meaningful term.

**Pending enrollments are enrolment *requests*, queued by an external service (CRM, terminal) and resolved by an admin** — `GET admin/pending-enrollments` (filters `userId`, `courseId`, `status`; the same sort whitelist as the enrollment list) plus `PATCH .../:id/accept` and `PATCH .../:id/reject`. They live in `services/enrollment/{api,query}.js` under the `['enrollment', 'pending', …]` key rather than a domain of their own, so accepting one invalidates both lists at once.

Only a `created` request can be decided, so the action buttons render on those rows alone and the page's status filter **defaults to `created`** — it is a work queue, not an archive. A request carries no plan: `AcceptPendingEnrollmentDialog` picks one (`usePlans(row.course.id)`, and it must belong to the requested course), because price and duration are only settled at approval. `amount` is optional and falls back to the plan's price. Accepting opens the enrollment `active` **and** writes a `paid` payment in one server-side transaction — the money was collected outside Click/Payme, as with a manual enrollment — hence the `['payment']`/`['student']`/`['stats']` invalidations that rejecting doesn't need. The row points at the **`User`**, not the `Student`, so there is no student page to link a row to.

### Push notifications

Almost every push the platform sends is event-driven and lives entirely in the API (enrollment opened, lesson added, mentor assigned). The panel owns the **one manual path**: `POST admin/notifications/push` in `services/notification/{api,query}.js`, taking `{title (≤100), body (≤1000), audience, phoneNumbers?}`.

`audience` (`all` / `students` / `teachers` / `phones`) is required by the DTO so a blast to everyone can never be a forgotten field, and there is no separate single-recipient route — one user is a `phones` list of one. The page mirrors that intent: it defaults to `phones`, shows a warning instead of a recipient field on the three mass audiences, and routes every send through `ConfirmDialog` naming who is about to get it. Nothing is invalidated afterwards, because a push leaves no row behind to read back.

The response **is** the deliverable: `{devices, sent, failed, removedTokens}`, plus `notFound` (no such user) and `withoutDevice` (user exists, never opened the app) for a `phones` send — a distinction the report renders separately, since a wrong number and an uninstalled app call for different follow-ups. It is held in page state until the next send, as it can't be refetched. Delivery happens *inside* the request in chunks of 500, so a large audience simply means a slow response. A **503** means `GOOGLE_SERVICES_JSON` is unset on the server; its message is surfaced as-is rather than reported as a zero-device success.

The phone box parses newline/comma-separated entries and strips each to digits (numbers are stored bare as `998XXXXXXXXX`), then splits them into valid and invalid *before* sending — a rejected batch is all-or-nothing server-side, so a typo is caught in the field.

### Conventions

4-space indent, single quotes, semicolons. Admin pages are grouped by nav section (see the table above); mentor pages are flat under `src/ui/pages/mentor/`. Shared building blocks are `src/ui/components/<name>.jsx`. Component styling is inline `style={{...}}` objects with `var(--g-color-*)` tokens — no CSS modules; `src/index.css` holds the reset, the clickable-row class and the `.sidebar*` rules.

**Theme.** `src/theme.css` (imported after Gravity's own stylesheets) overrides Gravity's brand tokens with a green ramp derived from `public/brand.png` — the logo's average green is `#31cf70`, i.e. `hsl(144, 62%, 50%)`. Buttons carry **white** label text, and that choice sets the base: white needs 4.5:1 for normal-size text, which the logo green itself fails badly (2.04:1). So `--g-color-base-brand` is the deeper `#1d7c43` of the same hue — 5.23:1 against white — rather than the literal logo colour, which survives in the selection tint and the dark theme's accent text. Both themes use the same base, since the label is white in both. `--g-color-text-brand` matches it on light and inverts lighter on dark, where it has to lift off a dark background. Light is the default mode, and `prefers-color-scheme` is deliberately **not** consulted — only an explicit in-app choice switches it.

ESLint runs `react-hooks` v7, whose `set-state-in-effect` rule is an **error**. Seed form state from server data by splitting a loader component from a fields component and passing `initialValues` + a `key`, rather than syncing inside `useEffect` — see `mentorForm.jsx` and `mentor/schedule.jsx`. Note `no-unused-vars` is `'off'`, so lint won't catch dead imports.
