import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UnifiedLogin = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workerCredentials, setWorkerCredentials] = useState({
    email: '',
    password: ''
  });

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/student';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleWorkerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/worker/login`, workerCredentials);
      
      localStorage.setItem('worker_token', response.data.token);
      localStorage.setItem('worker_user', JSON.stringify(response.data.user));
      
      toast.success('Login successful!');
      onLoginSuccess(response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="login-split-container">
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Laundr.io
              </h1>
              <p className="mt-2 text-muted-foreground">
                College Laundry Management System
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-6">Select Your Role</h2>
              
              <Button
                data-testid="select-student-btn"
                onClick={() => setSelectedRole('student')}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white text-lg font-medium"
              >
                Login as Student
              </Button>

              <Button
                data-testid="select-worker-btn"
                onClick={() => setSelectedRole('worker')}
                className="w-full h-16 bg-secondary hover:bg-secondary/80 text-primary text-lg font-medium border-2 border-primary"
                variant="outline"
              >
                Login as Worker
              </Button>
            </div>
          </div>
        </div>

        <div
          className="login-image-side"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1757087824089-bdb33ecc3439?crop=entropy&cs=srgb&fm=jpg&q=85)'
          }}
        >
          <div className="login-image-overlay">
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Fresh. Clean. Efficient.
            </h2>
            <p className="text-lg opacity-90">
              Manage your college laundry with ease
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedRole === 'student') {
    return (
      <div className="login-split-container">
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Laundr.io
              </h1>
              <p className="mt-2 text-muted-foreground">
                Student Portal
              </p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Sign in with Google</h2>
                <p className="text-sm text-muted-foreground">
                  Use your @iiitdwd.ac.in email to continue
                </p>
              </div>

              <Button
                data-testid="google-signin-btn"
                onClick={handleGoogleLogin}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 font-medium flex items-center justify-center gap-3"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>

              <Button
                data-testid="back-btn"
                onClick={() => setSelectedRole(null)}
                variant="ghost"
                className="w-full"
              >
                ← Back to role selection
              </Button>
            </div>
          </div>
        </div>

        <div
          className="login-image-side"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1757087824089-bdb33ecc3439?crop=entropy&cs=srgb&fm=jpg&q=85)'
          }}
        >
          <div className="login-image-overlay">
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Track Your Laundry
            </h2>
            <p className="text-lg opacity-90">
              Stay updated on your laundry status
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedRole === 'worker') {
    return (
      <div className="login-split-container">
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Laundr.io
              </h1>
              <p className="mt-2 text-muted-foreground">
                Worker Portal
              </p>
            </div>

            <form onSubmit={handleWorkerLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  data-testid="worker-email-input"
                  placeholder="Enter your work email"
                  value={workerCredentials.email}
                  onChange={(e) => setWorkerCredentials({ ...workerCredentials, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  data-testid="worker-password-input"
                  placeholder="Enter your password"
                  value={workerCredentials.password}
                  onChange={(e) => setWorkerCredentials({ ...workerCredentials, password: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                data-testid="worker-login-btn"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  'Login'
                )}
              </Button>

              <Button
                type="button"
                data-testid="back-btn"
                onClick={() => setSelectedRole(null)}
                variant="ghost"
                className="w-full"
              >
                ← Back to role selection
              </Button>
            </form>
          </div>
        </div>

        <div
          className="login-image-side"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1757087824089-bdb33ecc3439?crop=entropy&cs=srgb&fm=jpg&q=85)'
          }}
        >
          <div className="login-image-overlay">
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Manage Laundry Services
            </h2>
            <p className="text-lg opacity-90">
              Efficient laundry tracking system
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default UnifiedLogin;