# Learning Platform API — Endpoint Reference

Extracted directly from `/Users/khberv/Projects/learning-platform-api`. Use this when wiring up `src/services/<domain>/api.js` + `query.js` on the web side.

Live OpenAPI/Swagger UI: `http://localhost:<PORT>/docs`.

---

## Conventions

- **Base URL** — `http://localhost:<PORT>/api` (global prefix `api`, configured in `src/main.ts`).
- **Auth** — JWT in `Authorization: Bearer <accessToken>` on every endpoint except `auth/*` (which are `@Public()`).
- **Refresh** — `POST /auth/refresh` expects the *refresh* token in the Bearer header, not the access token.
- **Validation** — global `ValidationPipe` (whitelist + forbidNonWhitelisted + transform). Unknown fields are stripped. Error messages are written in Uzbek.
- **Roles** — enforced by `RolesGuard` reading `user.roles: ('student' | 'teacher' | 'admin')[]`. Determined by which relation (`student`/`teacher`/`admin`) is populated on the `User` row.
- **Error shape** — standard Nest exceptions: `{ statusCode, message, error }`.
- **Uploads** — multipart/form-data. Files are served as static assets under `/public/<subfolder>/<filename>`. The DB stores that public path.
- **Naming** — application JSON uses **camelCase** even though DB columns are snake_case.

---

## Common shapes

```ts
// User (returned by GET /user/me — has `roles[]`, no student/teacher/admin relation objects)
type User = {
  id: string
  firstName: string
  lastName: string | null
  avatar: string | null
  email: string | null
  phoneNumber: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  roles: ('student' | 'teacher' | 'admin')[]
}

type Student = {
  id: string
  user: User              // populated when fetched via /students/me
  points: number          // default 0
  coins: number           // default 0
  level: 'A1'|'A2'|'B1'|'B2'|'C1'|'C2'
  createdAt: string
  updatedAt: string
}

type Teacher = {
  id: string
  user: User
  status: 'active' | 'fired' | 'suspended'
  profession: string | null
  introVideo: string | null   // public path, e.g. /public/teacher-intro/<file>
  summaryRating?: number      // computed: rounded mean of feedbacks.rate, 1 decimal
  feedbacks?: TeacherFeedback[]
  statusHistories?: TeacherStatusHistory[]
  createdAt: string
  updatedAt: string
}

type TeacherFeedback = {
  id: string
  teacher: Teacher
  student: Student
  text: string
  rate: number          // 0..5 (smallint)
  createdAt: string
  updatedAt: string
}

type Course = {
  id: string
  title: string
  description: string | null
  image: string | null    // public path
  price: number           // int, default 0
  isActive: boolean       // default false
  units: (Unit & { lessonsCount: number })[]
  lessonsCount: number    // sum of unit.lessonsCount
  createdAt: string
  updatedAt: string
}

type Unit = {
  id: string
  title: string
  lessons: Lesson[]
  createdAt: string
  updatedAt: string
}

type Lesson = {
  id: string
  title: string
  description: string | null
  media: string | null     // public path, e.g. /public/lesson/<file>
  createdAt: string
  updatedAt: string
}

type Enrollment = {
  id: string
  student: Student
  course: Course
  start: string            // ISO timestamp
  end: string
  createdAt: string
  updatedAt: string
}

type Assignment = {
  id: string
  teacher: Teacher
  student: Student
  startDate: string
  endDate: string
  status: 'pending' | 'active' | 'rejected' | 'expired'  // 'expired' is computed in-memory when active && endDate < now
  createdAt: string
  updatedAt: string
}

type Assessment = {
  id: string
  student: Student
  inputAudio: string      // public path
  feedbackText: string
  feedbackAudio: string   // public path (.wav)
  createdAt: string
  updatedAt: string
}
```

---

## Health

### `GET /` — service status — **public**

Request: none.
Response 200:
```json
{ "ok": true, "timestamp": "2026-05-18T..." }
```

---

## Auth — `/auth/*` — **public**

### `POST /auth/sign-up`
Creates `User` + `Student` and returns tokens.

Request body:
```json
{
  "firstName": "Ali",
  "phoneNumber": "998900012644",   // must match /^998\d{9}$/
  "password": "12345678"
}
```

