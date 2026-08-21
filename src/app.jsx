import {Route, Routes} from 'react-router-dom';
import {ROLE} from '@/shared/auth/roles.js';
import MainLayout from '@/ui/layouts/mainLayout.jsx';
import {GuestRoute, PrivateRoute, RoleRoute, RootRedirect} from '@/ui/routes/routeGuards.jsx';
import Login from '@/ui/pages/login.jsx';
import NotFound from '@/ui/pages/notFound.jsx';

import AdminHome from '@/ui/pages/admin/home.jsx';
import AdminStudents from '@/ui/pages/admin/users/students.jsx';
import AdminStudentDetail from '@/ui/pages/admin/users/studentDetail.jsx';
import AdminMentors from '@/ui/pages/admin/users/mentors.jsx';
import AdminMentorForm from '@/ui/pages/admin/users/mentorForm.jsx';
import AdminMentorDetail from '@/ui/pages/admin/users/mentorDetail.jsx';
import AdminCourses from '@/ui/pages/admin/course/courses.jsx';
import AdminCourseManager from '@/ui/pages/admin/course/courseManager.jsx';
import AdminEnrollments from '@/ui/pages/admin/course/enrollments.jsx';
import AdminPendingEnrollments from '@/ui/pages/admin/course/pendingEnrollments.jsx';
import AdminUnit from '@/ui/pages/admin/course/unit.jsx';
import AdminLesson from '@/ui/pages/admin/course/lesson.jsx';
import AdminTask from '@/ui/pages/admin/course/task.jsx';
import AdminQuestion from '@/ui/pages/admin/course/question.jsx';
import AdminPayments from '@/ui/pages/admin/payment/payments.jsx';
import AdminPaymentTypes from '@/ui/pages/admin/payment/paymentTypes.jsx';
import AdminPushNotifications from '@/ui/pages/admin/marketing/pushNotifications.jsx';
import AdminAssignments from '@/ui/pages/admin/assignments.jsx';
import AdminSettings from '@/ui/pages/admin/settings.jsx';

import MentorDashboard from '@/ui/pages/mentor/dashboard.jsx';
import MentorAssignments from '@/ui/pages/mentor/assignments.jsx';
import MentorLiveLessons from '@/ui/pages/mentor/liveLessons.jsx';
import MentorSchedule from '@/ui/pages/mentor/schedule.jsx';
import MentorChat from '@/ui/pages/mentor/chat.jsx';
import MentorSettings from '@/ui/pages/mentor/settings.jsx';

// Route nesting mirrors the sidebar tree in navConfig.js - a group's id is
// also its path segment (/admin/users/mentors sits under the "users" group).
function App() {
    return (
        <Routes>
            <Route element={<GuestRoute/>}>
                <Route path="/login" element={<Login/>}/>
            </Route>

            <Route element={<PrivateRoute/>}>
                <Route element={<RoleRoute role={ROLE.ADMIN}/>}>
                    <Route path="/admin" element={<MainLayout role={ROLE.ADMIN}/>}>
                        <Route index element={<AdminHome/>}/>

                        <Route path="users/students" element={<AdminStudents/>}/>
                        <Route path="users/students/:id" element={<AdminStudentDetail/>}/>
                        <Route path="users/mentors" element={<AdminMentors/>}/>
                        <Route path="users/mentors/new" element={<AdminMentorForm/>}/>
                        <Route path="users/mentors/:id" element={<AdminMentorDetail/>}/>
                        <Route path="users/mentors/:id/edit" element={<AdminMentorForm/>}/>

                        <Route path="course/courses" element={<AdminCourses/>}/>
                        <Route path="course/courses/:id" element={<AdminCourseManager/>}/>
                        {/* Units, lessons, tasks and questions each get their
                            own page; the nesting mirrors the API's own paths. */}
                        <Route
                            path="course/courses/:courseId/units/:unitId"
                            element={<AdminUnit/>}
                        />
                        <Route
                            path="course/courses/:courseId/units/:unitId/lessons/:lessonId"
                            element={<AdminLesson/>}
                        />
                        <Route
                            path="course/courses/:courseId/units/:unitId/lessons/:lessonId/tasks/:taskId"
                            element={<AdminTask/>}
                        />
                        {/* `:index` also matches the literal "new", which the
                            page renders as an empty create form. */}
                        <Route
                            path="course/courses/:courseId/units/:unitId/lessons/:lessonId/tasks/:taskId/questions/:index"
                            element={<AdminQuestion/>}
                        />

                        <Route path="course/enrollments" element={<AdminEnrollments/>}/>
                        <Route path="course/pending-enrollments" element={<AdminPendingEnrollments/>}/>

                        <Route path="payment/payments" element={<AdminPayments/>}/>
                        <Route path="payment/payment-types" element={<AdminPaymentTypes/>}/>

                        <Route
                            path="marketing/push-notifications"
                            element={<AdminPushNotifications/>}
                        />

                        {/* Reachable by URL but deliberately absent from the
                            sidebar tree, which has no assignments entry. */}
                        <Route path="assignments" element={<AdminAssignments/>}/>

                        <Route path="settings" element={<AdminSettings/>}/>
                    </Route>
                </Route>

                <Route element={<RoleRoute role={ROLE.MENTOR}/>}>
                    <Route path="/mentor" element={<MainLayout role={ROLE.MENTOR}/>}>
                        <Route index element={<MentorDashboard/>}/>
                        <Route path="assignments" element={<MentorAssignments/>}/>
                        <Route path="live-lessons" element={<MentorLiveLessons/>}/>
                        <Route path="schedule" element={<MentorSchedule/>}/>
                        <Route path="chat" element={<MentorChat/>}/>
                        <Route path="settings" element={<MentorSettings/>}/>
                    </Route>
                </Route>
            </Route>

            {/* "/" has no page of its own - it forwards to whichever panel the
                signed-in account can reach, or to /login. */}
            <Route path="/" element={<RootRedirect/>}/>
            <Route path="*" element={<NotFound/>}/>
        </Routes>
    );
}

export default App;
