import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    pendingTopics: [],
    pendingRegistrations: [],
    upcomingDefenses: [],
    recentActivities: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [topicsRes, registrationsRes] = await Promise.all([
        axios.get('/api/teacher/topics?limit=5'),
        axios.get('/api/teacher/students/registrations')
      ]);

      // Mock data for other sections
      const mockData = {
        stats: topicsRes.data.stats || {
          total: 0,
          my_created: 0,
          my_guided: 0,
          pending_approval: 0,
          in_progress: 0,
          completed: 0
        },
        pendingTopics: topicsRes.data.data?.filter(t => t.topic_teacher_status === 'pending') || [],
        pendingRegistrations: registrationsRes.data.data || [],
        upcomingDefenses: [
          { title: 'Hệ thống quản lý thư viện', date: '2024-04-15', time: '08:00', room: 'A101' },
          { title: 'Ứng dụng học tiếng Anh', date: '2024-04-18', time: '13:30', room: 'B202' }
        ],
        recentActivities: [
          { type: 'grade', title: 'Đã chấm điểm đề tài "Hệ thống E-Learning"', time: '2 giờ trước' },
          { type: 'approval', title: 'Đã duyệt đề tài của Nguyễn Văn A', time: '1 ngày trước' },
          { type: 'feedback', title: 'Đã gửi phản hồi cho nhóm KTPM', time: '2 ngày trước' }
        ]
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'need_revision': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircleIcon />;
      case 'pending': return <PendingIcon />;
      case 'rejected': return <WarningIcon />;
      default: return <PendingIcon />;
    }
  };

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Welcome Header */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.light', color: 'white' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'white' }}>
              <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              Chào mừng Giảng viên, {user?.user_name}
            </Typography>
            <Typography variant="body1">
              Quản lý đề tài, sinh viên và chấm điểm từ một nơi
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/teacher/topics/create')}
              size="large"
            >
              Tạo đề tài mới
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary">
                {dashboardData.stats.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng đề tài
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main">
                {dashboardData.stats.pending_approval || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chờ duyệt
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main">
                {dashboardData.stats.in_progress || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đang thực hiện
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info.main">
                {dashboardData.pendingRegistrations.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đăng ký chờ
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="secondary.main">
                {dashboardData.stats.completed || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã hoàn thành
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="text.primary">
                {dashboardData.stats.my_guided || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đang hướng dẫn
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Quick Actions & Pending Items */}
        <Grid item xs={12} lg={8}>
          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1 }} /> Thao tác nhanh
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  onClick={() => navigate('/teacher/topics')}
                >
                  Quản lý đề tài
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PendingIcon />}
                  onClick={() => navigate('/teacher/topics/pending-approval')}
                >
                  Duyệt đề tài
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GroupIcon />}
                  onClick={() => navigate('/teacher/students/registrations')}
                >
                  Duyệt đăng ký
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SchoolIcon />}
                  onClick={() => navigate('/teacher/grading')}
                >
                  Chấm điểm
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GroupIcon />}
                  onClick={() => navigate('/teacher/students/guided')}
                >
                  Sinh viên HD
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<NotificationsIcon />}
                  onClick={() => navigate('/teacher/notifications')}
                >
                  Gửi thông báo
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Pending Topics */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <PendingIcon sx={{ mr: 1 }} /> Đề tài chờ duyệt
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/teacher/topics/pending-approval')}
              >
                Xem tất cả
              </Button>
            </Box>
            
            {dashboardData.pendingTopics.length > 0 ? (
              <List>
                {dashboardData.pendingTopics.slice(0, 3).map((topic) => (
                  <ListItem
                    key={topic._id}
                    button
                    onClick={() => navigate(`/teacher/topics/${topic._id}/review`)}
                    sx={{ mb: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(topic.topic_teacher_status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={topic.topic_title}
                      secondary={
                        <Box component="span" display="flex" alignItems="center">
                          <Chip
                            label={topic.topic_category?.topic_category_title}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption">
                            {topic.topic_creator?.user_name}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={topic.topic_teacher_status === 'pending' ? 'Chờ duyệt' : 'Cần sửa'}
                      color={getStatusColor(topic.topic_teacher_status)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" py={2}>
                Không có đề tài nào chờ duyệt
              </Typography>
            )}
          </Paper>

          {/* Pending Registrations */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon sx={{ mr: 1 }} /> Đăng ký chờ duyệt
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/teacher/students/registrations')}
              >
                Xem tất cả
              </Button>
            </Box>
            
            {dashboardData.pendingRegistrations.length > 0 ? (
              <List>
                {dashboardData.pendingRegistrations.slice(0, 3).map((reg, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => navigate(`/teacher/students/registrations`)}
                    sx={{ mb: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {reg.student_name?.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={reg.student_name}
                      secondary={
                        <Box component="span">
                          <Typography variant="caption" display="block">
                            {reg.topic_title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Đăng ký: {new Date(reg.registration_date).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip label="Chờ duyệt" color="warning" size="small" />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" py={2}>
                Không có đăng ký nào chờ duyệt
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Upcoming & Activities */}
        <Grid item xs={12} lg={4}>
          {/* Upcoming Defenses */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 1 }} /> Lịch bảo vệ sắp tới
            </Typography>
            
            {dashboardData.upcomingDefenses.length > 0 ? (
              dashboardData.upcomingDefenses.map((defense, index) => (
                <Box key={index} mb={2} pb={2} borderBottom={index < dashboardData.upcomingDefenses.length - 1 ? 1 : 0} borderColor="divider">
                  <Typography variant="subtitle2" fontWeight={600}>
                    {defense.title}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(defense.date).toLocaleDateString('vi-VN')} {defense.time}
                    </Typography>
                    <Chip label={defense.room} size="small" />
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" py={2}>
                Không có lịch bảo vệ nào
              </Typography>
            )}
            
            <Button fullWidth variant="outlined" size="small" sx={{ mt: 2 }}>
              Xem lịch đầy đủ
            </Button>
          </Paper>

          {/* Recent Activities */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon sx={{ mr: 1 }} /> Hoạt động gần đây
            </Typography>
            
            {dashboardData.recentActivities.length > 0 ? (
              <List dense>
                {dashboardData.recentActivities.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {activity.type === 'grade' ? (
                        <SchoolIcon color="primary" fontSize="small" />
                      ) : activity.type === 'approval' ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : (
                        <AssignmentIcon color="info" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          {activity.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" py={2}>
                Chưa có hoạt động nào
              </Typography>
            )}
          </Paper>

          {/* Teaching Stats */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Thống kê hướng dẫn
            </Typography>
            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Đề tài đang hướng dẫn:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {dashboardData.stats.my_guided || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Sinh viên đang hướng dẫn:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {dashboardData.pendingRegistrations.length + (dashboardData.stats.my_guided || 0) * 2}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Đề tài đã hoàn thành:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {dashboardData.stats.completed || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Tỷ lệ hoàn thành:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {dashboardData.stats.total > 0 
                    ? `${Math.round((dashboardData.stats.completed / dashboardData.stats.total) * 100)}%`
                    : '0%'
                  }
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherDashboard;