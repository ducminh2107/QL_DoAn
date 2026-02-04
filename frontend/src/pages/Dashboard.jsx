import React from 'react';
import { Container, Paper, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const getRoleDisplay = () => {
    switch(user?.role) {
      case 'admin': return 'Quản trị viên';
      case 'teacher': return 'Giảng viên';
      case 'student': return 'Sinh viên';
      default: return 'Người dùng';
    }
  };

  const quickActions = [
    { 
      title: 'Hồ sơ cá nhân', 
      icon: <PeopleIcon />, 
      path: '/profile',
      color: 'primary.main'
    },
  ];

  // Add role-specific actions
  if (user?.role === 'student') {
    quickActions.push(
      { 
        title: 'Đề tài của tôi', 
        icon: <AssignmentIcon />, 
        path: '/student',
        color: 'success.main'
      },
      { 
        title: 'Danh sách đề tài', 
        icon: <SchoolIcon />, 
        path: '/student/topics',
        color: 'info.main'
      }
    );
  } else if (user?.role === 'teacher') {
    quickActions.push(
      { 
        title: 'Quản lý đề tài', 
        icon: <AssignmentIcon />, 
        path: '/teacher',
        color: 'success.main'
      }
    );
  } else if (user?.role === 'admin') {
    quickActions.push(
      { 
        title: 'Quản lý hệ thống', 
        icon: <SettingsIcon />, 
        path: '/admin',
        color: 'warning.main'
      }
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.light', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          {getWelcomeMessage()}, {user?.user_name}!
        </Typography>
        <Typography variant="body1">
          Chào mừng bạn đến với Hệ thống Quản lý Luận văn.
          Vai trò: <strong>{getRoleDisplay()}</strong> | Mã: <strong>{user?.user_id}</strong>
        </Typography>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Trạng thái</Typography>
                  <Typography variant="h4">
                    {user?.role === 'student' ? 'Sinh viên' : 
                     user?.role === 'teacher' ? 'Giảng viên' : 'Quản trị'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Khoa/Viện</Typography>
                  <Typography variant="h5">
                    {user?.user_faculty || 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Chuyên ngành</Typography>
                  <Typography variant="h5">
                    {user?.user_major || 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        📋 Thao tác nhanh
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: action.color, mb: 2 }}>
                  {React.cloneElement(action.icon, { sx: { fontSize: 48 } })}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {action.title}
                </Typography>
                <Button variant="outlined" size="small">
                  Truy cập
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* System Info */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          ℹ️ Thông tin hệ thống
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • Hệ thống Quản lý Luận văn - Phiên bản 1.0
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • Tài khoản được cung cấp bởi Nhà trường
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Liên hệ hỗ trợ: phongdaotao@truong.edu.vn
        </Typography>
      </Paper>
    </Container>
  );
};

export default Dashboard;