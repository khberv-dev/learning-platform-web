# Learning Platform API

NestJS REST + WebSocket API. All HTTP routes are mounted under the global prefix **`/api`** (`app.setGlobalPrefix('api')` in `src/main.ts`). Swagger UI is served at `/docs`. Static uploads are served from `/public/*` (mapped to `./uploads`).

Authentication is JWT bearer. A global `JwtAccessGuard` protects every endpoint unless `@Public()` is set. A global `RolesGuard` enforces `@Roles(...)` metadata against `user.roles`. The refresh route uses `JwtRefreshGuard` (separate `passport-jwt` strategy named `jwt-refresh`, secret = `JWT_REFRESH_SECRET`).

Validation: a global `ValidationPipe` runs with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`. Unknown body fields are rejected.

CORS: `app.enableCors()` (open to all origins).

## Conventions

- All times are ISO 8601 strings on the wire.
- All IDs are UUID v4 strings.
- All routes below include the `/api` global prefix.
- Pagination uses `PaginationQuery`: `page: number = 1`, `limit: number = 10`.
- Paginated response: `{ data: T[]; total: number; page: number; limit: number; totalPages: number }`.
- Authorization header for both access and refresh tokens: `Authorization: Bearer <token>`.

## Enums

- **UserRole**: `student`, `teacher`, `admin`
- **TeacherStatus**: `active`, `fired`, `suspended`
- **StudentLevel**: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`
- **EnrollmentStatus**: `active`, `expired` (derived from start/end at runtime)
- **AssignmentStatus**: `pending`, `active`, `rejected`, `expired`

## Endpoints

### Auth (`auth/`, public)
- `POST auth/sign-up` body `{firstName, phoneNumber, password}` → `{accessToken, refreshToken, roles}`
- `POST auth/sign-in` body `{email?, phoneNumber?, password}` → `{accessToken, refreshToken, roles}`
- `POST auth/refresh` (Bearer = refresh token) → `{accessToken, refreshToken}`

### User
- `GET user/me` → current `User` with `roles[]`

### Students
- `GET students/me` (student) → current `Student`
- `GET students` (admin) `?page&limit` → `Paginated<Student>`

### Teachers
- `GET teachers` — two controllers register this path; `TeacherController` (student) is registered first so it wins routing and returns a **plain array** of active teachers w/ `summaryRating`. The admin `AdminTeacherController.findAll` (`Paginated<Teacher>`) is shadowed. Frontend `getTeachers` normalizes both shapes into a paginated envelope.
- `GET teachers/me/summary` (teacher) → `{totalStudents, newStudentsThisMonth, liveSessionsScheduled, averageRating, pendingApprovals}`
- `GET teachers/:id` (student/admin role-routed)
- `POST teachers/:id/feedbacks` (student) body `{text, rate}`
- `PATCH teachers/me` (teacher) multipart `video`
- `POST teachers` (admin) body `CreateTeacherDto`
- `PATCH teachers/:id` (admin) body `UpdateTeacherDto`
- `PATCH teachers/:id/status` (admin) body `{status}`

### Courses
- `GET courses` (student) → active courses
- `GET courses/:id` (student)
- `GET courses/available` (student)
- `GET courses/me` (student) → enrolled
- `GET courses` (admin) → all courses
- `GET courses/:id` (admin)
- `POST courses` (admin) multipart `image` + `CreateCourseDto`
- `PATCH courses/:id` (admin) multipart `image` + `UpdateCourseDto`
- `DELETE courses/:id` (admin)
- `POST courses/:courseId/units` (admin) body `{title}`
- `PATCH courses/:courseId/units/:unitId` (admin) body `{title?}`
- `DELETE courses/:courseId/units/:unitId` (admin)
- `POST courses/:courseId/units/:unitId/lessons` (admin) multipart `media` + `CreateLessonDto`
- `PATCH courses/:courseId/units/:unitId/lessons/:lessonId` (admin) body
- `DELETE courses/:courseId/units/:unitId/lessons/:lessonId` (admin)

### Enrollments
- `GET enrollments/history` (student)
- `POST enrollments` (admin) body `CreateEnrollmentDto`

### Chat (any authenticated user)
- `POST chat/rooms` body `{memberIds: string[], name?}` — creator is auto-added. If total members > 2 the room is marked `isGroup: true`.
- `GET chat/rooms` `?page&limit` → `Paginated<ChatRoom>` ordered by `updatedAt DESC`. Each room includes `members[].user`.
- `GET chat/rooms/:id` → room detail with `members[].user`.
- `GET chat/rooms/:id/messages` `?page&limit` → `Paginated<ChatMessage>` ordered by `createdAt DESC`. Each message includes `sender`.
- `POST chat/rooms/:id/messages` body `{text: string}` (max 4000 chars). Creates a `type: 'text'` message and broadcasts via `/chat` WS.
- `POST chat/rooms/:id/messages/file` multipart `file` (max **50 MB**). Stored under `/public/chat/...`. Returns a `type: 'file'` message with `filePath`, `fileName`, `fileSize`, `fileMimeType`.

#### Chat WebSocket (`/chat` Socket.IO namespace)
- Auth: JWT access token via `socket.handshake.auth.token` or `Authorization: Bearer <token>` header.
- On connect: server auto-joins the socket to every room the user is a member of (no manual join needed).
- Client → server: `join {roomId}`, `leave {roomId}`.
- Server → client: `message ChatMessage`, `joined {roomId}`, `left {roomId}`, `error {message}`.

### Groups (teacher)
- `POST groups` body `{name, description?}` → new group (empty students)
- `GET groups` `?page&limit` → paginated groups owned by current teacher
- `GET groups/:id` → group detail with `students[]` (each w/ nested `user`)
- `PATCH groups/:id` body `{name?, description?}`
- `PATCH groups/:id/deactivate` → sets `isActive=false`
- `POST groups/:id/students/:studentId` → adds student; requires an active assignment between this teacher and the student
- `DELETE groups/:id/students/:studentId` → removes student (204)

### Assignments
- `POST assignments` (student) body `{teacherId, startDate, endDate}`
- `GET assignments/pending` (teacher) — pending assignments addressed to the current teacher
- `GET assignments/history` (teacher) `?page&limit` — paginated non-pending (active/rejected/expired) assignments for the current teacher; relations: `student.user`
- `PATCH assignments/:id/accept` (teacher)
- `PATCH assignments/:id/reject` (teacher)
- `GET assignments` (admin) `?status`
- `GET assignments/:id` (admin)

### Assessments
- `POST assessments` (student) multipart `audio`
- `GET assessments/me` (student)

### Match Gateway (Socket.IO namespace `/match`)

Auth via `socket.handshake.auth.token` (JWT access).

Client→Server: `search`, `cancel`, `signal {data}`, `leave`

Server→Client: `searching`, `matched {sessionId, role}`, `cancelled`, `signal {data}`, `partner-left {reason}`, `left`, `replaced`, `error {message}`

## File Uploads

| Endpoint | Field | Public path prefix | MIME |
|---|---|---|---|
| `PATCH teachers/me` | `video` | `/public/teacher-intro/` | video/* |
| `POST/PATCH courses` | `image` | `/public/course/` | image/* |
| `POST .../lessons` | `media` | `/public/lesson/` | video/* |
| `POST assessments` | `audio` | `/public/assessment-input/` | audio/* |
