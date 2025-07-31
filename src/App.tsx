import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { CourseProvider } from './contexts/CourseContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourseManagement from './pages/admin/AdminCourseManagement';
import AdminStudentManagement from './pages/admin/AdminStudentManagement';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Create theme with your brand colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#4A7B63', // Green from your website
      light: '#9AB5A7',
      dark: '#345847',
    },
    secondary: {
      main: '#F5A623', // Warm accent color
      light: '#FFD280',
      dark: '#D68910',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CourseProvider>
          <Router>
            <div className="App">
              <Header />
              <main style={{ minHeight: 'calc(100vh - 140px)' }}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/course/:courseId" element={
                    <PrivateRoute>
                      <CoursePage />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/course/:courseId/lesson/:lessonId" element={
                    <PrivateRoute>
                      <LessonPage />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/payment/:courseId" element={
                    <PrivateRoute>
                      <PaymentPage />
                    </PrivateRoute>
                  } />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/courses" element={
                    <AdminRoute>
                      <AdminCourseManagement />
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/students" element={
                    <AdminRoute>
                      <AdminStudentManagement />
                    </AdminRoute>
                  } />
                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 