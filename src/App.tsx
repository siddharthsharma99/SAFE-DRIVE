import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '../components/ui/sonner';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { ThemeProvider } from './components/ThemeProvider';

// Pages
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import DetectionPage from './pages/DetectionPage';
import ContactsPage from './pages/ContactsPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-2xl font-mono text-foreground">GUARDIA AI INITIALIZING...</div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="guardia-theme">
      <Router>
        <Toaster />
        <Routes>
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route element={user ? <Layout /> : <Navigate to="/auth" />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/detect" element={<DetectionPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
