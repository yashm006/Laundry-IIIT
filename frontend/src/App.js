import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Login from './Login';
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
        <div className="p-8">
          <h1>Worker Dashboard Coming Soon...</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <StudentDashboard user={user} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}

export default App;