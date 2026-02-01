import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import UnifiedLogin from './UnifiedLogin';
import StudentDashboard from './StudentDashboard';
import '@/App.css';

function StudentApp() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('student_token');
    const storedUser = localStorage.getItem('student_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    setUser(null);
  };

  return (
    <>
      {!user ? (
        <UnifiedLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        <StudentDashboard user={user} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}

export default StudentApp;