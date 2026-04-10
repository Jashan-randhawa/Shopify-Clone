import React, { useState } from 'react';
import {
  Box, Container, Paper, TextField, Typography, Button,
  Tab, Tabs, InputAdornment, IconButton, Divider, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, ShoppingBag } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const from = location.state?.from || '/';

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const result = await login(loginForm.email, loginForm.password);
      if (result.success) {
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = registerForm;
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const result = await register(name, email, password);
      if (result.success) {
        toast.success('Account created! Welcome to ShopHub.');
        navigate('/', { replace: true });
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2
    }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <ShoppingBag sx={{ color: 'white', fontSize: 40 }} />
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, letterSpacing: -1 }}>
              ShopHub
            </Typography>
          </Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Your premium shopping destination</Typography>
        </Box>

        <Paper elevation={24} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{
            borderBottom: 1, borderColor: 'divider',
            '& .MuiTab-root': { py: 2, fontWeight: 600 },
            '& .Mui-selected': { color: '#1a237e' },
            '& .MuiTabs-indicator': { bgcolor: '#1a237e' }
          }}>
            <Tab label="Sign In" />
            <Tab label="Create Account" />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {tab === 0 ? (
              <form onSubmit={handleLogin}>
                <Typography variant="h6" fontWeight={700} mb={3}>Welcome back</Typography>
                <TextField fullWidth label="Email Address" type="email" margin="normal"
                  value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  autoComplete="email" sx={{ mb: 2 }} />
                <TextField fullWidth label="Password" margin="normal"
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }} sx={{ mb: 3 }} />
                <Button fullWidth variant="contained" type="submit" disabled={loading} size="large"
                  sx={{ py: 1.5, bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' }, fontWeight: 700, fontSize: '1rem' }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <Typography variant="h6" fontWeight={700} mb={3}>Create your account</Typography>
                <TextField fullWidth label="Full Name" margin="normal"
                  value={registerForm.name} onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                  sx={{ mb: 1 }} />
                <TextField fullWidth label="Email Address" type="email" margin="normal"
                  value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                  sx={{ mb: 1 }} />
                <TextField fullWidth label="Password" margin="normal"
                  type={showPassword ? 'text' : 'password'}
                  value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                  helperText="At least 6 characters" sx={{ mb: 1 }} />
                <TextField fullWidth label="Confirm Password" margin="normal"
                  type={showPassword ? 'text' : 'password'}
                  value={registerForm.confirmPassword} onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }} sx={{ mb: 3 }} />
                <Button fullWidth variant="contained" type="submit" disabled={loading} size="large"
                  sx={{ py: 1.5, bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' }, fontWeight: 700, fontSize: '1rem' }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>
              </form>
            )}

            <Divider sx={{ my: 3 }} />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              By continuing, you agree to ShopHub's Terms of Service and Privacy Policy.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
