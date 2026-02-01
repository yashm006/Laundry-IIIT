import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error('Authentication failed: No session ID');
          navigate('/login');
          return;
        }

        // Exchange session_id for user data
        const response = await axios.get(
          'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
          {
            headers: {
              'X-Session-ID': sessionId
            }
          }
        );

        const userData = response.data;

        // Validate domain for students
        if (!userData.email.endsWith('@iiitdwd.ac.in')) {
          toast.error('Only @iiitdwd.ac.in emails are allowed');
          navigate('/login');
          return;
        }

        // Send to backend to create/update student and set cookie
        const backendResponse = await axios.post(
          `${API}/auth/student/google`,
          userData,
          { withCredentials: true }
        );

        const studentData = backendResponse.data.user;

        localStorage.setItem('student_token', backendResponse.data.session_token);
        localStorage.setItem('student_user', JSON.stringify(studentData));

        toast.success('Login successful!');
        navigate('/student', { state: { user: studentData }, replace: true });

      } catch (error) {
        console.error('Auth error:', error);
        toast.error(error.response?.data?.detail || 'Authentication failed');
        navigate('/login');
      }
    };

    processAuth();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;