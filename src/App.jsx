import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageProvider';
import Layout from './components/Layout';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTopWrapper from './components/ScrollToTopWrapper';
import LoadingSpinner from './components/LoadingSpinner';

// ─── Lazy-load all pages ───────────────────────────────────────────────────
// Each page only downloads when the user actually navigates to it.
// This cuts the initial JS bundle from ~1MB to only what Home needs.
const Home = lazy(() => import('./pages/Home'));
const Donate = lazy(() => import('./pages/Donate'));
const Volunteer = lazy(() => import('./pages/Volunteer'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const ProgramsPage = lazy(() => import('./pages/ProgramsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const VolunteerDashboard = lazy(() => import('./pages/VolunteerDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const MembershipPage = lazy(() => import('./pages/MembershipPage'));
const GamificationHub = lazy(() => import('./components/GamificationHub'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const ReportProblem = lazy(() => import('./pages/ReportProblem'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));

// Minimal fallback shown while a lazy page chunk loads
const PageLoader = () => <LoadingSpinner fullScreen={true} message="Loading..." />;

function App() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <DataProvider>
                    <AuthProvider>
                        <Router>
                            <ScrollToTopWrapper />
                            <ErrorBoundary>
                                <Suspense fallback={<PageLoader />}>
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
                                            <Route path="membership" element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />
                                            <Route path="gamification" element={<ProtectedRoute><GamificationHub /></ProtectedRoute>} />
                                            <Route path="privacy-policy" element={<PrivacyPolicy />} />
                                            <Route path="terms-of-use" element={<TermsOfUse />} />
                                            <Route path="report-problem" element={<ReportProblem />} />

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
                                </Suspense>
                            </ErrorBoundary>
                        </Router>
                    </AuthProvider>
                </DataProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}

export default App;