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
  primary: "#0ea5e9",
  primaryDk: "#0369a1",
  teal: "#14b8a6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  violet: "#8b5cf6",
  slate: "#64748b",
};

const alpha = (hex, op) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${op})`;
};

// ─────────────────────────────────────────────────────────────────
const SectionCard = ({ children, sx = {} }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: "20px",
      background: "#fff",
      border: "1px solid #e2e8f0",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.25s",
      "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.09)" },
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
    if (h < 12) return { text: "Chào buổi sáng", emoji: "🌤️" };
    if (h < 18) return { text: "Chào buổi chiều", emoji: "☀️" };
    return { text: "Chào buổi tối", emoji: "🌙" };
  };

  const greeting = greet();

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
          "linear-gradient(160deg,#f0f9ff 0%,#f8fafc 60%,#fdf4ff 100%)",
        pb: 6,
      }}
    >
      {/* ╔══════════════════  HERO HEADER  ══════════════════════╗ */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${C.primaryDk} 0%, ${C.primary} 50%, ${C.teal} 100%)`,
          pt: { xs: 3, md: 4 },
          pb: { xs: 3, md: 4 },
          px: { xs: 2, md: 5 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative blobs */}
        {[
          { top: -60, right: -60, sz: 220, op: 0.08 },
          { top: 30, right: 180, sz: 100, op: 0.06 },
          { bottom: -80, left: -40, sz: 260, op: 0.07 },
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
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {/* Greeting */}
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar
                src={user?.user_avatar}
                sx={{
                  width: 68,
                  height: 68,
                  border: "3px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  background: "linear-gradient(135deg,#fff 0%,#cffafe 100%)",
                  color: C.primaryDk,
                  flexShrink: 0,
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
                  {greeting.text} {greeting.emoji}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#fff",
                    fontWeight: 900,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  {user?.user_name || "Giảng viên"}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 0.8 }}
                  flexWrap="wrap"
                >
                  <Chip
                    label={user?.user_id}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: "8px",
                      fontSize: "0.7rem",
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
                      fontSize: "0.7rem",
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
                py: 1.2,
                fontSize: "0.9rem",
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                "&:hover": {
                  bgcolor: "#f0f9ff",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.2)",
                },
                transition: "all 0.25s",
              }}
            >
              Tạo đề tài mới
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ╔═════════════  STATS ROW  ════════════════════════════╗ */}
      <Box sx={{ px: { xs: 2, md: 5 }, pt: 3 }}>
        <Grid container spacing={2}>
          {statCards.map((s, i) => (
            <Grid item xs={6} sm={4} md={2} key={i}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "18px",
                  background: "#fff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  border: "1px solid #f1f5f9",
                  transition: "all 0.25s",
                  height: "100%",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: `0 10px 32px ${alpha(s.color, 0.15)}`,
                    borderColor: alpha(s.color, 0.3),
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ mb: 1.5 }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "12px",
                        bgcolor: s.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        "& svg": { fontSize: 20, color: s.color },
                      }}
                    >
                      {s.icon}
                    </Box>
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: "1.8rem",
                      fontWeight: 900,
                      color: "#0f172a",
                      lineHeight: 1,
                      mb: 0.5,
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      fontWeight: 600,
                      display: "block",
                      lineHeight: 1.3,
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
      <Box sx={{ px: { xs: 2, md: 5 }, mt: 3 }}>
        <Grid container spacing={3} alignItems="flex-start">
          {/* ┌ LEFT COLUMN ─────────────────────────────────────┐ */}
          <Grid item xs={12} lg={7}>
            <Stack spacing={3}>
              {/* Quick Actions */}
              <SectionCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: "#1e293b",
                      mb: 2.5,
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                    }}
                  >
                    <BoltIcon sx={{ color: C.amber, fontSize: 22 }} />
                    Thao tác nhanh
                  </Typography>
                  <Grid container spacing={1.5}>
                    {quickActions.map((a, i) => (
                      <Grid item xs={4} sm={4} key={i}>
                        <Box
                          onClick={() => navigate(a.path)}
                          sx={{
                            borderRadius: "16px",
                            border: `1.5px solid ${alpha(a.color, 0.15)}`,
                            background: alpha(a.color, 0.04),
                            cursor: "pointer",
                            transition: "all 0.22s",
                            p: 2,
                            textAlign: "center",
                            "&:hover": {
                              background: alpha(a.color, 0.1),
                              borderColor: alpha(a.color, 0.4),
                              transform: "translateY(-3px)",
                              boxShadow: `0 8px 24px ${alpha(a.color, 0.2)}`,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: "14px",
                              bgcolor: alpha(a.color, 0.12),
                              mx: "auto",
                              mb: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              "& svg": { fontSize: 24, color: a.color },
                            }}
                          >
                            {a.icon}
                          </Box>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.78rem",
                              color: "#1e293b",
                              lineHeight: 1.3,
                            }}
                          >
                            {a.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </SectionCard>

              {/* Pending Topics */}
              <SectionCard>
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
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                      }}
                    >
                      <PendingIcon sx={{ color: C.amber, fontSize: 22 }} />
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
                        borderRadius: "10px",
                        "&:hover": { bgcolor: alpha(C.primary, 0.08) },
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
                            borderRadius: "14px",
                            cursor: "pointer",
                            background:
                              "linear-gradient(135deg,#fffbeb,#fef3c7)",
                            border: "1px solid #fde68a",
                            transition: "0.22s",
                            "&:hover": {
                              transform: "translateX(5px)",
                              boxShadow: `0 4px 16px ${alpha(C.amber, 0.2)}`,
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
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
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
                                flexShrink: 0,
                              }}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 5 }}>
                      <CheckCircleIcon
                        sx={{ fontSize: 44, color: "#d1fae5", mb: 1.5 }}
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
              </SectionCard>

              {/* Pending Registrations */}
              <SectionCard>
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
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                      }}
                    >
                      <GroupIcon sx={{ color: C.violet, fontSize: 22 }} />
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
                        borderRadius: "10px",
                        "&:hover": { bgcolor: alpha(C.primary, 0.08) },
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
                              borderRadius: "14px",
                              cursor: "pointer",
                              background:
                                "linear-gradient(135deg,#f5f3ff,#ede9fe)",
                              border: "1px solid #ddd6fe",
                              transition: "0.22s",
                              "&:hover": {
                                transform: "translateX(5px)",
                                boxShadow: `0 4px 16px ${alpha(C.violet, 0.2)}`,
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
                                  flexShrink: 0,
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
                                  sx={{
                                    color: "#7c3aed",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    display: "block",
                                  }}
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
                                  flexShrink: 0,
                                }}
                              />
                            </Stack>
                          </Box>
                        ))}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 5 }}>
                      <GroupIcon
                        sx={{ fontSize: 44, color: "#e9d5ff", mb: 1.5 }}
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
              </SectionCard>
            </Stack>
          </Grid>

          {/* ┌ RIGHT SIDEBAR ───────────────────────────────────┐ */}
          <Grid item xs={12} lg={5}>
            <Stack spacing={3}>
              {/* Profile Summary */}
              <SectionCard>
                <CardContent sx={{ p: 3 }}>
                  {/* Profile header */}
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2.5 }}
                  >
                    <Avatar
                      src={user?.user_avatar}
                      sx={{
                        width: 52,
                        height: 52,
                        background: `linear-gradient(135deg,${C.primary},${C.teal})`,
                        fontWeight: 900,
                        fontSize: "1.3rem",
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {user?.user_name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#0f172a",
                          fontSize: "1rem",
                        }}
                      >
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

                  {/* Stats row */}
                  <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                    {[
                      {
                        label: "Đang HD",
                        value: dashboardData.stats.my_guided || 0,
                        color: C.primary,
                        bg: "#e0f2fe",
                      },
                      {
                        label: "Hoàn thành",
                        value: dashboardData.stats.completed || 0,
                        color: C.emerald,
                        bg: "#d1fae5",
                      },
                      {
                        label: "Tỷ lệ HT",
                        value: `${completionRate}%`,
                        color: C.amber,
                        bg: "#fef3c7",
                      },
                    ].map((s, i) => (
                      <Grid item xs={4} key={i}>
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 1.5,
                            borderRadius: "14px",
                            bgcolor: s.bg,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "1.4rem",
                              fontWeight: 900,
                              color: s.color,
                              lineHeight: 1,
                              mb: 0.4,
                            }}
                          >
                            {s.value}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              fontWeight: 600,
                              display: "block",
                            }}
                          >
                            {s.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Completion bar */}
                  <Box>
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
                          background: `linear-gradient(90deg, ${C.primary}, ${C.teal})`,
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </SectionCard>

              {/* Upcoming Defenses */}
              <SectionCard>
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
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                      }}
                    >
                      <ScheduleIcon sx={{ color: C.teal, fontSize: 22 }} />
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
                            borderRadius: "14px",
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
                              <TimeIcon sx={{ fontSize: 13, color: C.slate }} />
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
                              <RoomIcon sx={{ fontSize: 13, color: C.slate }} />
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
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <ScheduleIcon
                        sx={{ fontSize: 44, color: "#ccfbf1", mb: 1.5 }}
                      />
                      <Typography
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          fontSize: "0.88rem",
                        }}
                      >
                        Chưa có lịch bảo vệ nào
                      </Typography>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      mt: 2.5,
                      fontWeight: 700,
                      borderRadius: "12px",
                      textTransform: "none",
                      color: C.teal,
                      borderColor: alpha(C.teal, 0.3),
                      "&:hover": {
                        bgcolor: alpha(C.teal, 0.06),
                        borderColor: C.teal,
                      },
                    }}
                  >
                    Xem lịch đầy đủ
                  </Button>
                </CardContent>
              </SectionCard>

              {/* Recent Activities */}
              <SectionCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "1rem",
                      color: "#1e293b",
                      mb: 2.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                    }}
                  >
                    <NotificationsIcon sx={{ color: C.rose, fontSize: 22 }} />
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
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <NotificationsIcon
                        sx={{ fontSize: 44, color: "#fecdd3", mb: 1.5 }}
                      />
                      <Typography
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          fontSize: "0.88rem",
                        }}
                      >
                        Chưa có hoạt động nào gần đây
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </SectionCard>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;