Response 201:
```json
{ "accessToken": "<jwt>", "refreshToken": "<jwt>" }
```

Errors: `400 Boshqa telefon raqam kiriting` (phone exists), `400` validation.

---

### `POST /auth/sign-in`
Supply **either** `email` **or** `phoneNumber` plus `password`.

Request body:
```json
{
  "phoneNumber": "998900012644",
  "password": "12345678"
}
```
or
```json
{
  "email": "user@example.com",
  "password": "12345678"
}
```

Response 200: `{ accessToken, refreshToken }`
Errors: `401 Login yoki parol noto'g'ri`, `401 Hisobingiz faol emas`.

---

### `POST /auth/refresh`
Header: `Authorization: Bearer <refreshToken>`. Body empty.

Response 200: `{ accessToken, refreshToken }`.

---

## User — `/user/*`

### `GET /user/me` — **any authenticated**
Returns the calling user with roles flattened.

Response 200:
```json
{
  "id": "uuid",
  "firstName": "Ali",
  "lastName": null,
  "avatar": null,
  "email": null,
  "phoneNumber": "998900012644",
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "...",
  "roles": ["student"]
}
```

---

## Student — `/students/*` — **role: STUDENT**

### `GET /students/me`
Response 200: `Student` with `user` populated.
Errors: `404 Talaba topilmadi`.

---

## Teacher — `/teachers/*`

> Two controllers share `/teachers`. The student-facing controller is registered first; admin handlers are only reachable on routes the student controller does not own (e.g. `POST /teachers`, `PATCH /teachers/:id`, `PATCH /teachers/:id/status`). `PATCH /teachers/me` is teacher-only and matched literally before `:id`.

### `GET /teachers` — **role: STUDENT**
List active teachers with computed `summaryRating`.
Response 200: `Teacher[]` (each with `user`, `feedbacks`, `summaryRating`).

### `GET /teachers/:id` — **role: STUDENT**
Single active teacher with feedbacks + `summaryRating`.
Errors: `404 O'qituvchi topilmadi`.

### `POST /teachers/:id/feedbacks` — **role: STUDENT**
Request body:
```json
{ "text": "Great teacher!", "rate": 5 }   // rate: int 0..5
```
Response 201: `TeacherFeedback`.

