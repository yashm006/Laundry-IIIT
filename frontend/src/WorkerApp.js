import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import WorkerLogin from './WorkerLogin';
import WorkerDashboard from './WorkerDashboard';
import '@/App.css';

function WorkerApp() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('worker_token');
    const storedUser = localStorage.getItem('worker_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('worker_token');
    localStorage.removeItem('worker_user');
    setUser(null);
  };

  return (
    <>
      {!user ? (
        <WorkerLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        <WorkerDashboard user={user} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}

export default WorkerApp;