import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await axios.post('/api/auth/forgot-password', data);
      setSubmitted(true);
      reset();
      toast.success('Email đặt lại mật khẩu đã được gửi!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/login')}
          sx={{ alignSelf: 'flex-start', mb: 2 }}
        >
          Quay lại đăng nhập
        </Button>

        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            🔐 Quên mật khẩu
          </Typography>
          
          {submitted ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                📧 Email đã được gửi!
              </Typography>
              <Typography variant="body2">
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn.
                Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ mt: 2 }}
              >
                Quay lại đăng nhập
              </Button>
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Nhập email tài khoản của bạn. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Lưu ý:</strong> Email phải trùng với email tài khoản được trường cung cấp.
                </Typography>
              </Alert>

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Email tài khoản"
                  autoComplete="email"
                  autoFocus
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'GỬI LIÊN KẾT ĐẶT LẠI MẬT KHẨU'
                  )}
                </Button>
              </Box>
            </>
          )}
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Cần hỗ trợ? Liên hệ phòng Đào tạo
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;