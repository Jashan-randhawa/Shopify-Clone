import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Notfound = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa' }}>
      <Typography variant="h1" fontWeight={900} sx={{ color: '#1a237e', fontSize: '8rem', lineHeight: 1 }}>404</Typography>
      <Typography variant="h5" fontWeight={700} mb={1}>Page Not Found</Typography>
      <Typography color="text.secondary" mb={4}>The page you're looking for doesn't exist.</Typography>
      <Button variant="contained" onClick={() => navigate('/')} sx={{ bgcolor: '#1a237e' }}>Go Home</Button>
    </Box>
  );
};

export default Notfound;