### `PATCH /teachers/me` — **role: TEACHER** — multipart
Upload teacher intro video.
Form field: `video` (binary). MIME: video/*.
Response 200: `Teacher` (with `introVideo` set to `/public/teacher-intro/<file>`).

### `POST /teachers` — **role: ADMIN**
Request body (`CreateTeacherDto`):
```json
{
  "firstName": "Sabina",
  "lastName": "Rakhimova",
  "email": "sabina@example.com",
  "phoneNumber": "998931112948",
  "profession": "English",
  "password": "<min 6 chars>"
}
```
Response 201: `Teacher` (with `user`).
Errors: `400 Bu telefon raqam band`.

### `GET /teachers/:id` — **role: ADMIN** (shadowed by student route, but admin can hit same path)
Returns `Teacher` with `user` + `statusHistories[].changedBy`.

### `PATCH /teachers/:id` — **role: ADMIN**
Request body: any subset of `CreateTeacherDto` fields. `password` re-hashed.
Response 200: updated `Teacher`.

### `PATCH /teachers/:id/status` — **role: ADMIN**
Request body:
```json
{ "status": "active" }    // 'active' | 'fired' | 'suspended'
```
Side-effects: appends `TeacherStatusHistory`, syncs `User.isActive` (true only when status === 'active').
Response 200: updated `Teacher`.

---

## Courses — `/courses/*`

> Three controllers share `/courses`. Registration order in modules:
> - `CourseModule.controllers = [CourseController, AdminCourseController]` (course module)
> - `EnrollmentModule.controllers = [StudentCourseController, EnrollmentController, AdminEnrollmentController]` — `StudentCourseController` *also* uses `@Controller('courses')` for `/courses/available` and `/courses/me`.

### `GET /courses` — **role: STUDENT**
Active courses with `lessonsCount` per unit + total.
Response 200: `Course[]`.

### `GET /courses/available` — **role: STUDENT**
Active courses the calling student is **not** currently enrolled in.
Response 200: `Course[]`.

### `GET /courses/me` — **role: STUDENT**
Student's enrollments with progress aggregates.
Response 200:
```json
[
  {
    "id": "uuid",                // Enrollment id
    "student": { ... },
    "course": { ... },           // includes units.lessons
    "start": "ISO",
    "end": "ISO",
    "progresses": [{ "id":"...","progress":78, ... }],
    "lessonsCount": 24,
    "totalProgress": 42,         // rounded average of progress.progress over lessonsCount
    "status": "active" | "expired",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### `GET /courses/:id` — **role: STUDENT**
Single active course. Response 200: `Course`.
Errors: `404 Kurs topilmadi`.

### `POST /courses` — **role: ADMIN** — multipart
Form fields:
- `title` (required, string)
- `description` (string)
- `price` (number, default 0)
- `isActive` (boolean, accepts `"true"`/`"false"`)
- `image` (binary, optional)
Response 201: created `Course` (without computed `lessonsCount`).

### `GET /courses` — **role: ADMIN** (overlapping path — admin can also call)
Response 200: all courses (including inactive).

### `GET /courses/:id` — **role: ADMIN**
Response 200: `Course` (active or not).

### `PATCH /courses/:id` — **role: ADMIN** — multipart
Same fields as POST, all optional. Response 200: updated `Course`.

### `DELETE /courses/:id` — **role: ADMIN**
Response: **204 No Content**.

---

## Units (nested under course) — **role: ADMIN**

### `POST /courses/:courseId/units`
```json
{ "title": "Unit 1" }
```
Response 201: `Unit`.

### `PATCH /courses/:courseId/units/:unitId`
Body: `{ "title"?: string }`.
Response 200: `Unit`.

### `DELETE /courses/:courseId/units/:unitId`
Response: **204**.

---

## Lessons (nested under unit) — **role: ADMIN**

### `POST /courses/:courseId/units/:unitId/lessons` — multipart
Form fields:
- `title` (required)
- `description` (optional)
- `media` (binary video, optional)
Response 201: `Lesson` (with `media` set to `/public/lesson/<file>`).

### `PATCH /courses/:courseId/units/:unitId/lessons/:lessonId`
Body: `{ title?, description? }` (no file replacement — media only set at create time).
Response 200: `Lesson`.

### `DELETE /courses/:courseId/units/:unitId/lessons/:lessonId`
Response: **204**.

---

## Enrollments — `/enrollments/*`

### `GET /enrollments/history` — **role: STUDENT**
Calling student's `EnrollmentHistory[]` ordered by `createdAt DESC`. Each entry has `purchaseAmount`, `start`, `end`, and `enrollment.course`.

### `POST /enrollments` — **role: ADMIN**
Request body (`CreateEnrollmentDto`):
```json
{
  "studentId": "uuid",
  "courseId": "uuid",
  "start": "2026-05-18T00:00:00.000Z",
  "end": "2026-11-18T00:00:00.000Z",
  "purchaseAmount": 99.99
}
```
Side-effect: also writes an `EnrollmentHistory` row.
Response 201: `Enrollment`.

---

## Assignments — `/assignments/*`

> Status semantics: stored values are `pending | active | rejected`. The service computes `expired` on the fly when `status === 'active' && endDate < now`.

### `POST /assignments` — **role: STUDENT**
Student offers a teacher to coach them for a date range.
Request body:
```json
{
  "teacherId": "uuid",
  "startDate": "2026-05-10T09:00:00.000Z",
  "endDate":   "2026-08-10T09:00:00.000Z"
}
```
Errors: `400` if `endDate <= startDate`; `404 O'qituvchi topilmadi` if teacher not active.
Response 201: `Assignment` with `status: 'pending'`.

### `GET /assignments/pending` — **role: TEACHER**
Calling teacher's pending offers (`student` populated).

### `PATCH /assignments/:id/accept` — **role: TEACHER**
Errors: `400` if not pending, `403 Ruxsat berilmagan` if not owner.
Response 200: `Assignment` with `status: 'active'`.

### `PATCH /assignments/:id/reject` — **role: TEACHER**
Response 200: `Assignment` with `status: 'rejected'`.

### `GET /assignments` — **role: ADMIN**
Optional query `?status=pending|active|rejected|expired`.
Response 200: `Assignment[]` (with computed `expired`).

### `GET /assignments/:id` — **role: ADMIN**
Response 200: `Assignment` (with computed `expired`).

---

## Assessments — `/assessments/*` — **role: STUDENT**

Speaking practice: submit audio → Gemini analyzes + synthesizes spoken feedback.

### `POST /assessments` — multipart
Form field: `audio` (binary, mime `audio/*`).
Errors: `400 Audio fayl yuborilmagan`.
Response 201: `Assessment` (`inputAudio`, `feedbackText`, `feedbackAudio`).

### `GET /assessments/me`
Response 200: `Assessment[]` for the calling student, newest first.

---

## Match — WebRTC signaling — **WebSocket**

Not REST. Socket.IO at namespace **`/match`**. Auth: pass the access token as `auth.token` in the handshake or `Authorization: Bearer …` header.

Client → server: `search`, `cancel`, `signal` (`{ data }` — opaque SDP/ICE relay), `leave`.
Server → client: `searching`, `matched` (`{ sessionId, role: 'caller' | 'callee' }`), `signal`, `partner-left` (`{ reason: 'leave' | 'disconnect' }`), `cancelled`, `left`, `replaced`, `unauthorized`, `error`.

Pairing rule: the user already in the queue is `callee`; the newcomer is `caller` and creates the SDP offer first.
A second connection from the same user kicks the first (emits `replaced`, then disconnects).

---

## Web service-layer mapping

To wire this into the existing `src/services/<domain>/` layout in `learning-platform-web`:

| Domain folder              | Endpoints                                                          |
| -------------------------- | ------------------------------------------------------------------ |
| `services/auth/`           | `auth/sign-in`, `auth/sign-up`, `auth/refresh`                     |
| `services/user/`           | `user/me`                                                          |
| `services/student/`        | `students/me`                                                      |
| `services/teacher/`        | `teachers`, `teachers/:id`, `teachers/:id/feedbacks`, `teachers/me` |
| `services/admin-teacher/`  | admin `POST/PATCH /teachers/*`, `PATCH /teachers/:id/status`       |
| `services/course/`         | student `GET /courses`, `GET /courses/:id`                         |
| `services/admin-course/`   | admin course CRUD + nested units + lessons                          |
| `services/enrollment/`     | `enrollments/history`, `enrollments` (admin POST)                  |
| `services/student-course/` | `courses/available`, `courses/me`                                  |
| `services/assignment/`     | `assignments` (student POST, teacher GET pending + accept/reject, admin GET) |
| `services/assessment/`     | `assessments` (POST multipart), `assessments/me`                   |

`useInfoMutation`'s `queryKey` should match the resource: e.g. `['teacher']`, `['course']`, `['enrollment']`. The hooks I'd plug into the existing UI mocks:

- `useGetMe()` → `user/me`
- `useSignIn()` → `auth/sign-in` (already exists)
- `useGetAllTeachers()` (admin) → `teachers` (admin variant)
- `useGetActiveTeachers()` (student) → `teachers`
- `useGetTeacher(id)` → `teachers/:id`
- `useCreateTeacher()` → `POST teachers`
- `useUpdateTeacher()` → `PATCH teachers/:id`
- `useChangeTeacherStatus()` → `PATCH teachers/:id/status`
- `useGetAllCourses()` (admin) → `courses` (admin)
- `useGetCourse(id)` → `courses/:id`
- `useCreateCourse()` / `useUpdateCourse()` / `useDeleteCourse()` → admin course routes
- `useCreateUnit()` / `useUpdateUnit()` / `useDeleteUnit()`
- `useCreateLesson()` / `useUpdateLesson()` / `useDeleteLesson()`
- `useCreateEnrollment()` (admin) → `POST enrollments`
- `useGetMyEnrollmentHistory()` (student) → `enrollments/history`
- `useGetAvailableCourses()` / `useGetMyCourses()` (student)
- `useCreateAssignment()` / `useGetPendingAssignments()` / `useAcceptAssignment()` / `useRejectAssignment()` / `useGetAllAssignments()`
- `useCreateAssessment()` (multipart) / `useGetMyAssessments()`
