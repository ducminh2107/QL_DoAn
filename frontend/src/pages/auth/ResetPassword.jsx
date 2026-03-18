import React, { useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, CheckCircle, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
  password: yup.string()
    .min(6, 'Mật khẩu ít nhất 6 ký tự')
    .required('Mật khẩu mới là bắt buộc'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Mật khẩu không khớp')
    .required('Xác nhận mật khẩu là bắt buộc'),
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await axios.put(`/api/auth/reset-password/${token}`, {
        password: data.password
      });
      setSuccess(true);
      toast.success('Đặt lại mật khẩu thành công!');
      
      // Tự động chuyển hướng sau 3 giây
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            'url("https://thoibaotaichinhvietnam.vn/stores/news_dataimages/2024/102024/22/17/a-dh-tdm20241022171319.jpg?rt=20241022171323")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth="xs">
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng thử lại.
          </Alert>
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button variant="contained" onClick={() => navigate("/login")}>
              Quay lại đăng nhập
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
        backgroundImage:
          'url("https://thoibaotaichinhvietnam.vn/stores/news_dataimages/2024/102024/22/17/a-dh-tdm20241022171319.jpg?rt=20241022171323")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/login")}
            sx={{ alignSelf: "flex-start", mb: 2, color: "white" }}
          >
            Quay lại đăng nhập
          </Button>

          {success ? (
            <Paper sx={{ p: 4, width: '100%', textAlign: 'center', borderRadius: 3 }}>
              <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                ✅ Đặt lại mật khẩu thành công!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Mật khẩu của bạn đã được thay đổi thành công.
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                Bạn sẽ được chuyển hướng đến trang đăng nhập sau 3 giây...
              </Alert>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{ mt: 3, fontWeight: 700 }}
              >
                Đến trang đăng nhập ngay
              </Button>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, width: '100%', borderRadius: 3 }}>
              <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                🔄 Đặt lại mật khẩu
              </Typography>

              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Lưu ý:</strong> Liên kết đặt lại mật khẩu chỉ có hiệu lực trong 10 phút.
                </Typography>
              </Alert>

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Mật khẩu mới"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  margin="normal"
                  fullWidth
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 700 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'ĐẶT LẠI MẬT KHẨU'
                  )}
                </Button>
              </Box>
            </Paper>
          )}

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
              © {new Date().getFullYear()} Hệ Thống Quản Lý Đề Tài
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ResetPassword;