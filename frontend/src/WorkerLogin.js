import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WorkerLogin = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
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
            role: 'worker'
          };

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      if (response.data.user.role !== 'worker') {
        toast.error('This portal is for laundry staff only');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('worker_token', response.data.token);
      localStorage.setItem('worker_user', JSON.stringify(response.data.user));
      
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
              Worker Management Portal
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

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                data-testid="email-input"
                placeholder="Enter your work email"
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
            Manage Laundry Services
          </h2>
          <p className="text-lg opacity-90">
            Efficient laundry tracking system
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkerLogin;