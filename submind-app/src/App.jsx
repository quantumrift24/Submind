import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';

import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import CustomCursor from './components/CustomCursor';

import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Savings from './pages/Savings';
import Predictions from './pages/Predictions';
import Chat from './pages/Chat';
import Automation from './pages/Automation';
import Profile from './pages/Profile';

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />

      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="savings" element={<Savings />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="chat" element={<Chat />} />
        <Route path="automation" element={<Automation />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
