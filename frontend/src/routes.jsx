import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy load pages - CHỈ LOAD NHỮNG PAGE CẦN THIẾT
const Login = lazy(() => import('./pages/auth/Login'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentTopics = lazy(() => import('./pages/student/Topics'));
const ProposeTopic = lazy(() => import('./pages/student/ProposeTopic'));
const TopicDetail = lazy(() => import('./pages/student/TopicDetail'));

// Layout components
const MainLayout = lazy(() => import('./components/layout/MainLayout'));

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
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
            <ProtectedRoute roles={['student']}>
              <MainLayout>
                <StudentDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/topics"
          element={
            <ProtectedRoute roles={['student']}>
              <MainLayout>
                <StudentTopics />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/topics/propose"
          element={
            <ProtectedRoute roles={['student']}>
              <MainLayout>
                <ProposeTopic />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/topics/:id"
          element={
            <ProtectedRoute roles={['student']}>
              <MainLayout>
                <TopicDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Teacher routes (để sau) */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute roles={['teacher']}>
              <MainLayout>
                <div>Teacher Dashboard (Coming Soon)</div>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes (để sau) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
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