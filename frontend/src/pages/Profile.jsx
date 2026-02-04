import React from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Divider,
  Grid,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Thông tin cá nhân
      </Typography>
      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              src={user.user_avatar}
              sx={{ width: 150, height: 150, mb: 2 }}
            />
            <Typography variant="h6">{user.user_name}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.role.toUpperCase()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Mã người dùng
              </Typography>
              <Typography variant="body1">{user.user_id}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Khoa
              </Typography>
              <Typography variant="body1">
                {user.user_faculty || "Chưa cập nhật"}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Chuyên ngành
              </Typography>
              <Typography variant="body1">
                {user.user_major || "Chưa cập nhật"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
