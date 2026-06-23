import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import AdminLayout from './components/AdminLayout';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminLogin from './pages/AdminLogin';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MyLearning from './pages/MyLearning';
import Subscription from './pages/Subscription';
import Certificates from './pages/Certificates';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Explore from './pages/Explore';
import PageView from './pages/PageView';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminCourseForm from './pages/admin/AdminCourseForm';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminUserMIS from './pages/admin/AdminUserMIS';
import AdminSubscriptionMIS from './pages/admin/AdminSubscriptionMIS';
import AdminLoginHistoryMIS from './pages/admin/AdminLoginHistoryMIS';
import AdminCoursesMIS from './pages/admin/AdminCoursesMIS';
import AdminPages from './pages/admin/AdminPages';
import AdminPageBuilder from './pages/admin/AdminPageBuilder';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              background: '#1e293b',
              color: '#fff',
              fontSize: '0.9rem',
            },
          }}
        />

        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Student Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/my-learning" element={<MyLearning />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/:slug" element={<PageView />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/new" element={<AdminCourseForm />} />
            <Route path="courses/:id" element={<AdminCourseForm />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="pages/new" element={<AdminPageBuilder />} />
            <Route path="pages/:id" element={<AdminPageBuilder />} />
            <Route path="mis/users" element={<AdminUserMIS />} />
            <Route path="mis/subscriptions" element={<AdminSubscriptionMIS />} />
            <Route path="mis/login-history" element={<AdminLoginHistoryMIS />} />
            <Route path="mis/courses" element={<AdminCoursesMIS />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
