import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { CourseProvider } from './contexts/CourseContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import AuthRedirect from './components/auth/AuthRedirect';
import './utils/initializeData'; // Import to make functions available globally

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudentManagement from './pages/admin/AdminStudentManagement';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Create theme with your brand colors
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#50EB97', // Bright green from your website
      light: '#5EF2A2',
      dark: '#3DD885',
    },
    secondary: {
      main: '#ACFF22', // Lime green accent
      light: '#B8FF4D',
      dark: '#9AFF00',
    },
    background: {
      default: '#1C1F26', // Dark background
      paper: '#2A2D35',
    },
    text: {
      primary: 'rgba(255,255,255,0.95)',
      secondary: 'rgba(255,255,255,0.7)',
    },
    divider: 'rgba(255,255,255,0.1)',
  },
  typography: {
    fontFamily: '"Space Grotesk", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '0.01em',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.02em',
          fontSize: '1.1rem',
          padding: '12px 24px',
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        },
        contained: {
          backgroundColor: '#50EB97',
          color: '#000000',
          boxShadow: '0 4px 12px rgba(80, 235, 151, 0.3)',
          fontWeight: 700,
          fontSize: '1.2rem',
          padding: '14px 28px',
          '&:hover': {
            backgroundColor: '#5EF2A2',
            color: '#000000',
            boxShadow: '0 6px 16px rgba(80, 235, 151, 0.4)',
          },
        },
        outlined: {
          borderColor: '#50EB97',
          color: '#50EB97',
          borderWidth: '2px',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: 'rgba(80, 235, 151, 0.15)',
            borderColor: '#5EF2A2',
            color: '#5EF2A2',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(80, 235, 151, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#50EB97',
            },
          },
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
                  {/* Root path - show landing page directly */}
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