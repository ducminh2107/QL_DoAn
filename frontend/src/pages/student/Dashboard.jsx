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
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  NotificationsActive as NotifIcon,
  ArrowForward as ArrowIcon,
  Star as StarIcon,
  Event as EventIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as SparkleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    currentTopic: null,
    registrationStatus: null,
    upcomingDeadlines: [],
    statistics: {
      total_topics: 0,
      registered_topics: 0,
      completed_milestones: 0,
      progress_percentage: 0,
    },
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [topicRes, statsRes] = await Promise.all([
        axios.get("/api/student/my-topic"),
        axios.get("/api/student/statistics"),
      ]);

      setDashboardData({
        currentTopic: topicRes.data.data,
        registrationStatus: topicRes.data.data
          ? "registered"
          : "not_registered",
        upcomingDeadlines: [
          {
            title: "Báo cáo tiến độ 1",
            date: "2024-04-15",
            type: "progress",
            urgent: true,
          },
          {
            title: "Hoàn thiện đề cương",
            date: "2024-03-25",
            type: "proposal",
            urgent: false,
          },
        ],
        statistics: statsRes.data.data,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const glassCardSx = {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(16px)",
    borderRadius: "28px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
      borderColor: theme.palette.primary.main,
    },
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4, px: 4 }}>
        <LinearProgress sx={{ borderRadius: 8, height: 8 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background:
          "radial-gradient(circle at 0% 0%, #f1f5f9 0%, #f8fafc 100%)",
        minHeight: "100vh",
        pb: 8,
      }}
    >
      <Container maxWidth="xl">
        {/* Top Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 4,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            {console.log("Current user in Dashboard:", user)}
            <Avatar
              key={user?.user_avatar}
              src={user?.user_avatar}
              sx={{
                width: 64,
                height: 64,
                border: `4px solid ${theme.palette.background.paper}`,
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              }}
            >
              {user?.user_name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-0.03em",
                }}
              >
                Chào bạn {user?.user_name?.split(" ").pop() || "bạn"},{" "}
                <SparkleIcon
                  sx={{ color: "#f59e0b", verticalAlign: "middle" }}
                />
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#64748b", fontWeight: 500 }}
              >
                Cùng nhau hoàn thành đồ án thật tốt nhé!
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Thông báo mới">
              <IconButton
                sx={{
                  bgcolor: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  width: 48,
                  height: 48,
                }}
              >
                <NotifIcon sx={{ color: "#6366f1" }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Grid container spacing={4}>
          {/* Main Content Column */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              {/* Hero Banner Area */}
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  borderRadius: "32px",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: "#fff",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: `0 20px 50px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <Box sx={{ position: "relative", zIndex: 2 }}>
                  <Typography
                    variant="overline"
                    sx={{ fontWeight: 800, letterSpacing: 2, opacity: 0.8 }}
                  >
                    Hệ thống quản lý luận văn v1.0
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 900, mt: 1, mb: 2, lineHeight: 1.1 }}
                  >
                    {dashboardData.currentTopic
                      ? "Tiến tới vạch đích!"
                      : "Sẵn sàng tỏa sáng?"}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      opacity: 0.9,
                      fontWeight: 400,
                      mb: 4,
                      maxWidth: "500px",
                    }}
                  >
                    {dashboardData.currentTopic
                      ? "Mọi nỗ lực hôm nay sẽ gặt hái kết quả ngày mai. Hãy cập nhật tiến độ cho giảng viên nhé."
                      : "Chọn một đề tài ưng ý và bắt đầu hành trình chinh phục những đỉnh cao tri thức mới."}
                  </Typography>

                  <Stack direction="row" spacing={3}>
                    {dashboardData.currentTopic ? (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/student/progress")}
                        sx={{
                          bgcolor: "#fff",
                          color: theme.palette.primary.main,
                          px: 4,
                          py: 2,
                          borderRadius: "16px",
                          fontWeight: 800,
                          "&:hover": {
                            bgcolor: "#f8fafc",
                            transform: "scale(1.05)",
                          },
                          transition: "all 0.3s",
                        }}
                      >
                        Cập nhật ngay
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/student/topics")}
                        sx={{
                          bgcolor: "#fff",
                          color: theme.palette.primary.main,
                          px: 4,
                          py: 2,
                          borderRadius: "16px",
                          fontWeight: 800,
                          "&:hover": { bgcolor: "#f8fafc" },
                        }}
                      >
                        Khám phá đề tài
                      </Button>
                    )}
                  </Stack>
                </Box>
                <AssignmentIcon
                  sx={{
                    fontSize: 300,
                    position: "absolute",
                    right: -40,
                    bottom: -60,
                    opacity: 0.1,
                    transform: "rotate(-20deg)",
                  }}
                />
              </Paper>

              {/* Progress Detail vs Stats Grid */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Card
                    sx={{ ...glassCardSx, minHeight: "100%" }}
                    elevation={0}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, mb: 3, color: "#1e293b" }}
                      >
                        <CheckCircleIcon
                          color="primary"
                          sx={{ mr: 1, verticalAlign: "middle" }}
                        />{" "}
                        Đề tài hiện có
                      </Typography>

                      {dashboardData.currentTopic ? (
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}
                          >
                            {dashboardData.currentTopic.topic_title}
                          </Typography>

                          <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
                            <Chip
                              label="Đang thực hiện"
                              color="primary"
                              sx={{ fontWeight: 700, borderRadius: "8px" }}
                            />
                            <Chip
                              label={
                                dashboardData.currentTopic
                                  .topic_teacher_status === "approved"
                                  ? "Đã duyệt"
                                  : "Chờ duyệt"
                              }
                              color={
                                dashboardData.currentTopic
                                  .topic_teacher_status === "approved"
                                  ? "success"
                                  : "warning"
                              }
                              variant="outlined"
                              sx={{ fontWeight: 700, borderRadius: "8px" }}
                            />
                          </Stack>

                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: "#64748b",
                              mb: 1,
                              display: "block",
                            }}
                          >
                            Tiến độ hoàn thành
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              mb: 3,
                            }}
                          >
                            <Box sx={{ flexGrow: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={
                                  dashboardData.statistics
                                    .progress_percentage || 0
                                }
                                sx={{
                                  height: 14,
                                  borderRadius: 7,
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.1,
                                  ),
                                  "& .MuiLinearProgress-bar": {
                                    borderRadius: 7,
                                  },
                                }}
                              />
                            </Box>
                            <Typography
                              variant="h5"
                              sx={{
                                fontWeight: 900,
                                color: theme.palette.primary.main,
                              }}
                            >
                              {dashboardData.statistics.progress_percentage ||
                                0}
                              %
                            </Typography>
                          </Box>

                          <Divider sx={{ my: 3, borderStyle: "dashed" }} />

                          <Stack
                            direction="row"
                            spacing={2}
                            justifyContent="flex-end"
                          >
                            <Button
                              variant="outlined"
                              onClick={() =>
                                navigate(
                                  `/student/topics/${dashboardData.currentTopic._id}`,
                                )
                              }
                              sx={{
                                borderRadius: "12px",
                                px: 3,
                                fontWeight: 700,
                              }}
                            >
                              Chi tiết
                            </Button>
                            <Button
                              variant="contained"
                              onClick={() => navigate("/student/progress")}
                              sx={{
                                borderRadius: "12px",
                                px: 4,
                                fontWeight: 700,
                                boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
                              }}
                            >
                              Cập nhật
                            </Button>
                          </Stack>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            py: 6,
                            textAlign: "center",
                            bgcolor: "#f1f5f9",
                            borderRadius: "24px",
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ color: "#64748b", mb: 3, fontWeight: 500 }}
                          >
                            Hiện tại bạn chưa đăng ký đề tài nào.
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => navigate("/student/topics")}
                            sx={{ borderRadius: "12px", fontWeight: 700 }}
                          >
                            Đăng ký ngay
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Stack spacing={3} sx={{ height: "100%" }}>
                    <Card sx={glassCardSx} elevation={0}>
                      <CardContent sx={{ p: 4 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: "18px",
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            }}
                          >
                            <StarIcon
                              sx={{ color: theme.palette.primary.main }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900 }}>
                              {dashboardData.statistics.registered_topics || 0}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748b", fontWeight: 600 }}
                            >
                              Đã đăng ký
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card sx={glassCardSx} elevation={0}>
                      <CardContent sx={{ p: 4 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: "18px",
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                            }}
                          >
                            <CheckCircleIcon
                              sx={{ color: theme.palette.success.main }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900 }}>
                              {dashboardData.statistics.completed_milestones ||
                                0}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748b", fontWeight: 600 }}
                            >
                              Mốc hoàn thành
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          {/* Sidebar Column */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              {/* Upcoming Tasks Card */}
              <Card
                sx={{
                  ...glassCardSx,
                  border: "none",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 4,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      Lịch nhắc nhở
                    </Typography>
                    <IconButton size="small" sx={{ bgcolor: "#f1f5f9" }}>
                      <EventIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Stack spacing={2}>
                    {dashboardData.upcomingDeadlines.map((deadline, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 2.5,
                          borderRadius: "20px",
                          bgcolor: deadline.urgent
                            ? alpha(theme.palette.error.main, 0.05)
                            : "#f8fafc",
                          border: `1px solid ${deadline.urgent ? alpha(theme.palette.error.main, 0.2) : "transparent"}`,
                          transition: "0.3s",
                          "&:hover": {
                            bgcolor: deadline.urgent
                              ? alpha(theme.palette.error.main, 0.08)
                              : "#f1f5f9",
                          },
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 800,
                            color: deadline.urgent ? "#ef4444" : "#1e293b",
                            mb: 1,
                          }}
                        >
                          {deadline.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ScheduleIcon
                            sx={{ fontSize: 16, color: "#64748b" }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b", fontWeight: 600 }}
                          >
                            {new Date(deadline.date).toLocaleDateString(
                              "vi-VN",
                              { day: "numeric", month: "long" },
                            )}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    fullWidth
                    variant="text"
                    sx={{ mt: 2, fontWeight: 700, borderRadius: "12px", py: 1 }}
                  >
                    Xem toàn bộ lịch
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Access List */}
              <Card sx={{ ...glassCardSx, bgcolor: "#1e293b", color: "#fff" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>
                    Tiện ích nhanh
                  </Typography>
                  <Stack spacing={1}>
                    {[
                      {
                        title: "Lịch sử đăng ký",
                        path: "/student/registration-history",
                      },
                      { title: "Bảng điểm cá nhân", path: "/student/grades" },
                      { title: "Hồ sơ của tôi", path: "/profile" },
                    ].map((link, i) => (
                      <Button
                        key={i}
                        fullWidth
                        onClick={() => navigate(link.path)}
                        sx={{
                          justifyContent: "space-between",
                          color: "rgba(255,255,255,0.7)",
                          py: 1.5,
                          px: 2,
                          borderRadius: "14px",
                          "&:hover": {
                            bgcolor: "rgba(255,255,255,0.1)",
                            color: "#fff",
                          },
                        }}
                        endIcon={<ChevronRightIcon />}
                      >
                        {link.title}
                      </Button>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
