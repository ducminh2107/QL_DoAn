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

// Layout components
// Teacher pages
const TeacherDashboard = lazy(() => import("./pages/teacher/Dashboard"));
const TeacherTopics = lazy(() => import("./pages/teacher/Topics"));
const TopicApprovals = lazy(() => import("./pages/teacher/TopicApprovals"));
const StudentRegistrations = lazy(
  () => import("./pages/teacher/StudentRegistrations")
);
const GradingPage = lazy(() => import("./pages/teacher/Grading"));
const TeacherTopicDetail = lazy(() => import("./pages/teacher/TopicDetail"));
const TeacherTopicEdit = lazy(() => import("./pages/teacher/TopicEdit"));
const TeacherTopicCreate = lazy(() => import("./pages/teacher/TopicCreate"));
const GuidedStudents = lazy(() => import("./pages/teacher/GuidedStudents"));
const Notifications = lazy(() => import("./pages/teacher/Notifications"));

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

        {/* Admin routes (để sau) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <MainLayout>
                <div>Admin Dashboard (Coming Soon)</div>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
