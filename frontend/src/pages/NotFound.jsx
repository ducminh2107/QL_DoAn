import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect về đúng trang chủ theo role
  const getHomePath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'teacher') return '/teacher';
    if (user?.role === 'student') return '/student';
    return '/login';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)',
        px: 3,
        textAlign: 'center',
      }}
    >
      {/* Số 404 lớn */}
      <Typography
        sx={{
          fontSize: { xs: '6rem', md: '10rem' },
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
          userSelect: 'none',
        }}
      >
        404
      </Typography>

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}
      >
        Trang không tồn tại
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: '#64748b', mb: 4, maxWidth: 400 }}
      >
        Trang bạn đang tìm kiếm không tồn tại, đã bị xóa, hoặc đường dẫn
        không đúng.
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(getHomePath())}
          sx={{
            borderRadius: 3,
            px: 4,
            fontWeight: 700,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
            '&:hover': { opacity: 0.9 },
          }}
        >
          🏠 Về trang chủ
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate(-1)}
          sx={{
            borderRadius: 3,
            px: 4,
            fontWeight: 700,
            textTransform: 'none',
            borderColor: '#6366f1',
            color: '#6366f1',
            '&:hover': { borderColor: '#4f46e5', bgcolor: 'rgba(99,102,241,0.05)' },
          }}
        >
          ← Quay lại
        </Button>
      </Box>
    </Box>
  );
};

export default NotFound;