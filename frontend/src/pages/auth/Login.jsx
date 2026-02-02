import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === "admin@thesis.edu.vn" && password === "admin123") {
      toast.success("Đăng nhập thành công!");
      navigate("/dashboard");
    } else {
      toast.error("Tài khoản hoặc mật khẩu không chính xác!");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fb",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Illustrations */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: 40,
          display: { xs: "none", md: "block" },
          opacity: 0.8,
        }}
      >
        <svg width="240" height="240" viewBox="0 0 240 240">
          <rect
            x="20"
            y="100"
            width="80"
            height="120"
            rx="4"
            fill="#64b5f6"
            opacity="0.1"
          />
          <path
            d="M40 140 H80 M40 160 H70 M40 180 H60"
            stroke="#42a5f5"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="160"
            cy="180"
            r="40"
            stroke="#ffb74d"
            strokeWidth="4"
            strokeDasharray="8 4"
            fill="none"
          />
          <path
            d="M120 220 L160 160 L200 220"
            stroke="#ef5350"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
          />
        </svg>
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: 40,
          right: 40,
          display: { xs: "none", md: "block" },
          opacity: 0.8,
        }}
      >
        <svg width="240" height="240" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="100" fill="#e3f2fd" opacity="0.3" />
          <rect
            x="80"
            y="60"
            width="80"
            height="100"
            rx="8"
            fill="white"
            stroke="#e0e0e0"
            strokeWidth="2"
          />
          <rect x="95" y="75" width="50" height="6" rx="3" fill="#42a5f5" />
          <rect x="95" y="90" width="40" height="4" rx="2" fill="#eeeeee" />
          <rect x="95" y="100" width="30" height="4" rx="2" fill="#eeeeee" />
          <circle cx="180" cy="80" r="20" fill="#81c784" opacity="0.4" />
        </svg>
      </Box>

      <Container maxWidth="sm" sx={{ zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          {/* Logo Section */}
          <Box
            component="img"
            src="https://sso.tdmu.edu.vn/images/tdmu-icon-ldpi.png"
            alt="TDMU Logo"
            sx={{ width: 80, mb: 2 }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#1a237e",
              mb: 4,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Trường Đại học Thủ Dầu Một
          </Typography>

          {/* Form Section */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ textAlign: "left", mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Tài khoản <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="Mã sinh viên"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f3f6f9",
                    "& fieldset": { border: "none" },
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            <Box sx={{ textAlign: "left", mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Mật khẩu <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f3f6f9",
                    "& fieldset": { border: "none" },
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(66, 165, 245, 0.3)",
              }}
            >
              Đăng nhập
            </Button>
          </Box>

          {/*<Box sx={{ my: 3, display: "flex", alignItems: "center" }}>
            <Divider sx={{ flex: 1 }} />
            <Typography
              variant="caption"
              sx={{ px: 2, color: "#999", fontWeight: 700 }}
            >
              HOẶC
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>*/}

          {/* Google Login Button */}
          {/*<Button
            fullWidth
            variant="outlined"
            startIcon={
              <Box
                component="img"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                sx={{ width: 18 }}
              />
            }
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              color: "#666",
              borderColor: "#e0e0e0",
              backgroundColor: "#f8f9fb",
              "&:hover": {
                backgroundColor: "#f3f6f9",
                borderColor: "#d0d0d0",
              },
            }}
          >
            Đăng nhập bằng tài khoản Email
          </Button>*/}
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
