import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Lazy load pages - CHỈ LOAD NHỮNG PAGE CẦN THIẾT
const Login = lazy(() => import("./pages/auth/Login"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Student pages
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const StudentTopics = lazy(() => import("./pages/student/Topics"));
const ProposeTopic = lazy(() => import("./pages/student/ProposeTopic"));
const TopicDetail = lazy(() => import("./pages/student/TopicDetail"));
const MyTopics = lazy(() => import("./pages/student/MyTopics"));
const RegistrationHistory = lazy(
  () => import("./pages/student/RegistrationHistory"),
);
const TopicProgress = lazy(() => import("./pages/student/TopicProgress"));
const Grades = lazy(() => import("./pages/student/Grades"));

// Layout components
// Teacher pages
const TeacherDashboard = lazy(() => import("./pages/teacher/Dashboard"));
const TeacherTopics = lazy(() => import("./pages/teacher/Topics"));
const TopicApprovals = lazy(() => import("./pages/teacher/TopicApprovals"));
const StudentRegistrations = lazy(
  () => import("./pages/teacher/StudentRegistrations"),
);
const GradingPage = lazy(() => import("./pages/teacher/Grading"));
const TeacherTopicDetail = lazy(() => import("./pages/teacher/TopicDetail"));
const TeacherTopicEdit = lazy(() => import("./pages/teacher/TopicEdit"));
const TeacherTopicCreate = lazy(() => import("./pages/teacher/TopicCreate"));
const GuidedStudents = lazy(() => import("./pages/teacher/GuidedStudents"));
const Notifications = lazy(() => import("./pages/teacher/Notifications"));

// Admin pages
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const SemesterManagement = lazy(
  () => import("./pages/admin/SemesterManagement"),
);
const PeriodManagement = lazy(
  () => import("./pages/admin/RegistrationPeriodManagement"),
);
const CouncilManagement = lazy(() => import("./pages/admin/CouncilManagement"));
const RubricManagement = lazy(() => import("./pages/admin/RubricManagement"));

// Layout components
const MainLayout = lazy(() => import("./components/layout/MainLayout"));

const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes with MainLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={["student"]}>
              <MainLayout>
                <StudentDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/topics"
          element={
            <ProtectedRoute roles={["student"]}>
              <MainLayout>
                <StudentTopics />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/topics/propose"
          element={
            <ProtectedRoute roles={["student"]}>
              <MainLayout>
                <ProposeTopic />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/topics/:id"
          element={
            <ProtectedRoute roles={["student"]}>
              <MainLayout>
                <TopicDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/my-topics"
          element={
            <ProtectedRoute roles={["student"]}>
              <MainLayout>
                <MyTopics />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/registration-history"
          element={
            <ProtectedRoute roles={["student"]}>
              <MainLayout>
                <RegistrationHistory />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/progress"
          element={
            <ProtectedRoute roles={["student"]}>
              <MainLayout>
                <TopicProgress />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/grades"
          element={
            <ProtectedRoute roles={["student"]}>
              <MainLayout>
                <Grades />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Teacher routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute roles={["teacher"]}>
              <MainLayout>
                <TeacherDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/topics"
          element={
            <ProtectedRoute roles={["teacher"]}>
              <MainLayout>
                <TeacherTopics />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/topics/create"
          element={
            <ProtectedRoute roles={["teacher"]}>
              <MainLayout>
                <TeacherTopicCreate />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/topics/:id"
          element={
            <ProtectedRoute roles={["teacher"]}>
              <MainLayout>
                <TeacherTopicDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/topics/:id/edit"
          element={
            <ProtectedRoute roles={["teacher"]}>
              <MainLayout>
                <TeacherTopicEdit />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/topics/pending-approval"
          element={
            <ProtectedRoute roles={["teacher"]}>
              <MainLayout>
                <TopicApprovals />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/students/registrations"
          element={
            <ProtectedRoute roles={["teacher"]}>
              <MainLayout>
                <StudentRegistrations />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/students/guided"
          element={
            <ProtectedRoute roles={["teacher"]}>
              <MainLayout>
                <GuidedStudents />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/grading"
          element={
            <ProtectedRoute roles={["teacher"]}>
              <MainLayout>
                <GradingPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="semesters" element={<SemesterManagement />} />
          <Route path="registration-periods" element={<PeriodManagement />} />
          <Route path="councils" element={<CouncilManagement />} />
          <Route path="rubrics" element={<RubricManagement />} />
          <Route path="reports" element={<div>Báo cáo sắp ra mắt</div>} />
          <Route path="settings" element={<div>Cài đặt sắp ra mắt</div>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
