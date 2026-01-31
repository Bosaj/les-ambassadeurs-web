import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Donate from './pages/Donate';
import Volunteer from './pages/Volunteer';
import NewsPage from './pages/NewsPage';
import ProgramsPage from './pages/ProgramsPage';
import EventsPage from './pages/EventsPage';

import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorPage from './pages/ErrorPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <DataProvider>
          <AuthProvider>
            <Router>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="donate" element={<Donate />} />
                    <Route path="volunteer" element={<Volunteer />} />
                    <Route path="news" element={<NewsPage />} />
                    <Route path="programs" element={<ProgramsPage />} />
                    <Route path="events" element={<EventsPage />} />

                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                    <Route
                      path="dashboard/admin"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="dashboard/volunteer"
                      element={
                        <ProtectedRoute requiredRole="volunteer">
                          <VolunteerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    {/* Catch-all 404 */}
                    <Route path="*" element={<ErrorPage is404={true} />} />
                  </Route>
                </Routes>
              </ErrorBoundary>
            </Router>
          </AuthProvider>
        </DataProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
