import React, { useState } from 'react';
import {
  Box, Container, Typography, Paper, Grid, TextField, Button,
  Avatar, Divider, CircularProgress, Chip
} from '@mui/material';
import { Person, Lock, ShoppingBag } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../component/layout/Navbar';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/api/auth/profile', profile);
      if (res.data.success) { updateUser(res.data.user); toast.success('Profile updated!'); }
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await api.put('/api/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      if (res.data.success) { toast.success('Password changed!'); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', textAlign: 'center', mb: 2 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#1a237e', fontSize: '2rem', mx: 'auto', mb: 2 }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography fontWeight={700}>{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              {user?.role === 'admin' && <Chip label="Admin" size="small" sx={{ mt: 1, bgcolor: '#1a237e', color: 'white' }} />}
            </Paper>
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
              {[
                { key: 'profile', icon: <Person fontSize="small" />, label: 'Profile' },
                { key: 'password', icon: <Lock fontSize="small" />, label: 'Password' },
              ].map(item => (
                <Box key={item.key} onClick={() => setTab(item.key)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, cursor: 'pointer',
                    bgcolor: tab === item.key ? '#e8eaf6' : 'white',
                    color: tab === item.key ? '#1a237e' : 'inherit',
                    fontWeight: tab === item.key ? 700 : 400,
                    '&:hover': { bgcolor: '#f5f5f5' }, borderBottom: '1px solid #e0e0e0' }}>
                  {item.icon}
                  <Typography variant="body2" fontWeight={tab === item.key ? 700 : 400}>{item.label}</Typography>
                </Box>
              ))}
              <Box onClick={() => navigate('/orders')}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}>
                <ShoppingBag fontSize="small" />
                <Typography variant="body2">My Orders</Typography>
              </Box>
            </Paper>
            <Button fullWidth variant="outlined" color="error" onClick={handleLogout} sx={{ mt: 2 }}>
              Sign Out
            </Button>
            {user?.role === 'admin' && (
              <Button fullWidth variant="contained" onClick={() => navigate('/admin')} sx={{ mt: 1, bgcolor: '#1a237e' }}>
                Admin Dashboard
              </Button>
            )}
          </Grid>

          {/* Content */}
          <Grid item xs={12} md={9}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e0e0e0' }}>
              {tab === 'profile' && (
                <>
                  <Typography variant="h6" fontWeight={700} mb={3}>Profile Information</Typography>
                  <form onSubmit={handleUpdateProfile}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Full Name" value={profile.name}
                          onChange={e => setProfile({ ...profile, name: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Phone" value={profile.phone}
                          onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Email Address" value={user?.email} disabled />
                      </Grid>
                    </Grid>
                    <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 3, bgcolor: '#1a237e' }}>
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                    </Button>
                  </form>
                </>
              )}
              {tab === 'password' && (
                <>
                  <Typography variant="h6" fontWeight={700} mb={3}>Change Password</Typography>
                  <form onSubmit={handleChangePassword}>
                    <TextField fullWidth label="Current Password" type="password" value={passwords.currentPassword}
                      onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} sx={{ mb: 2 }} />
                    <TextField fullWidth label="New Password" type="password" value={passwords.newPassword}
                      onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} helperText="At least 6 characters" sx={{ mb: 2 }} />
                    <TextField fullWidth label="Confirm New Password" type="password" value={passwords.confirmPassword}
                      onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} sx={{ mb: 3 }} />
                    <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#1a237e' }}>
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Password'}
                    </Button>
                  </form>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;
