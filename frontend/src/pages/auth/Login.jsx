import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockPerson,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

// Validation schema
const loginSchema = yup.object().shape({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup.string().required("Mật khẩu là bắt buộc"),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User already logged in, redirecting...");
      redirectBasedOnRole(user.role);
    }
  }, [user, authLoading]);

  const redirectBasedOnRole = (role) => {
    console.log("Redirecting based on role:", role);
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (role === "teacher") {
      navigate("/teacher");
    } else if (role === "student") {
      navigate("/student");
    } else {
      navigate("/dashboard");
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await login(data.email, data.password);
      toast.success("Đăng nhập thành công!");

      // Get user from response
      const loginUser = response.data.user;
      console.log("Login successful, user role:", loginUser.role);

      // Redirect based on role
      redirectBasedOnRole(loginUser.role);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Logo/Header */}
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mb: 2,
                mx: "auto",
                bgcolor: "primary.main",
              }}
            >
              <LockPerson sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
              HỆ THỐNG QUẢN LÝ ĐỀ TÀI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đăng nhập với tài khoản được cấp
            </Typography>
          </Box>

          <Paper
            elevation={3}
            sx={{
              padding: 4,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
              ĐĂNG NHẬP HỆ THỐNG
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ width: "100%" }}
            >
              <TextField
                margin="normal"
                fullWidth
                label="Email"
                autoComplete="email"
                autoFocus
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockPerson />
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
                  ),
                }}
              />

              <Box sx={{ textAlign: "right", mt: 1 }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  underline="hover"
                >
                  Quên mật khẩu?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "ĐĂNG NHẬP"
                )}
              </Button>


            </Box>
          </Paper>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Hệ Thống Quản Lý Đề Tài
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tài khoản được cung cấp bởi Nhà trường
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
