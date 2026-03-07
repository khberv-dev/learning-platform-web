
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminBuilder from "./pages/admin/AdminBuilder";
import AdminStudents from "./pages/admin/AdminStudents";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherGroups from "./pages/teacher/TeacherGroups";
import TeacherLive from "./pages/teacher/TeacherLive";
import TeacherChat from "./pages/teacher/TeacherChat";

import Settings from "./pages/Settings";
import { useAuth } from "./state/auth";
import LoginPage from "./pages/Login/LoginPage";
import AuthWatcher from "./app/AuthWatcher";

// 👉 добавь/подключи свою страницу логина

/** Защита: если не авторизован — на /login */
function RequireAuth() {
  const isAuthed = useAuth((s) => s.isAuthed);
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Редирект с "/" по роли */
function HomeRedirect() {
  const role = useAuth((s) => s.role); // ожидаем: "admin" | "teacher"
  if (role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
}

/** Опционально: защита по роли */
function RequireRole({ allow }: { allow: Array<"admin" | "teacher"> }) {
  const role = useAuth((s) => s.role);
  if (!role || !allow.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <>
    <AuthWatcher />
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeRedirect />} />

          {/* Admin */}
          <Route element={<RequireRole allow={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/teachers" element={<AdminTeachers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/builder" element={<AdminBuilder />} />
            <Route path="/admin/students" element={<AdminStudents />} />
          </Route>

          {/* Teacher */}
          <Route element={<RequireRole allow={["teacher"]} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/students" element={<TeacherStudents />} />
            <Route path="/teacher/groups" element={<TeacherGroups />} />
            <Route path="/teacher/live" element={<TeacherLive />} />
            <Route path="/teacher/chat" element={<TeacherChat />} />
          </Route>

          {/* System */}
          <Route path="/settings" element={<Settings />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
    </>
  );
}