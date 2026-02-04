import React from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Lock as LockIcon } from '@mui/icons-material';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            ⚠️ Truy Cập Bị Từ Chối
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Bạn không có quyền truy cập vào trang này.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là lỗi.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
          >
            Về trang chủ
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;