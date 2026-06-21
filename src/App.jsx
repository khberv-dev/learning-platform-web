import {BrowserRouter, Navigate, Route, Routes, useLocation} from 'react-router'
import {ToasterComponent, ToasterProvider} from '@gravity-ui/uikit'
import {toaster} from '@/services/toaster.js'
import {AuthProvider, useAuth} from '@/providers/auth.jsx'
import {ResourceLocaleProvider} from '@/providers/resource-locale.jsx'
import {HeaderProvider} from '@/providers/header.jsx'
import AppLayout from '@/ui/layouts/app-layout/index.jsx'

import LoginPage from '@/ui/pages/login/index.jsx'

import AdminDashboardPage from '@/ui/pages/admin-dashboard/index.jsx'
import AdminTeachersPage from '@/ui/pages/admin-teachers/index.jsx'
import AdminAddTeacherPage from '@/ui/pages/admin-add-teacher/index.jsx'
import AdminTeacherProfilePage from '@/ui/pages/admin-teacher-profile/index.jsx'
import AdminTeacherEditPage from '@/ui/pages/admin-teacher-edit/index.jsx'
import AdminStudentsPage from '@/ui/pages/admin-students/index.jsx'
import AdminStudentProfilePage from '@/ui/pages/admin-student-profile/index.jsx'
import AdminStudentEditPage from '@/ui/pages/admin-student-edit/index.jsx'
import AdminCoursesPage from '@/ui/pages/admin-courses/index.jsx'
import AdminAddCoursePage from '@/ui/pages/admin-add-course/index.jsx'
import AdminEditCoursePage from '@/ui/pages/admin-edit-course/index.jsx'
import AdminCourseManagerPage from '@/ui/pages/admin-course-manager/index.jsx'
import AdminLessonEditPage from '@/ui/pages/admin-lesson-edit/index.jsx'
import AdminSettingsPage from '@/ui/pages/admin-settings/index.jsx'

import TeacherDashboardPage from '@/ui/pages/teacher-dashboard/index.jsx'
import TeacherStudentsPage from '@/ui/pages/teacher-students/index.jsx'
import TeacherSessionsPage from '@/ui/pages/teacher-sessions/index.jsx'
import TeacherCreateSessionPage from '@/ui/pages/teacher-create-session/index.jsx'
import TeacherChatPage from '@/ui/pages/teacher-chat/index.jsx'
import TeacherSettingsPage from '@/ui/pages/teacher-settings/index.jsx'

function RequireAuth({children}) {
    const location = useLocation()
    if (!localStorage.getItem('access_token')) {
        return <Navigate to="/login" replace state={{from: location}}/>
    }
    return children
}

function HomeRedirect() {
    const {isLoading, isAdmin, isTeacher, isStudent} = useAuth() ?? {}
    if (isLoading) return <div style={{padding: 32, color: 'var(--it-text-secondary)'}}>Loading…</div>
    if (isAdmin) return <Navigate to="/admin" replace/>
    if (isTeacher) return <Navigate to="/teacher" replace/>
    if (isStudent) return <Navigate to="/login" replace/>
    return <Navigate to="/login" replace/>
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
                                <Route path="/login" element={<LoginPage/>}/>

                                <Route path="/" element={<RequireAuth><HomeRedirect/></RequireAuth>}/>

                                <Route element={<RequireAuth><AppLayout role="admin"/></RequireAuth>}>
                                    <Route path="/admin" element={<AdminDashboardPage/>}/>
                                    <Route path="/admin/teachers" element={<AdminTeachersPage/>}/>
                                    <Route path="/admin/teachers/new" element={<AdminAddTeacherPage/>}/>
                                    <Route path="/admin/teachers/:id" element={<AdminTeacherProfilePage/>}/>
                                    <Route path="/admin/teachers/:id/edit" element={<AdminTeacherEditPage/>}/>
                                    <Route path="/admin/students" element={<AdminStudentsPage/>}/>
                                    <Route path="/admin/students/:id" element={<AdminStudentProfilePage/>}/>
                                    <Route path="/admin/students/:id/edit" element={<AdminStudentEditPage/>}/>
                                    <Route path="/admin/courses" element={<AdminCoursesPage/>}/>
                                    <Route path="/admin/courses/new" element={<AdminAddCoursePage/>}/>
                                    <Route path="/admin/courses/:id/edit" element={<AdminEditCoursePage/>}/>
                                    <Route path="/admin/courses/:id" element={<AdminCourseManagerPage/>}/>
                                    <Route path="/admin/courses/:id/units/:unitId/lessons/:lessonId" element={<AdminLessonEditPage/>}/>
                                    <Route path="/admin/settings" element={<AdminSettingsPage/>}/>
                                </Route>

                                <Route element={<RequireAuth><AppLayout role="teacher"/></RequireAuth>}>
                                    <Route path="/teacher" element={<TeacherDashboardPage/>}/>
                                    <Route path="/teacher/students" element={<TeacherStudentsPage/>}/>
                                    <Route path="/teacher/sessions" element={<TeacherSessionsPage/>}/>
                                    <Route path="/teacher/sessions/new" element={<TeacherCreateSessionPage/>}/>
                                    <Route path="/teacher/chat" element={<TeacherChatPage/>}/>
                                    <Route path="/teacher/settings" element={<TeacherSettingsPage/>}/>
                                </Route>

                                <Route path="*" element={<Navigate to="/" replace/>}/>
                            </Routes>
                        </HeaderProvider>
                    </AuthProvider>
                </ResourceLocaleProvider>
            </BrowserRouter>
        </ToasterProvider>
    )
}

export default App
