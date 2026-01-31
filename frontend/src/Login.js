import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    student_id: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            email: formData.email, 
            password: formData.password, 
            name: formData.name, 
            role: role,
            student_id: role === 'student' ? formData.student_id : null
          };

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
      onLoginSuccess(response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

          <div className="flex gap-2 p-1 bg-secondary rounded-lg">
            <button
              data-testid="toggle-login-btn"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                isLogin ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'
              }`}
            >
              Login
            </button>
            <button
              data-testid="toggle-register-btn"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                !isLogin ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'
              }`}
            >
              Register
            </button>
          </div>

          {!isLogin && (
            <div className="flex gap-2 p-1 bg-secondary rounded-lg">
              <button
                data-testid="role-student-btn"
                onClick={() => setRole('student')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  role === 'student' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'
                }`}
              >
                Student
              </button>
              <button
                data-testid="role-worker-btn"
                onClick={() => setRole('worker')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  role === 'worker' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'
                }`}
              >
                Worker
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  data-testid="name-input"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {!isLogin && role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  name="student_id"
                  data-testid="student-id-input"
                  placeholder="Enter your student ID"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                data-testid="email-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                data-testid="password-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              type="submit"
              data-testid="submit-btn"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                isLogin ? 'Login' : 'Register'
              )}
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
            Fresh. Clean. Efficient.
          </h2>
          <p className="text-lg opacity-90">
            Manage your college laundry with ease
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;