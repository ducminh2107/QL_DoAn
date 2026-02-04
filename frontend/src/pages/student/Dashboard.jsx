import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  Divider,
  Alert,
} from "@mui/material";
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    currentTopic: null,
    registrationStatus: null,
    upcomingDeadlines: [],
    statistics: {},
    notifications: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // In real implementation, you would have a dedicated dashboard endpoint
      // For now, we'll make multiple requests
      const [topicRes, statsRes] = await Promise.all([
        axios.get("/api/student/my-topic"),
        axios.get("/api/student/statistics"), // You need to create this endpoint
      ]);

      setDashboardData({
        currentTopic: topicRes.data.data,
        registrationStatus: topicRes.data.data
          ? "registered"
          : "not_registered",
        upcomingDeadlines: [
          { title: "Báo cáo tiến độ 1", date: "2024-04-15", type: "progress" },
          { title: "Nộp đề cương", date: "2024-03-01", type: "proposal" },
        ],
        statistics: statsRes.data.data || {
          total_topics: 0,
          registered_topics: 0,
          completed_milestones: 0,
          pending_tasks: 3,
        },
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        👋 Xin chào, {user?.user_name || "Sinh viên"}
      </Typography>

      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: "primary.light", color: "white" }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <SchoolIcon sx={{ fontSize: 60 }} />
              </Grid>
              <Grid item xs>
                <Typography variant="h5" gutterBottom>
                  Hệ thống Quản lý Đồ án/Luận văn
                </Typography>
                <Typography variant="body1">
                  Chào mừng đến với hệ thống quản lý đề tài.
                  {dashboardData.currentTopic
                    ? " Bạn đang tham gia đề tài."
                    : " Hãy tìm và đăng ký đề tài phù hợp."}
                </Typography>
              </Grid>
              {!dashboardData.currentTopic && (
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate("/student/topics")}
                  >
                    Tìm đề tài ngay
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Đề tài</Typography>
              </Box>
              <Typography variant="h3" align="center">
                {dashboardData.statistics.registered_topics || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                / {dashboardData.statistics.total_topics || 0} đã đăng ký
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate("/student/topics")}>
                Xem tất cả
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <GroupIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Thành viên</Typography>
              </Box>
              <Typography variant="h3" align="center">
                {dashboardData.currentTopic?.topic_group_student?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                / {dashboardData.currentTopic?.topic_max_members || 1} tối đa
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Tiến độ</Typography>
              </Box>
              <Typography variant="h3" align="center">
                {dashboardData.statistics.completed_milestones || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                / 5 milestone hoàn thành
              </Typography>
            </CardContent>
            {dashboardData.currentTopic && (
              <CardActions>
                <Button
                  size="small"
                  onClick={() =>
                    navigate(
                      `/student/topics/${dashboardData.currentTopic._id}/progress`,
                    )
                  }
                >
                  Xem chi tiết
                </Button>
              </CardActions>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Việc cần làm
              </Typography>
              <Typography variant="h3" align="center">
                {dashboardData.statistics.pending_tasks || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                công việc đang chờ
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Topic Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Đề tài hiện tại
            </Typography>
            {dashboardData.currentTopic ? (
              <Box>
                <Typography variant="h5" color="primary" gutterBottom>
                  {dashboardData.currentTopic.topic_title}
                </Typography>
                <Grid container spacing={2} mt={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                      <strong>Giảng viên hướng dẫn:</strong>{" "}
                      {dashboardData.currentTopic.topic_instructor?.user_name ||
                        "Chưa phân công"}
                    </Typography>
                    <Typography variant="body1" mt={1}>
                      <strong>Trạng thái:</strong>{" "}
                      <Chip
                        label={
                          dashboardData.currentTopic.topic_teacher_status ===
                          "approved"
                            ? "Đã duyệt"
                            : "Chờ duyệt"
                        }
                        color={
                          dashboardData.currentTopic.topic_teacher_status ===
                          "approved"
                            ? "success"
                            : "warning"
                        }
                        size="small"
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        navigate(
                          `/student/topics/${dashboardData.currentTopic._id}`,
                        )
                      }
                      sx={{ mr: 2 }}
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() =>
                        navigate(
                          `/student/topics/${dashboardData.currentTopic._id}/progress`,
                        )
                      }
                    >
                      Cập nhật tiến độ
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Alert severity="info">
                Bạn chưa có đề tài nào. Hãy tìm và đăng ký đề tài phù hợp với
                chuyên ngành của bạn.
                <Button
                  variant="contained"
                  sx={{ ml: 2 }}
                  onClick={() => navigate("/student/topics")}
                >
                  Tìm đề tài
                </Button>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Deadline sắp tới
            </Typography>
            {dashboardData.upcomingDeadlines.length > 0 ? (
              dashboardData.upcomingDeadlines.map((deadline, index) => (
                <Box key={index} mb={2}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body1">{deadline.title}</Typography>
                    <Chip
                      label={new Date(deadline.date).toLocaleDateString(
                        "vi-VN",
                      )}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Không có deadline nào sắp tới.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thao tác nhanh
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/student/topics")}
                >
                  Tìm đề tài
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/student/topics/propose")}
                >
                  Đề xuất đề tài
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/student/progress")}
                >
                  Tiến độ
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/student/grades")}
                >
                  Điểm số
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;
