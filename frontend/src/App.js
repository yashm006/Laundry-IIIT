import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Login from './Login';
import WorkerDashboard from './WorkerDashboard';
import StudentDashboard from './StudentDashboard';
import '@/App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : user.role === 'worker' ? (
        <WorkerDashboard user={user} onLogout={handleLogout} />
      ) : (
        <StudentDashboard user={user} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}

export default App;