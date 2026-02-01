import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import StudentApp from './StudentApp';
import WorkerApp from './WorkerApp';
import AuthCallback from './AuthCallback';
import UnifiedLogin from './UnifiedLogin';
import '@/App.css';

function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<UnifiedLogin onLoginSuccess={() => {}} />} />
      <Route path="/student" element={<StudentApp />} />
      <Route path="/worker" element={<WorkerApp />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;