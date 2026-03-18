import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Bolt as BoltIcon,
  PersonSearch as PersonSearchIcon,
  GradeRounded as GradeIcon,
  AutoAwesome as SparkleIcon,
  LocationOn as RoomIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────
// Colour palette
// ─────────────────────────────────────────────────────────────────
const C = {
  primary: "#0ea5e9", // sky-500
  primaryDk: "#0369a1", // sky-700
  teal: "#14b8a6", // teal-500
  emerald: "#10b981", // emerald-500
  amber: "#f59e0b", // amber-500
  rose: "#f43f5e", // rose-500
  violet: "#8b5cf6", // violet-500
  slate: "#64748b",
};

// ─────────────────────────────────────────────────────────────────
const alpha = (hex, op) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${op})`;
};

// ─────────────────────────────────────────────────────────────────
const GlassCard = ({ children, hover = true, sx = {} }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: "24px",
      background: "#fff",
      border: "1px solid #e2e8f0",
      boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
      ...(hover && {
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
        },
      }),
      ...sx,
    }}
  >
    {children}
  </Card>
);

// ─────────────────────────────────────────────────────────────────
const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    pendingTopics: [],
    pendingRegistrations: [],
    upcomingDefenses: [],
    recentActivities: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [topicsRes, registrationsRes] = await Promise.all([
        axios.get("/api/teacher/topics?limit=5"),
        axios.get("/api/teacher/students/registrations"),
      ]);

      setDashboardData({
        stats: topicsRes.data.stats || {
          total: 0,
          my_created: 0,
          my_guided: 0,
          pending_approval: 0,
          in_progress: 0,
          completed: 0,
        },
        pendingTopics:
          topicsRes.data.data?.filter(
            (t) => t.topic_teacher_status === "pending",
          ) || [],
        pendingRegistrations: registrationsRes.data.data || [],
        upcomingDefenses: [],
        recentActivities: [],
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể tải dữ liệu dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Chào buổi sáng";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${C.primary} 0%, ${C.teal} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center", color: "#fff" }}>
          <SparkleIcon sx={{ fontSize: 60, mb: 2 }} />
          <LinearProgress
            sx={{
              width: 200,
              borderRadius: 4,
              height: 6,
              bgcolor: "rgba(255,255,255,0.3)",
              "& .MuiLinearProgress-bar": { bgcolor: "#fff" },
            }}
          />
          <Typography sx={{ mt: 2, opacity: 0.85, fontWeight: 600 }}>
            Đang tải dữ liệu...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ── Stat cards ──────────────────────────────────────────────────
  const statCards = [
    {
      label: "Tổng đề tài",
      value: dashboardData.stats.total || 0,
      color: C.primary,
      bg: "#e0f2fe",
      icon: <AssignmentIcon />,
    },
    {
      label: "Chờ duyệt",
      value: dashboardData.stats.pending_approval || 0,
      color: C.amber,
      bg: "#fef3c7",
      icon: <PendingIcon />,
    },
    {
      label: "Đang thực hiện",
      value: dashboardData.stats.in_progress || 0,
      color: C.emerald,
      bg: "#d1fae5",
      icon: <TrendingUpIcon />,
    },
    {
      label: "SV chờ duyệt",
      value: dashboardData.pendingRegistrations.length,
      color: C.violet,
      bg: "#ede9fe",
      icon: <GroupIcon />,
    },
    {
      label: "Đã hoàn thành",
      value: dashboardData.stats.completed || 0,
      color: C.teal,
      bg: "#ccfbf1",
      icon: <TrophyIcon />,
    },
    {
      label: "Đang hướng dẫn",
      value: dashboardData.stats.my_guided || 0,
      color: C.rose,
      bg: "#ffe4e6",
      icon: <SchoolIcon />,
    },
  ];

  // ── Quick action buttons ────────────────────────────────────────
  const quickActions = [
    {
      label: "Quản lý đề tài",
      icon: <AssignmentIcon />,
      path: "/teacher/topics",
      color: C.primary,
    },
    {
      label: "Duyệt đề tài",
      icon: <PendingIcon />,
      path: "/teacher/topics/pending-approval",
      color: C.amber,
    },
    {
      label: "Duyệt đăng ký",
      icon: <GroupIcon />,
      path: "/teacher/students/registrations",
      color: C.violet,
    },
    {
      label: "Chấm điểm",
      icon: <GradeIcon />,
      path: "/teacher/grading",
      color: C.emerald,
    },
    {
      label: "Sinh viên HD",
      icon: <PersonSearchIcon />,
      path: "/teacher/students/guided",
      color: C.teal,
    },
    {
      label: "Gửi thông báo",
      icon: <NotificationsIcon />,
      path: "/teacher/notifications",
      color: C.rose,
    },
  ];

  const activityIcon = (type) => {
    if (type === "grade")
      return <GradeIcon sx={{ color: C.primary, fontSize: 20 }} />;
    if (type === "approval")
      return <CheckCircleIcon sx={{ color: C.emerald, fontSize: 20 }} />;
    return <AssignmentIcon sx={{ color: C.violet, fontSize: 20 }} />;
  };

  const completionRate =
    dashboardData.stats.total > 0
      ? Math.round(
          (dashboardData.stats.completed / dashboardData.stats.total) * 100,
        )
      : 0;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg,#f0f9ff 0%,#f0fdf4 60%,#fdf4ff 100%)",
        pb: 6,
      }}
    >
      {/* ╔══════════════════  HERO HEADER  ══════════════════════╗ */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${C.primary} 0%, ${C.teal} 100%)`,
          pt: { xs: 4, md: 5 },
          pb: { xs: 10, md: 12 },
          px: { xs: 3, md: 6 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative blobs */}
        {[
          { top: -80, right: -80, sz: 280, op: 0.1 },
          { top: 40, right: 160, sz: 120, op: 0.07 },
          { bottom: -100, left: -50, sz: 320, op: 0.09 },
        ].map((b, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              borderRadius: "50%",
              background: "#fff",
              width: b.sz,
              height: b.sz,
              top: b.top,
              right: b.right,
              bottom: b.bottom,
              left: b.left,
              opacity: b.op,
            }}
          />
        ))}

        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {/* Greeting */}
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar
                src={user?.user_avatar}
                sx={{
                  width: 76,
                  height: 76,
                  border: "3px solid rgba(255,255,255,0.6)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  fontSize: "2rem",
                  fontWeight: 900,
                  background: "linear-gradient(135deg,#fff 0%,#cffafe 100%)",
                  color: C.primaryDk,
                }}
              >
                {user?.user_name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 600,
                    mb: 0.3,
                  }}
                >
                  {greet()} 👋
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    color: "#fff",
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {user?.user_name || "Giảng viên"}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    label={user?.user_id}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: "8px",
                    }}
                  />
                  <Chip
                    label={
                      user?.user_faculty?.faculty_title ||
                      user?.user_faculty ||
                      "Giảng viên"
                    }
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.9)",
                      fontWeight: 600,
                      borderRadius: "8px",
                    }}
                  />
                </Stack>
              </Box>
            </Stack>

            {/* CTA */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/teacher/topics/create")}
              sx={{
                bgcolor: "#fff",
                color: C.primaryDk,
                fontWeight: 800,
                borderRadius: "14px",
                textTransform: "none",
                px: 3,
                py: 1.3,
                fontSize: "0.95rem",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                "&:hover": {
                  bgcolor: "#f0f9ff",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.25s",
                display: { xs: "none", sm: "flex" },
              }}
            >
              Tạo đề tài mới
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ╔═════════════  STATS ROW (floating over hero)  ════════╗ */}
      <Box
        sx={{ px: { xs: 2, md: 5 }, mt: -6, position: "relative", zIndex: 3 }}
      >
        <Grid container spacing={2}>
          {statCards.map((s, i) => (
            <Grid item xs={6} sm={4} md={2} key={i}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  background: "#fff",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      bgcolor: s.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                      "& svg": { fontSize: 21, color: s.color },
                    }}
                  >
                    {s.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "1.65rem",
                      fontWeight: 900,
                      color: "#0f172a",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      fontWeight: 600,
                      mt: 0.4,
                      display: "block",
                    }}
                  >
                    {s.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ╔══════════════════  MAIN CONTENT  ═════════════════════╗ */}
      <Box sx={{ px: { xs: 2, md: 5 }, mt: 4 }}>
        <Grid container spacing={3}>
          {/* ┌ LEFT COLUMN ─────────────────────────────────────┐ */}
          <Grid item xs={12} lg={7}>
            <Stack spacing={3}>
              {/* Quick Actions */}
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#1e293b",
                    mb: 2,
                    fontSize: "1.05rem",
                  }}
                >
                  <BoltIcon
                    sx={{ color: C.amber, verticalAlign: "middle", mr: 0.5 }}
                  />
                  Thao tác nhanh
                </Typography>
                <Grid container spacing={2}>
                  {quickActions.map((a, i) => (
                    <Grid item xs={6} sm={4} key={i}>
                      <Card
                        elevation={0}
                        onClick={() => navigate(a.path)}
                        sx={{
                          borderRadius: "20px",
                          border: "1px solid #e8eaf6",
                          background: "#fff",
                          cursor: "pointer",
                          transition: "all 0.25s",
                          "&:hover": {
                            transform: "translateY(-6px)",
                            boxShadow: `0 12px 40px ${alpha(a.color, 0.2)}`,
                            borderColor: a.color,
                          },
                        }}
                      >
                        <CardContent
                          sx={{
                            p: 2.5,
                            "&:last-child": { pb: 2.5 },
                            textAlign: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 52,
                              height: 52,
                              borderRadius: "16px",
                              bgcolor: alpha(a.color, 0.1),
                              mx: "auto",
                              mb: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              "& svg": { fontSize: 26, color: a.color },
                            }}
                          >
                            {a.icon}
                          </Box>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.9rem",
                              color: "#1e293b",
                            }}
                          >
                            {a.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Pending Topics */}
              <GlassCard>
                <CardContent sx={{ p: 3.5 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2.5 }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "1.05rem",
                        color: "#1e293b",
                      }}
                    >
                      <PendingIcon
                        sx={{
                          color: C.amber,
                          verticalAlign: "middle",
                          mr: 0.5,
                          fontSize: 22,
                        }}
                      />
                      Đề tài chờ duyệt
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<ArrowIcon />}
                      onClick={() =>
                        navigate("/teacher/topics/pending-approval")
                      }
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        color: C.primary,
                      }}
                    >
                      Xem tất cả
                    </Button>
                  </Stack>

                  {dashboardData.pendingTopics.length > 0 ? (
                    <Stack spacing={1.5}>
                      {dashboardData.pendingTopics.slice(0, 3).map((topic) => (
                        <Box
                          key={topic._id}
                          onClick={() =>
                            navigate(`/teacher/topics/${topic._id}/review`)
                          }
                          sx={{
                            p: 2,
                            borderRadius: "16px",
                            cursor: "pointer",
                            background:
                              "linear-gradient(135deg,#fffbeb,#fef3c7)",
                            border: "1px solid #fde68a",
                            transition: "0.25s",
                            "&:hover": {
                              transform: "translateX(6px)",
                              boxShadow: `0 4px 20px ${alpha(C.amber, 0.2)}`,
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "12px",
                                bgcolor: "#fef3c7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <AssignmentIcon
                                sx={{ color: C.amber, fontSize: 20 }}
                              />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 800,
                                  color: "#1e293b",
                                  noWrap: true,
                                }}
                              >
                                {topic.topic_title}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#92400e" }}
                              >
                                {topic.topic_creator?.user_name} ·{" "}
                                {topic.topic_category?.topic_category_title}
                              </Typography>
                            </Box>
                            <Chip
                              label="Chờ duyệt"
                              size="small"
                              sx={{
                                bgcolor: "#fde68a",
                                color: "#92400e",
                                fontWeight: 700,
                                borderRadius: "8px",
                              }}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <CheckCircleIcon
                        sx={{ fontSize: 40, color: "#d1fae5", mb: 1 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#94a3b8", fontWeight: 600 }}
                      >
                        Không có đề tài nào chờ duyệt 🎉
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </GlassCard>

              {/* Pending Registrations */}
              <GlassCard>
                <CardContent sx={{ p: 3.5 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2.5 }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "1.05rem",
                        color: "#1e293b",
                      }}
                    >
                      <GroupIcon
                        sx={{
                          color: C.violet,
                          verticalAlign: "middle",
                          mr: 0.5,
                          fontSize: 22,
                        }}
                      />
                      Đăng ký chờ duyệt
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<ArrowIcon />}
                      onClick={() =>
                        navigate("/teacher/students/registrations")
                      }
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        color: C.primary,
                      }}
                    >
                      Xem tất cả
                    </Button>
                  </Stack>

                  {dashboardData.pendingRegistrations.length > 0 ? (
                    <Stack spacing={1.5}>
                      {dashboardData.pendingRegistrations
                        .slice(0, 3)
                        .map((reg, idx) => (
                          <Box
                            key={idx}
                            onClick={() =>
                              navigate("/teacher/students/registrations")
                            }
                            sx={{
                              p: 2,
                              borderRadius: "16px",
                              cursor: "pointer",
                              background:
                                "linear-gradient(135deg,#f5f3ff,#ede9fe)",
                              border: "1px solid #ddd6fe",
                              transition: "0.25s",
                              "&:hover": {
                                transform: "translateX(6px)",
                                boxShadow: `0 4px 20px ${alpha(C.violet, 0.2)}`,
                              },
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={2}
                            >
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: alpha(C.violet, 0.15),
                                  color: C.violet,
                                  fontWeight: 800,
                                }}
                              >
                                {reg.student_name?.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 800, color: "#1e293b" }}
                                >
                                  {reg.student_name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#7c3aed" }}
                                >
                                  {reg.topic_title}
                                </Typography>
                              </Box>
                              <Chip
                                label="Chờ duyệt"
                                size="small"
                                sx={{
                                  bgcolor: "#ddd6fe",
                                  color: "#6d28d9",
                                  fontWeight: 700,
                                  borderRadius: "8px",
                                }}
                              />
                            </Stack>
                          </Box>
                        ))}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <GroupIcon
                        sx={{ fontSize: 40, color: "#e9d5ff", mb: 1 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#94a3b8", fontWeight: 600 }}
                      >
                        Không có đăng ký nào chờ duyệt
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </GlassCard>
            </Stack>
          </Grid>

          {/* ┌ RIGHT SIDEBAR ───────────────────────────────────┐ */}
          <Grid item xs={12} lg={5}>
            <Stack spacing={3}>
              {/* Profile Info */}
              <GlassCard>
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2.5 }}
                  >
                    <Avatar
                      src={user?.user_avatar}
                      sx={{
                        width: 56,
                        height: 56,
                        background: `linear-gradient(135deg,${C.primary},${C.teal})`,
                        fontWeight: 900,
                        fontSize: "1.4rem",
                        color: "#fff",
                      }}
                    >
                      {user?.user_name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {user?.user_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", fontWeight: 600 }}
                      >
                        Giảng viên hướng dẫn
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Stats inline */}
                  <Grid container spacing={1.5}>
                    {[
                      {
                        label: "Đang HD",
                        value: dashboardData.stats.my_guided || 0,
                        color: C.primary,
                      },
                      {
                        label: "Hoàn thành",
                        value: dashboardData.stats.completed || 0,
                        color: C.emerald,
                      },
                      {
                        label: "Tỷ lệ HT",
                        value: `${completionRate}%`,
                        color: C.amber,
                      },
                    ].map((s, i) => (
                      <Grid item xs={4} key={i}>
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 1.5,
                            borderRadius: "14px",
                            bgcolor: alpha(s.color, 0.08),
                            border: `1px solid ${alpha(s.color, 0.15)}`,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "1.3rem",
                              fontWeight: 900,
                              color: s.color,
                              lineHeight: 1,
                            }}
                          >
                            {s.value}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b", fontWeight: 600 }}
                          >
                            {s.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Completion bar */}
                  <Box sx={{ mt: 2.5 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 0.8 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "#64748b" }}
                      >
                        Tỷ lệ hoàn thành
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 900, color: C.primary }}
                      >
                        {completionRate}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={completionRate}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "#e0f2fe",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          bgcolor: C.primary,
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </GlassCard>

              {/* Upcoming Defenses */}
              <GlassCard>
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2.5 }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "1rem",
                        color: "#1e293b",
                      }}
                    >
                      <ScheduleIcon
                        sx={{
                          verticalAlign: "middle",
                          mr: 0.5,
                          color: C.teal,
                          fontSize: 21,
                        }}
                      />
                      Lịch bảo vệ sắp tới
                    </Typography>
                    <Chip
                      label={`${dashboardData.upcomingDefenses.length} lịch`}
                      size="small"
                      sx={{
                        bgcolor: "#ccfbf1",
                        color: "#0f766e",
                        fontWeight: 700,
                        borderRadius: "8px",
                      }}
                    />
                  </Stack>

                  {dashboardData.upcomingDefenses.length > 0 ? (
                    <Stack spacing={1.5}>
                      {dashboardData.upcomingDefenses.map((d, i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 2,
                            borderRadius: "16px",
                            background:
                              "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                            border: "1px solid #bbf7d0",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 800, color: "#1e293b", mb: 1 }}
                          >
                            {d.title}
                          </Typography>
                          <Stack direction="row" spacing={2}>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <TimeIcon sx={{ fontSize: 14, color: C.slate }} />
                              <Typography
                                variant="caption"
                                sx={{ color: C.slate, fontWeight: 600 }}
                              >
                                {new Date(d.date).toLocaleDateString("vi-VN")},{" "}
                                {d.time}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <RoomIcon sx={{ fontSize: 14, color: C.slate }} />
                              <Typography
                                variant="caption"
                                sx={{ color: C.slate, fontWeight: 600 }}
                              >
                                Phòng {d.room}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                      <Typography
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        Chưa có lịch bảo vệ nào
                      </Typography>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="text"
                    sx={{
                      mt: 2,
                      fontWeight: 700,
                      borderRadius: "12px",
                      textTransform: "none",
                      color: C.teal,
                    }}
                  >
                    Xem lịch đầy đủ
                  </Button>
                </CardContent>
              </GlassCard>

              {/* Recent Activities */}
              <GlassCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "1rem",
                      color: "#1e293b",
                      mb: 2.5,
                    }}
                  >
                    <NotificationsIcon
                      sx={{
                        verticalAlign: "middle",
                        mr: 0.5,
                        color: C.rose,
                        fontSize: 21,
                      }}
                    />
                    Hoạt động gần đây
                  </Typography>

                  {dashboardData.recentActivities.length > 0 ? (
                    <Stack spacing={0}>
                      {dashboardData.recentActivities.map((a, i) => (
                        <React.Fragment key={i}>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="flex-start"
                            sx={{ py: 1.5 }}
                          >
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: "10px",
                                bgcolor:
                                  a.type === "grade"
                                    ? "#e0f2fe"
                                    : a.type === "approval"
                                      ? "#d1fae5"
                                      : "#f5f3ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {activityIcon(a.type)}
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700, color: "#334155" }}
                              >
                                {a.label}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#94a3b8", fontWeight: 600 }}
                              >
                                {a.time}
                              </Typography>
                            </Box>
                          </Stack>
                          {i < dashboardData.recentActivities.length - 1 && (
                            <Divider sx={{ borderColor: "#f1f5f9" }} />
                          )}
                        </React.Fragment>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                      <Typography
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        Chưa có hoạt động nào gần đây
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </GlassCard>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;
