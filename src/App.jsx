import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import {ToasterComponent, ToasterProvider} from "@gravity-ui/uikit";
import {toaster} from "@/services/toaster.js";
import {AuthProvider} from "@/providers/auth.jsx";
import {ResourceLocaleProvider} from "@/providers/resource-locale.jsx";
import {HeaderProvider} from "@/providers/header.jsx";

import AppLayout from "@/ui/layouts/app-layout/index.jsx";
import TeacherLayout from "@/ui/layouts/teacher-layout/index.jsx";

import LoginPage from "@/ui/pages/login/index.jsx";
import LoginEmailPage from "@/ui/pages/login-email/index.jsx";
import LoginPhonePage from "@/ui/pages/login-phone/index.jsx";

import AdminDashboardPage from "@/ui/pages/admin-dashboard/index.jsx";
import AdminTeachersPage from "@/ui/pages/admin-teachers/index.jsx";
import AdminAddTeacherPage from "@/ui/pages/admin-add-teacher/index.jsx";
import AdminTeacherProfilePage from "@/ui/pages/admin-teacher-profile/index.jsx";
import AdminTeacherEditPage from "@/ui/pages/admin-teacher-edit/index.jsx";
import AdminStudentsPage from "@/ui/pages/admin-students/index.jsx";
import AdminStudentProfilePage from "@/ui/pages/admin-student-profile/index.jsx";
import AdminStudentEditPage from "@/ui/pages/admin-student-edit/index.jsx";
import AdminSettingsPage from "@/ui/pages/admin-settings/index.jsx";
import AdminCoursesPage from "@/ui/pages/admin-courses/index.jsx";
import AdminAddCoursePage from "@/ui/pages/admin-add-course/index.jsx";
import AdminCourseManagerPage from "@/ui/pages/admin-course-manager/index.jsx";
import AdminLessonEditPage from "@/ui/pages/admin-lesson-edit/index.jsx";
import AdminAssignmentsPage from "@/ui/pages/admin-assignments/index.jsx";

import TeacherDashboardPage from "@/ui/pages/teacher-dashboard/index.jsx";
import TeacherStudentsPage from "@/ui/pages/teacher-students/index.jsx";
import TeacherSessionsPage from "@/ui/pages/teacher-sessions/index.jsx";
import TeacherCreateSessionPage from "@/ui/pages/teacher-create-session/index.jsx";
import TeacherSettingsPage from "@/ui/pages/teacher-settings/index.jsx";
import TeacherChatPage from "@/ui/pages/teacher-chat/index.jsx";

import RoleGate from "@/ui/pages/role-gate/index.jsx";

const RequireAuth = ({children}) => {
    if (!localStorage.getItem('access_token')) {
        return <Navigate to="/login" replace/>
    }
    return children
}

function App() {
    return (
        <ToasterProvider toaster={toaster}>
            <ToasterComponent/>
            <BrowserRouter>
                <ResourceLocaleProvider>
                    <AuthProvider>
                        <HeaderProvider>
                            <Routes>
                                <Route path="/login" element={<LoginPage/>}>
                                    <Route index element={<Navigate to="/login/email" replace/>}/>
                                    <Route path="email" element={<LoginEmailPage/>}/>
                                    <Route path="phone" element={<LoginPhonePage/>}/>
                                </Route>

                                <Route index element={<RequireAuth><RoleGate/></RequireAuth>}/>

                                <Route element={<RequireAuth><AppLayout/></RequireAuth>}>
                                    <Route path="/admin" element={<AdminDashboardPage/>}/>
                                    <Route path="/admin/teachers" element={<AdminTeachersPage/>}/>
                                    <Route path="/admin/teachers/new" element={<AdminAddTeacherPage/>}/>
                                    <Route path="/admin/teachers/:id" element={<AdminTeacherProfilePage/>}/>
                                    <Route path="/admin/teachers/:id/edit" element={<AdminTeacherEditPage/>}/>
                                    <Route path="/admin/students" element={<AdminStudentsPage/>}/>
                                    <Route path="/admin/students/:id" element={<AdminStudentProfilePage/>}/>
                                    <Route path="/admin/students/:id/edit" element={<AdminStudentEditPage/>}/>
                                    <Route path="/admin/assignments" element={<AdminAssignmentsPage/>}/>
                                    <Route path="/admin/settings" element={<AdminSettingsPage/>}/>
                                    <Route path="/admin/courses" element={<AdminCoursesPage/>}/>
                                    <Route path="/admin/courses/new" element={<AdminAddCoursePage/>}/>
                                    <Route path="/admin/courses/:id" element={<AdminCourseManagerPage/>}/>
                                    <Route path="/admin/courses/:id/units/:unitId/lessons/:lessonId/edit"
                                           element={<AdminLessonEditPage/>}/>
                                </Route>

                                <Route element={<RequireAuth><TeacherLayout/></RequireAuth>}>
                                    <Route path="/teacher" element={<TeacherDashboardPage/>}/>
                                    <Route path="/teacher/students" element={<TeacherStudentsPage/>}/>
                                    <Route path="/teacher/sessions" element={<TeacherSessionsPage/>}/>
                                    <Route path="/teacher/sessions/new" element={<TeacherCreateSessionPage/>}/>
                                    <Route path="/teacher/settings" element={<TeacherSettingsPage/>}/>
                                    <Route path="/teacher/chat" element={<TeacherChatPage/>}/>
                                </Route>

                                <Route path="*" element={<RequireAuth><RoleGate/></RequireAuth>}/>
                            </Routes>
                        </HeaderProvider>
                    </AuthProvider>
                </ResourceLocaleProvider>
            </BrowserRouter>
        </ToasterProvider>
    )
}

export default App
