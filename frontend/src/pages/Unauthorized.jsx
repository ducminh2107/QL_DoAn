import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect về đúng trang chủ theo role
  const getHomePath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'teacher') return '/teacher';
    if (user?.role === 'student') return '/student';
    return '/login';
  };

  const roleLabel = {
    admin: 'Quản trị viên',
    teacher: 'Giảng viên',
    student: 'Sinh viên',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff5f5 0%, #fdf4ff 100%)',
        px: 3,
        textAlign: 'center',
      }}
    >
      {/* Số 403 lớn */}
      <Typography
        sx={{
          fontSize: { xs: '6rem', md: '10rem' },
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
          userSelect: 'none',
        }}
      >
        403
      </Typography>

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}
      >
        Truy cập bị từ chối
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: '#64748b', mb: 2, maxWidth: 440 }}
      >
        Bạn không có quyền truy cập vào trang này.
        {user && ' Vui lòng liên hệ quản trị viên nếu bạn cần hỗ trợ.'}
      </Typography>

      {/* Hiển thị role hiện tại */}
      {user && (
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Bạn đang đăng nhập với vai trò:
          </Typography>
          <Chip
            label={roleLabel[user.role] || user.role}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor:
                user.role === 'admin'
                  ? '#fff1f2'
                  : user.role === 'teacher'
                    ? '#eff6ff'
                    : '#f0fdf4',
              color:
                user.role === 'admin'
                  ? '#be123c'
                  : user.role === 'teacher'
                    ? '#1d4ed8'
                    : '#15803d',
            }}
          />
        </Box>
      )}

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
            bgcolor: '#ef4444',
            boxShadow: '0 4px 15px rgba(239,68,68,0.35)',
            '&:hover': { bgcolor: '#dc2626' },
          }}
        >
          🏠 Về trang của tôi
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
            borderColor: '#ef4444',
            color: '#ef4444',
            '&:hover': { borderColor: '#dc2626', bgcolor: 'rgba(239,68,68,0.05)' },
          }}
        >
          ← Quay lại
        </Button>
      </Box>
    </Box>
  );
};

export default Unauthorized;