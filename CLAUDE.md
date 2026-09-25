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
VITE_BASE_API_URL=http://localhost:8000/api/v2
```

The API base carries a version segment (`/api/v{N}`, a hardcoded constant in the API's `main.ts`); bump it here when the API does. It is read only through `src/shared/config.js`, which normalises it to end with a slash. There is no CDN base URL: the API's `FileUrlInterceptor` rewrites every stored upload path in an HTTP response to an absolute `{FILES_BASE_URL}/public/…` URL, so file fields (`avatar`, `image`, `media`, `file`, `icon`, `introVideo`, `filePath`) are used as-is. The one exception is the refresh call in `services/api.js`, which must bypass the shared axios instance.

## Roles

The API's `UserRole` enum is `student | mentor | admin`, and **each account holds exactly one role, permanently** — `Student`, `Mentor` and `Admin` are three independent tables with their own credentials; there is no `User` entity and no way to add a second role. A person needing two roles has two accounts. `src/shared/auth/roles.js` holds `ROLE`, `homePathFor(role)`, `isPanelRole`, and `currentRole()` (reads the cached role from storage so the service layer needs no React context).

**Every authenticated route carries the caller's role as its first path segment**: `admin/...`, `mentor/...`, `student/...`. Handlers shared across roles are mounted once per role (chat is `{student,mentor,admin}/chat`, `{role}/me`), so `services/chat` and `services/user` build their paths from `currentRole()`. Sign-in returns a single `role`; the JWT carries `{sub, role}`, and `me` returns `{id, role, firstName, lastName, avatar, email, phoneNumber, isActive}` (email/phone are `null` where the role's table has no such column — mentors have phone only, admins email only).

Account fields are **flat on each row** — `student.firstName`, `mentor.isActive`, `enrollment.student.firstName`, `pending.student`, `payment.student` — there is no nested `.user`. Chat messages carry `student`/`mentor`/`admin` (exactly one set) instead of `sender`. Ids are per-table: a student token's id *is* the `Student.id`.

**This panel is for admins and mentors only.** `PANEL_ROLES` is `[admin, mentor]`; a `student` sign-in is rejected in `login.jsx` before any token is persisted (`auth.noRole`), and a leftover token with no panel role falls back to the login form. There is no student panel.

## Architecture

**Stack:** React 19, Vite, React Router v7 (`react-router-dom`), TanStack Query v5, Axios, Gravity UI (`@gravity-ui/uikit` + `@gravity-ui/navigation`), Recharts, Socket.IO client, dayjs, lucide-react.

**Path alias:** `@/` maps to `src/` (`vite.config.js` + `jsconfig.json`). Imports include the file extension.

### Provider stack

`src/main.jsx` → `AppProviders` (`src/shared/providers/appProviders.jsx`) → `App`:

`QueryClientProvider` → `I18nProvider` → `ThemeModeProvider` → `AuthProvider` → `GravityThemeBridge` (feeds theme + lang into Gravity's `ThemeProvider`, mounts `ToasterProvider`/`ToasterComponent`) → `BrowserRouter`.

- `useI18n()` — `{locale, setLocale, t}`. Locales are plain objects in `src/shared/i18n/locales/{uz,ru}.js`; **`uz` is the default and the fallback** (a key missing from `ru` renders the Uzbek string, not the raw key). Gravity ships no `uz`, so it's mapped onto `en`. `t` takes a second argument of variables and fills `{{name}}` placeholders (`t('push.recipients', {count: 3})`) — don't hand-splice values into a translated string.
- `useThemeMode()` — `{themeMode, setThemeMode, toggleThemeMode}`, seeded from `prefers-color-scheme`.
- `useAuth()` — `{isAuthenticated, role, isAdmin, isMentor, login, logout, syncRole}` . Sign-in returns the role inline, so it's cached in `localStorage` and the guards can pick a panel on the first render; `me` stays authoritative and `RoleRoute` re-syncs it.

### Auth flow

Sign-in is per role: `POST auth/admin/sign-in` takes `{email, password}`, `POST auth/mentor/sign-in` takes `{phoneNumber, password}` (`998XXXXXXXXX`); both return `{accessToken, refreshToken, role}`. The login screen has an Admin / Mentor tab switch that picks the route, the identity field and its validation; email is lowercased and phone reduced to bare digits. There is no student sign-in.

**`POST auth/refresh` takes no body — it is guarded by `JwtRefreshGuard`, which reads the *refresh* token out of the `Authorization: Bearer` header.** This differs from most refresh endpoints; `services/api.js` sends it through bare axios so the request interceptor can't overwrite the header with the stale access token. A 401 from any non-auth endpoint triggers one refresh-and-retry, queuing concurrent requests behind it; 403 (the role guard) rejects normally, since refreshing can't fix it.

### Routing and navigation

`src/app.jsx`. `GuestRoute` → `/login`; `PrivateRoute` → `RoleRoute role={...}` → `MainLayout role={...}` → pages, under `/admin/*` and `/mentor/*`. `/` forwards via `RootRedirect`.

`src/ui/pages/settingsPage.jsx` (profile, theme, language) is rendered by both panels. A panel that needs more passes it an `extra` node rather than forking the page — `mentor/settings.jsx` is the one that does, adding the intro-video card.

**`src/ui/layouts/navConfig.js` is the source of truth for both the sidebar tree and the URL layout.** A group's `id` is also its path segment, and the page files mirror it:

| Group | Routes | Files |
|---|---|---|
| — | `/admin` | `pages/admin/home.jsx` |
| `users` | `/admin/users/{students,mentors}` | `pages/admin/users/` |
| — | `/admin/groups`, `/admin/groups/:id` | `pages/admin/groups/` |
| `course` | `/admin/course/{courses,enrollments,pending-enrollments}` | `pages/admin/course/` |
| `payment` | `/admin/payment/{payments,payment-types}` | `pages/admin/payment/` |
| `marketing` | `/admin/marketing/push-notifications` | `pages/admin/marketing/` |
| — | `/admin/settings` | `pages/admin/settings.jsx` |

A nav node with `children` renders as a collapsible group; one with `path` renders as a link. Groups are never navigable themselves. Adding a page means editing `app.jsx`, `navConfig.js`, and every locale file (the `titleKey`), and putting the file in the matching folder.

The sidebar (`src/ui/layouts/sidebar.jsx`) is a **custom `<aside>`, not Gravity's `AsideHeader`** — `AsideHeader`'s `MenuItem` type is flat (it supports `divider` but no children), so it cannot express a tree. Groups auto-expand when they contain the active route; a collapsed group holding the active route stays highlighted. In the icon-only rail, clicking a group re-expands the sidebar rather than doing nothing. Styles live under `.sidebar*` in `src/index.css`.

### Data layer

`src/services/<domain>/{api,query}.js` — `api.js` holds plain async functions returning `res.data`; `query.js` holds the `use*` hooks. Query keys are `['<domain>', '<kind>', ...params]`.

Mutations invalidate the whole domain (`['course']`, `['mentor']`, …) rather than a single key: list keys embed their pagination params, and nested payloads (a course carries its units, lessons and tasks) have no single key to patch. Sending a chat message is the deliberate exception — the server broadcasts it back over the socket, so invalidating would refetch a page of history per message.

List pages wrap their content in `.page-fill` and pass `className="page-fill__section"` to `PageSection` (see `index.css`). The section is `flex: 0 1 auto`: it never grows, so a short table sits directly above its own pagination, but it does shrink, so a long one is capped at the viewport, scrolls internally, and keeps the pagination pinned in view. The page itself never scrolls, and the table header sticks while the rows do. Adding a paginated page means applying both classes, or the pagination drops below the fold.

List pages page through `DataTable`, which renders Gravity's `Pagination` right-aligned with the page sizes from `src/shared/pagination.js` (15/20/30/50, default 15 — the API caps `limit` at 100). `compact` is left at its default so the arrows carry no "previous"/"next" labels. The control shows whenever `total` exceeds the *smallest* page size, not the current one: at 50/page with 20 rows there is one page, but hiding it would strand the user with no way back down to 15.

Multipart is required wherever a file rides along (course image, lesson media, task file, avatars, intro videos, payment-type icons, chat files). The local `asForm` helpers stringify booleans — the DTOs' `@Transform` compares against `'true'`/`'false'` — and drop null/undefined keys so a PATCH can't blank an untouched field.

**Image and video uploads are validated client-side, since the API itself enforces neither type nor size** beyond a generic `image/*`/`video/*` mimetype prefix (chat files are the one exception, capped at 50MB server-side). `shared/utils/fileValidation.js`'s `IMAGE_RULES` (PNG/JPG, ≤1.5MB) and `VIDEO_RULES` (MP4, ≤2GB) are checked with `validateFile()` at the moment a file is picked — before it's queued in form state or handed to a mutation — so a bad pick is rejected immediately rather than after a slow upload. Every image (avatars, course image, payment-type icon, a task's picture content) and video (lesson media, a mentor's intro video, live-lesson recordings) field applies the matching rule; a task's audio content has no stated rule and passes through unchecked, and the `accept` attribute is narrowed to match (`image/png,image/jpeg` / `video/mp4`) as a first line of defense.

**Every such field is a `FileDropCard` (`src/ui/components/fileDropCard.jsx`), not a bare `<input type="file">`.** It's a dashed drop card, fully controlled (`value`/`onChange`, a `File` or `null`): idle it shows a "choose file" button plus what `rules` accepts, holding a file it shows that file's name and size with a way to remove it, and while `progress` (0–100) is a number it shows a bar instead and locks the card. Passing `rules` (`IMAGE_RULES`/`VIDEO_RULES`) makes the card validate on pick itself and reject inline, so callers no longer carry their own `validateFile()` + toast boilerplate — the one exception is the task's mixed audio/picture field, which has no single rule that fits and so validates manually, passing no `rules` to the card. Real upload progress comes from axios: every upload function in `services/*/api.js` takes an `onUploadProgress` inside its variables object and forwards it as `{onUploadProgress}` in the request config, and `shared/hooks/useUploadProgress.js` turns that into `{progress, onUploadProgress, reset}` — `reset()` is called in both `onSuccess` and `onError` so a finished upload's bar doesn't linger. The one deliberate exception is the chat attach button (`groupChat.jsx`): it's a toolbar icon in a message composer, not a form field, so it keeps a plain hidden `<input>`.

Lesson video replacement uses `PATCH .../lessons/:lessonId/media`; deletion uses `DELETE` on the same path and leaves the lesson intact. Task content supports uploaded `audio`/`picture` files plus plain `text`: uploads derive `contentType` from MIME, while sending a string in the task's `file` field marks it as text.

The admin dashboard keeps growth and activity metrics visually separate. `admin/stats/summary` exposes current totals, and splits the `dau`/`wau`/`mau` totals into `activeCourseUserMetrics` and `activeCourselessUserMetrics` objects keyed the same way; each activity stat card shows that split under its total, colour-keyed to the matching chart. `users` is now the **student** count (mentors and admins are excluded, as are their activity rows), and `mentors`/`enrollments` stay current totals. `admin/stats/timeseries` returns `{businessMetrics, activeUserMetrics, activeCourseUserMetrics, activeCourselessUserMetrics}`: business metrics are daily `{date, users, enrollments}` rows only (no `mentors` series, so the growth chart plots new students and new enrollments), while each of the three activity objects is split into daily `dau`, weekly range-based `wau`, and month-based `mau` arrays whose values live in `count`. Growth has a 7/14/30 period control. Activity uses the 30-day response and renders one selected DAU/WAU/MAU metric at a time, preserving each metric's natural time axis: the overall chart on top, then two separate charts below it for active students with and without a course, both following the same toggle.

### Chat

`src/services/chat/socket.js` owns a module-level singleton connection to the `/chat` namespace (origin = API base minus `/api/v{N}`, auth via `access_token`). `subscribeChatSocket(listener)` returns a cleanup function; the socket connects on the first subscriber and disconnects when the last one leaves. Emits queue until `connect`. REST history comes from `chat/{api,query}.js`; the page dedupes socket arrivals against history by id.

**Chat is group chat only.** Every room is a group's, created by the API the moment the group is; there are no 1:1 mentor↔student rooms and no members table — access is derived on each call: an admin can use every room, a mentor only the rooms of groups where they are the **primary** mentor (a support mentor has none), a student only their own group's. `GET {role}/chat/rooms` returns rooms with `group` joined; `rooms/:id` returns `{id, group: {id, title}, mentor, students[]}`. Messages carry `student`/`mentor`/`admin` (exactly one set), so the page marks its own with `message[me.role]?.id === me.id` and labels others' by name. **Chat has no sidebar entry** - it is reached only from a group's own page (an "Open chat" button on the admin detail page and on a mentor's primary-mentor group cards), one shared page (`src/ui/pages/groupChat.jsx`) routed at `/admin/groups/:id/chat` and `/mentor/groups/:id/chat`. The rooms list carries no server-side group filter, so the page loads the caller's accessible rooms (capped at the API's own `limit` max of 100) and matches `group.id` client-side to find the one room it needs - there is no room switcher, since the route already fixes which group's chat this is. A support mentor's group cards render no chat button, since `hasAccess` in the API only admits the primary mentor.

### Known API shapes

Every list endpoint returns `{data, total, page, limit, totalPages}` now — `GET admin/courses`, `GET admin/payment-types` and `GET admin/courses/:id/plans` were the last bare-array holdouts and are paginated too, so `DataTable` never needs an explicit `rows` for them any more (it already falls back to `query.data.data` on its own). None of their pages built pagination controls, though: `getCourses`/`getPaymentTypes`/`getPlans` all default to `limit: 100` (the API's own cap) rather than the usual 15, since a course/plan/payment-type picker elsewhere needs the whole list to choose from, not one page of it.

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

The API has no "get one unit/lesson/task" route, so `useUnit`/`useLesson`/`useTask` are `select`-based hooks over the *parent list's* query key — opening a detail page reuses the list's cached data instead of firing its own request. The lessons and tasks lists (`GET .../lessons`, `GET .../lessons/:lessonId/tasks`) are paginated like everything else — `getLessons`/`getTasks` default to `limit: 100` since neither page has pagination UI, and `useLesson`/`useTask`'s `select` reads `response.data.find(...)`, not the raw result.

`Task.questions` is a **jsonb array with no per-entry ids**, so a question is addressed by array index and every edit, add or delete PATCHes the whole rebuilt `questions` array back onto the task.

A question's `options` decides its type: a non-empty array makes it multiple-choice (the answer renders as a `Select` limited to those options), `null` makes it free-text (a plain input). The editor keeps one input per option rather than a comma-separated field, and drops blank rows on save — clearing every option is how a question becomes free-text again. `task-submission.service.ts` lowercases **both** sides when grading, so the answer-must-be-among-options check is case-insensitive too. The API itself does not cross-validate answer against options; that rule is ours, because an answer absent from the options can never be selected.

Pages inside a hierarchy pass a `breadcrumbs` trail to `PageHeader` (`[{title, to}, …]`, last entry omitting `to`). Ancestor titles come from the same `select`-based hooks the pages already use, so the trail costs no extra requests. `showRoot` keeps the first crumb pinned when Gravity collapses the middle on narrow viewports.

Admin access to payments is **read-only** by design; status changes only through the Click webhooks. Cash and transfer sales are recorded via `POST admin/enrollments` instead — reachable from the **student detail page** (`EnrollStudentDialog`), where the student is already fixed by the route, rather than from the enrollments list, which stays read-only. `dto.studentId` is the **Student entity id**, which is what `/admin/users/students/:id` carries. `courseId` and `planId` are **both required** (the plan must belong to the course — the server 400s otherwise) and there is no `purchaseAmount` override or plan-less enrollment any more: the price is always the plan's own, and `start` is the only optional field.

A payment no longer carries a direct enrollment/plan FK — it funds a `Purchase`, which links it to a `Subscription` (student + plan + start/end), and that's where the paid-for course and term actually live: `payment.purchases?.[0]?.subscription?.plan?.course`. `payments.jsx`'s course column reads that path rather than a `payment.enrollment`/`payment.plan` shortcut, which no longer exists.

`GET admin/students` and `GET admin/mentors` share a shape: a case-insensitive `search`, an `isActive` filter on the *account*, a whitelisted `sortBy` and `sortOrder`. They differ in what's searchable and sortable — students add `level` (`A1`–`C2`), `hasCourse`, an `activeCoursesCount` response field, and sort on `points`/`coins`/`balance`; mentors add `role` (the mentor's own fixed `primary`/`support` classification — filterable *and* sortable, distinct from a `GroupMentor`'s per-group `role`) and filter on `MentorStatus`. A mentor's employment `status` and whether their account can sign in (`user.isActive`) are separate filters and separate columns.

`MentorStatus` is `working`/`vacation`/`fired` (lowercase on the wire) — `changeStatus` ties `user.isActive` to `status === 'working'` server-side, so the mentor-detail status control is the only place that flips sign-in access, not a separate toggle. Both `Mentor` and `Student` also carry an optional `gender` (`male`/`female`), shown as a `Field`/inline label and, on the mentor form, an optional `Select` — there's no filter or column for it anywhere, it's profile data only.

An admin can set a mentor's avatar directly — `PATCH admin/mentors/:id/avatar` (multipart `avatar`), alongside the existing `PATCH admin/mentors/:id/intro-video` — rather than only through the mentor's own `PATCH mentor/me/avatar`. `mentorDetail.jsx` puts the upload button next to the avatar itself, the same layout `settingsPage.jsx` uses for a self-service avatar.

Both search boxes are debounced through `useDebouncedValue`, but `page` resets on the keystroke itself, not on the debounced value — otherwise a search could land on a page number the narrowed results don't have.

List-page filter controls carry persistent labels through `FormField`; option text such as "all" is a value, not a substitute for naming the filter. This is especially important where multiple filters can simultaneously display the same "all" value.

**Sorting lives in the table header, not a dropdown.** `DataTable` wraps Gravity's `withTableSorting`: mark a column `meta: {sort: true}` and pass `sortBy`/`sortOrder`/`onSortChange`. A column's **`id` is sent verbatim as the API's `sortBy`**, so it has to be the field name the endpoint whitelists (hence the name column is keyed `firstName`) — and a column with no server-side counterpart, like the account-status one, simply omits `meta.sort` and renders a plain header. `disableDataSorting` is set because the rows on screen are one server-sorted page; re-sorting them locally would only shuffle that page. Clicks cycle asc → desc → cleared, and a cleared column falls back to `defaultSortBy` (`createdAt`, DESC) rather than sending no sort at all. `meta.defaultSortOrder: 'desc'` makes dates and numbers start newest/highest-first.

`GET admin/enrollments` filters on `studentId`, `courseId` and `status`, and sorts by a whitelisted `sortBy` (`createdAt`/`updatedAt`/`start`/`status`) plus `sortOrder`. An enrollment carries no term of its own — `status` (`created`/`active`/`cancelled`) is the whole story; there is no `end` column and no `isExpired` filter any more, so nothing here derives or renders an expiry. The paid-for period lives one level down, on a `Subscription` (see the Payments section below).

**Pending enrollments are enrolment *requests*, queued by an external service (CRM, terminal) and resolved by an admin** — `GET admin/pending-enrollments` (filters `userId`, `courseId`, `status`; sorts on `createdAt`/`updatedAt`/`start`/`status`) plus `PATCH .../:id/accept` and `PATCH .../:id/reject`. They live in `services/enrollment/{api,query}.js` under the `['enrollment', 'pending', …]` key rather than a domain of their own, so accepting one invalidates both lists at once. A request has no `end` (only a `start`), and `pendingEnrollments.jsx` deliberately never renders it as a sortable column: the API's own sort whitelist for this endpoint still lists `end` even though the column was dropped from the entity, so sending `sortBy=end` would 500 server-side — an upstream bug, worked around here by simply not exposing that sort.

**Enrollment progress is the one place the course tree arrives whole.** `GET admin/enrollments/:enrollmentId/students/:studentId/progress` (`useEnrollmentProgress`, key `['enrollment', 'progress', …]`) returns the course with `units[].lessons[]` and a calculated `progress` percentage per level — the opposite of the paged-out tree everywhere else, so this page walks the nested payload directly and derives its "completed" count from `lesson.progress === 100`. Both ids are in the URL (`/admin/users/students/:studentId/enrollments/:enrollmentId/progress`, linked from the student detail page) and the API validates that the enrollment belongs to the student.

Only a `created` request can be decided, so the action buttons render on those rows alone and the page's status filter **defaults to `created`** — it is a work queue, not an archive. A request carries no plan: `AcceptPendingEnrollmentDialog` picks one (`usePlans(row.course.id)`, and it must belong to the requested course), because price and duration are only settled at approval. `amount` is optional and falls back to the plan's price. Accepting opens the enrollment `active` **and** writes a `paid` payment in one server-side transaction — the money was collected outside Click/Payme, as with a manual enrollment — hence the `['payment']`/`['student']`/`['stats']` invalidations that rejecting doesn't need. The row points at the **`User`**, not the `Student`, so there is no student page to link a row to.

### Groups

A group is a named cohort — a title, a weekly `schedule`, a mentor side and a student roster, and the **only** student↔mentor pairing mechanism (there is no separate booking/assignment flow, and a mentor has no schedule of their own). Its chat room and its live lessons (see below) both hang off the group rather than off any one student. `services/group/{api,query}.js`; admins manage everything under `admin/groups`. Mutations invalidate `['group']`, `['student']` and `['chat']` — a roster or mentor change can change the group's chat room's header and who can reach it.

**List rows and the single-group detail are two different shapes, for both roles.** `GET admin/groups` and `GET mentor/groups/me` (a mentor's own, paginated, `useMyGroups({page, limit: 100})` since that list has no pagination UI) both answer with the lightweight `Group & {primaryMentor}` row — the full mentor profile, `null` if the group has none yet — and **no** `mentors[]`/`students[]`; the mentor variant adds the calling mentor's own `role` in each. `mentor/groups.jsx` mirrors the admin list's own table (`groups.jsx`) almost exactly — same columns, same row-click-to-detail — just without the search/filter bar or a create button, since a mentor's own list is never large enough to need them, and filtered down to `role === 'primary'` first: a support mentor has no action available on a group they don't lead (no chat, no live lesson, no recording upload) and would otherwise land on a bare detail page.

`GET mentor/groups/:id` (`useMyGroup`, `mentor/groupDetail.jsx`) is the fuller shape, same as `GET admin/groups/:id` (every mentor with their per-group `role`, every student) — the server 403s if the calling mentor isn't a member of that group at all. Unlike the admin page, it's read-only end to end: a mentor has no group mutation route whatsoever, not even for their own group's schedule. It derives "am I this group's primary mentor" from `mentors[]` rather than trusting the list's own filter, since a bookmarked or shared URL can reach the detail page without ever passing through that filter — a wrong assumption there would offer live-lesson/recording actions the server would then reject.

`schedule` is keyed by weekday, and the **time values are free text** (`18:00-19:30`, `20:00 - special session`), not HH:MM slots; the server only rejects blank entries. It has its own row-per-entry editor (`groupSchedule.jsx`, drafts trimmed by `cleanFreeSchedule`). On the admin group page it edits **inline, in its own card** (`groupDetail.jsx`'s Schedule `PageSection` toggles an edit mode and PATCHes `{schedule}` alone) rather than through the group edit dialog — `GroupFormDialog`'s schedule field only appears on create, since editing one already has its own place.

`isActive` has no header-level toggle either — there is no `activate`/`deactivate` button on `groupDetail.jsx`. It is a `Switch` inside `GroupFormDialog`, shown only when editing (creating always starts active, matching the entity default, and `CreateGroupDto`/`UpdateGroupDto` don't carry the field at all). Because the API sets it through its own `:id/activate`/`:id/deactivate` routes rather than the general `PATCH`, toggling it in the dialog fires a second mutation (`useSetGroupActive`) after the title/schedule one succeeds, only when the switch actually changed.

`Mentor.role` (`services/group/query.js`'s `GROUP_MENTOR_ROLE`, reused rather than duplicated — it's the same `primary`/`support` enum) is a fixed classification on the mentor's own account, separate from any one group's `GroupMentor.role`; the two always agree, because `assignPrimaryMentor`/`addSupportMentor` reject a mentor whose own `role` doesn't match. `mentorForm.jsx`'s create form requires picking one (the DTO has no default); the mentor picker in `groupRosterDialogs.jsx` filters its search to the matching classification so a rejection is never possible from the UI.

**A live lesson is a create-only "go live now" broadcast, not a schedulable resource** — `POST mentor/live-lessons` (`{name, meetLink, groupId}`) is the only route the panel calls; there is no list, detail, update or delete, and no `startTime`/`endTime`. Submitting it pushes a notification to every student in the group and the panel throws the response away — `useCreateLiveLesson`/`useUploadRecording` (`services/live-lesson/{api,query}.js`) are plain mutations with nothing to invalidate. So it has no page or nav entry of its own: "Start live lesson" and "Upload recording" are buttons on a mentor's own group card (`mentor/groups.jsx`, dialogs in `liveLessonDialogs.jsx`), alongside "Chat" — all three need the calling mentor to currently be that group's **primary** mentor (`group.role === GROUP_MENTOR_ROLE.PRIMARY`), so none render on a card where they're only support. Recording upload (`mentor/live-lesson-recordings/groups/:groupId`) is a separate, unrelated entity keyed by the same group.

Every roster mutation answers with the full detail (`group` + `mentors[]` each `{role, mentor}` + `students[]`). A group has **at most one `primary` mentor**: assigning one replaces whoever holds it and promotes an existing `support` mentor in place, so "make primary" goes through the same `primary-mentor` route. A student is in **at most one group**: adding only works for a student with no group (the server 400s, naming the ids, otherwise), and moving one is `swap` (`PATCH …/students/:studentId/swap`, `{toGroupId}`), which answers with the *target* group, so the page navigates there. The student and mentor pickers are server-searched `Select`s (`RemoteSelect` in `groupRosterDialogs.jsx`) that remember picked items across searches. There is no "students without a group" filter, so already-grouped students appear in the picker and the server rejects them.

### Task submissions

The panel's only task-submission route: `GET admin/task-submissions/students/:studentId/lessons/:lessonId` (`useStudentLessonResults`) returns a whole lesson's tasks with the answers one student gave — and, unlike every student-facing route, it **includes the answer key** (`question.answer`) plus a per-question `isCorrect`, because an admin reviewing a wrong answer needs to see what was expected. It hangs off the same `task-submissions` controller but carries a method-level `@Roles(ADMIN)` that overrides the class's `@Roles(STUDENT)`, and it takes the **Student entity id** (what `/admin/users/students/:id` carries), not the user id. It skips the enrollment check the student routes run, so an expired or cancelled enrollment's results still open.

`isCorrect` is `null`, not `false`, on a task the student never submitted — "no result" and "failed" are different things, and the page's counters exclude question-less tasks entirely, since the server can never mark one passed. The option-matching in `studentLessonResults.jsx` mirrors `taskAnswersMatch` server-side (lowercase, strip everything non-letter), so `A.` and `a` are the same option; an option can be both picked and correct, and `.submission-option`'s `data-correct` rule is declared after `data-picked` so that case reads green rather than red.

### Push notifications

Almost every push the platform sends is event-driven and lives entirely in the API (enrollment opened, lesson added, mentor assigned). The panel owns the **one manual path**: `POST admin/notifications/push` in `services/notification/{api,query}.js`, taking `{title (≤100), body (≤1000), audience, phoneNumbers?}`.

`audience` (`all` / `students` / `mentors` / `phones`) is required by the DTO so a blast to everyone can never be a forgotten field, and there is no separate single-recipient route — one user is a `phones` list of one. The page mirrors that intent: it defaults to `phones`, shows a warning instead of a recipient field on the three mass audiences, and routes every send through `ConfirmDialog` naming who is about to get it. Nothing is invalidated afterwards, because a push leaves no row behind to read back.

The response **is** the deliverable: `{devices, sent, failed, removedTokens}`, plus `notFound` (no such user) and `withoutDevice` (user exists, never opened the app) for a `phones` send — a distinction the report renders separately, since a wrong number and an uninstalled app call for different follow-ups. It is held in page state until the next send, as it can't be refetched. Delivery happens *inside* the request in chunks of 500, so a large audience simply means a slow response. A **503** means `GOOGLE_SERVICES_JSON` is unset on the server; its message is surfaced as-is rather than reported as a zero-device success.

The phone box parses newline/comma-separated entries and strips each to digits (numbers are stored bare as `998XXXXXXXXX`), then splits them into valid and invalid *before* sending — a rejected batch is all-or-nothing server-side, so a typo is caught in the field.

### Conventions

4-space indent, single quotes, semicolons. Admin pages are grouped by nav section (see the table above); mentor and student pages are flat under `src/ui/pages/{mentor,student}/`. Shared building blocks are `src/ui/components/<name>.jsx`. Component styling is inline `style={{...}}` objects with `var(--g-color-*)` tokens — no CSS modules. `src/index.css` takes what inline styles cannot express: the reset, `.sidebar*`, `.page-fill*`, `.data-table*`, and the page-specific `.progress-*` / `.submission-*` blocks, which exist because they need `:first-child`, `[data-selected]` or a `max-width: 680px` query rather than because they are shared.

**Theme.** `src/theme.css` (imported after Gravity's own stylesheets) overrides Gravity's brand tokens with a green ramp derived from `public/brand.png` — the logo's average green is `#31cf70`, i.e. `hsl(144, 62%, 50%)`. Buttons carry **white** label text, and that choice sets the base: white needs 4.5:1 for normal-size text, which the logo green itself fails badly (2.04:1). So `--g-color-base-brand` is the deeper `#1d7c43` of the same hue — 5.23:1 against white — rather than the literal logo colour, which survives in the selection tint and the dark theme's accent text. Both themes use the same base, since the label is white in both. `--g-color-text-brand` matches it on light and inverts lighter on dark, where it has to lift off a dark background. Light is the default mode, and `prefers-color-scheme` is deliberately **not** consulted — only an explicit in-app choice switches it.

ESLint runs `react-hooks` v7, whose `set-state-in-effect` rule is an **error**. Seed form state from server data by splitting a loader component from a fields component and passing `initialValues` + a `key` (or, for a dialog, mounting the fields only while `open`), rather than syncing inside `useEffect` — see `mentorForm.jsx` and `admin/groups/groupFormDialog.jsx`. Note `no-unused-vars` is `'off'`, so lint won't catch dead imports.
