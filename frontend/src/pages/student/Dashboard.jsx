import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
  Stack,
  Divider,
  Skeleton,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as SparkleIcon,
  TrendingUp as TrendingUpIcon,
  MenuBook as MenuBookIcon,
  AccountCircle as AccountCircleIcon,
  History as HistoryIcon,
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  FiberManualRecord as DotIcon,
  Explore as ExploreIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

/* ─── Color tokens ─────────────────────────────────── */
const C = {
  indigo: "#4f46e5",
  indigoDark: "#3730a3",
  indigoLight: "#eef2ff",
  rose: "#f43f5e",
  roseLight: "#fff1f2",
  emerald: "#10b981",
  emeraldLight: "#d1fae5",
  amber: "#f59e0b",
  amberLight: "#fef3c7",
  sky: "#0ea5e9",
  skyLight: "#e0f2fe",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate500: "#64748b",
  slate700: "#334155",
  slate900: "#0f172a",
};

/* ─── Stat Card Component ─────────────────────────── */
const StatCard = ({ icon, label, value, color, bg, loading }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: "18px",
      border: `1px solid ${C.slate200}`,
      bgcolor: "#fff",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      transition: "all 0.25s ease",
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: `0 12px 32px rgba(0,0,0,0.1)`,
      },
    }}
  >
    <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: "12px",
          bgcolor: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1.5,
          "& svg": { fontSize: 22, color },
        }}
      >
        {icon}
      </Box>
      {loading ? (
        <Skeleton width={50} height={36} />
      ) : (
        <Typography
          sx={{
            fontSize: "1.8rem",
            fontWeight: 900,
            color: C.slate900,
            lineHeight: 1,
            mb: 0.3,
          }}
        >
          {value}
        </Typography>
      )}
      <Typography
        variant="caption"
        sx={{ color: C.slate500, fontWeight: 600, display: "block" }}
      >
        {label}
      </Typography>
    </CardContent>
  </Card>
);

/* ─── Quick Link Card Component ─────────────────── */
const QuickLink = ({ icon, title, desc, color, onClick }) => (
  <Card
    elevation={0}
    onClick={onClick}
    sx={{
      borderRadius: "16px",
      border: `1px solid ${C.slate200}`,
      bgcolor: "#fff",
      cursor: "pointer",
      transition: "all 0.25s ease",
      "&:hover": {
        borderColor: color,
        transform: "translateY(-4px)",
        boxShadow: `0 10px 28px ${color}25`,
        "& .ql-arrow": { opacity: 1, transform: "translateX(0)" },
      },
    }}
  >
    <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "12px",
            bgcolor: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "& svg": { fontSize: 22, color },
          }}
        >
          {icon}
        </Box>
        <ArrowIcon
          className="ql-arrow"
          sx={{
            color,
            fontSize: 20,
            opacity: 0,
            transform: "translateX(-4px)",
            transition: "all 0.2s ease",
          }}
        />
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: C.slate900, mb: 0.3 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: C.slate500, fontWeight: 500 }}>
        {desc}
      </Typography>
    </CardContent>
  </Card>
);

/* ─── Info Row ───────────────────────────────────── */
const InfoRow = ({ icon, label, value }) => (
  <Box display="flex" alignItems="center" gap={1.5} py={1}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "8px",
        bgcolor: C.slate100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        "& svg": { fontSize: 16, color: C.slate500 },
      }}
    >
      {icon}
    </Box>
    <Box flexGrow={1} minWidth={0}>
      <Typography variant="caption" sx={{ color: C.slate500, fontWeight: 500, display: "block" }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: C.slate700,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);

/* ─── Main Page ──────────────────────────────────── */
const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    currentTopic: null,
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
        statistics: statsRes.data.data || {},
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Chào buổi sáng ☀️";
    if (h < 18) return "Chào buổi chiều 🌤️";
    return "Chào buổi tối 🌙";
  };

  const stats = [
    {
      label: "Đề tài đăng ký",
      value: dashboardData.statistics?.registered_topics ?? 0,
      icon: <AssignmentIcon />,
      color: C.indigo,
      bg: C.indigoLight,
    },
    {
      label: "Mốc hoàn thành",
      value: dashboardData.statistics?.completed_milestones ?? 0,
      icon: <CheckCircleIcon />,
      color: C.emerald,
      bg: C.emeraldLight,
    },
    {
      label: "Tiến độ",
      value: `${dashboardData.statistics?.progress_percentage ?? 0}%`,
      icon: <TrendingUpIcon />,
      color: C.amber,
      bg: C.amberLight,
    },
    {
      label: "Tổng đề tài hệ thống",
      value: dashboardData.statistics?.total_topics ?? 0,
      icon: <MenuBookIcon />,
      color: C.sky,
      bg: C.skyLight,
    },
  ];

  const quickLinks = [
    {
      title: "Danh sách đề tài",
      desc: "Khám phá & đăng ký",
      path: "/student/topics",
      icon: <ExploreIcon />,
      color: C.indigo,
    },
    {
      title: "Tiến độ đề tài",
      desc: "Cập nhật tiến trình",
      path: "/student/progress",
      icon: <TrendingUpIcon />,
      color: C.emerald,
    },
    {
      title: "Lịch sử đăng ký",
      desc: "Đề tài đã đăng ký",
      path: "/student/registration-history",
      icon: <HistoryIcon />,
      color: C.amber,
    },
    {
      title: "Bảng điểm",
      desc: "Kết quả đánh giá",
      path: "/student/grades",
      icon: <TrophyIcon />,
      color: C.rose,
    },
  ];

  const topic = dashboardData.currentTopic;
  const myStatus = topic?.my_status || topic?.topic_teacher_status;

  const topicStatusLabel =
    myStatus === "approved"
      ? "Đang thực hiện"
      : myStatus === "pending"
      ? "Chờ duyệt"
      : "Chờ duyệt";

  const topicStatusColor =
    myStatus === "approved" ? C.emerald : C.amber;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: C.slate50, pb: 8 }}>
      {/* ── HERO HEADER ─────────────────────────────────── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${C.indigoDark} 0%, ${C.indigo} 60%, #818cf8 100%)`,
          pt: { xs: 4, md: 5 },
          pb: { xs: 9, md: 10 },
          px: { xs: 3, md: 5 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        {[
          { top: -80, right: -80, size: 280, opacity: 0.07 },
          { top: 40, right: 200, size: 100, opacity: 0.06 },
          { bottom: -100, left: -60, size: 320, opacity: 0.06 },
        ].map((b, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              top: b.top,
              bottom: b.bottom,
              right: b.right,
              left: b.left,
              width: b.size,
              height: b.size,
              borderRadius: "50%",
              bgcolor: "white",
              opacity: b.opacity,
              pointerEvents: "none",
            }}
          />
        ))}

        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={user?.user_avatar}
              sx={{
                width: 68,
                height: 68,
                border: "3px solid rgba(255,255,255,0.4)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                bgcolor: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontSize: "1.7rem",
                fontWeight: 900,
              }}
            >
              {user?.user_name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600, mb: 0.3 }}
              >
                {greet()}
              </Typography>
              <Typography
                variant="h5"
                sx={{ color: "#fff", fontWeight: 900, lineHeight: 1.2 }}
              >
                {user?.user_name || "Sinh viên"}
              </Typography>
              <Stack direction="row" spacing={1} mt={0.8}>
                <Chip
                  label={user?.user_id || "—"}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.18)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    height: 22,
                  }}
                />
                {user?.user_major?.major_title && (
                  <Chip
                    label={user.user_major.major_title}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.85)",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 22,
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* ── STATS ROW (overlapping hero) ──────────────── */}
      <Box
        sx={{
          px: { xs: 2, md: 5 },
          mt: "-48px",
          position: "relative",
          zIndex: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        {stats.map((s, i) => (
          <StatCard key={i} {...s} loading={loading} />
        ))}
      </Box>

      {/* ── MAIN CONTENT ──────────────────────────────── */}
      <Box
        sx={{
          px: { xs: 2, md: 5 },
          mt: 4,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" },
          gap: 3,
        }}
      >
        {/* ──── LEFT COLUMN ─────────────────────────── */}
        <Stack spacing={3}>
          {/* Current Topic Banner */}
          {topic ? (
            <Card
              elevation={0}
              sx={{
                borderRadius: "20px",
                background: `linear-gradient(135deg, ${C.indigo} 0%, ${C.indigoDark} 100%)`,
                color: "#fff",
                overflow: "hidden",
                position: "relative",
                boxShadow: `0 16px 48px ${C.indigo}40`,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -60,
                  right: -60,
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.05)",
                }}
              />
              <CardContent sx={{ p: { xs: 3, md: 4 }, position: "relative", zIndex: 2 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  mb={2}
                >
                  <Chip
                    icon={<DotIcon sx={{ fontSize: "10px !important", color: `${topicStatusColor} !important` }} />}
                    label={topicStatusLabel}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                    }}
                  />
                  <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 500 }}>
                    Đề tài đang theo dõi
                  </Typography>
                </Stack>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, mb: 1, lineHeight: 1.35 }}
                >
                  {topic.topic_title}
                </Typography>

                {topic.topic_instructor?.user_name && (
                  <Typography sx={{ opacity: 0.75, fontSize: "0.875rem", mb: 2.5 }}>
                    Giảng viên hướng dẫn: <strong>{topic.topic_instructor.user_name}</strong>
                  </Typography>
                )}

                {/* Progress bar */}
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={0.8}>
                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.85 }}>
                      Tiến độ hoàn thành
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 900 }}>
                      {dashboardData.statistics?.progress_percentage ?? 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardData.statistics?.progress_percentage ?? 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "rgba(255,255,255,0.2)",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #a5f3fc, #ffffff)",
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/student/progress")}
                    sx={{
                      bgcolor: "#fff",
                      color: C.indigo,
                      fontWeight: 800,
                      borderRadius: "10px",
                      textTransform: "none",
                      px: 2.5,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#f0f0ff", boxShadow: "none" },
                    }}
                  >
                    Cập nhật tiến độ
                  </Button>
                  <Button
                    variant="outlined"
                    endIcon={<ArrowIcon />}
                    onClick={() => navigate("/student/my-topics")}
                    sx={{
                      borderColor: "rgba(255,255,255,0.4)",
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: "10px",
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "#fff",
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Chi tiết
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            /* No topic CTA */
            <Card
              elevation={0}
              sx={{
                borderRadius: "20px",
                border: `2px dashed ${C.slate200}`,
                bgcolor: "#fff",
                boxShadow: "none",
                textAlign: "center",
              }}
            >
              <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "20px",
                    bgcolor: C.indigoLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2.5,
                    "& svg": { fontSize: 36, color: C.indigo },
                  }}
                >
                  <ExploreIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: C.slate900, mb: 1 }}>
                  Bạn chưa có đề tài nào
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: C.slate500, mb: 3, maxWidth: 380, mx: "auto", lineHeight: 1.7 }}
                >
                  Hãy tìm một đề tài phù hợp và bắt đầu hành trình nghiên cứu của bạn!
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowIcon />}
                  onClick={() => navigate("/student/topics")}
                  sx={{
                    bgcolor: C.indigo,
                    color: "#fff",
                    fontWeight: 800,
                    borderRadius: "12px",
                    textTransform: "none",
                    px: 3.5,
                    py: 1.3,
                    boxShadow: `0 8px 24px ${C.indigo}40`,
                    "&:hover": { bgcolor: C.indigoDark },
                  }}
                >
                  Khám phá đề tài ngay
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                color: C.slate900,
                mb: 2,
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SparkleIcon sx={{ color: C.amber, fontSize: 20 }} />
              Truy cập nhanh
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                gap: 2,
              }}
            >
              {quickLinks.map((link, i) => (
                <QuickLink
                  key={i}
                  {...link}
                  onClick={() => navigate(link.path)}
                />
              ))}
            </Box>
          </Box>

          {/* Motivational Note */}
          <Card
            elevation={0}
            sx={{
              borderRadius: "18px",
              background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
              border: `1px solid #fde68a`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "14px",
                    bgcolor: "#fef08a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <TrophyIcon sx={{ color: "#d97706", fontSize: 26 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#92400e", mb: 0.3 }}>
                    Câu nói truyền cảm hứng 💪
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#b45309", fontStyle: "italic", lineHeight: 1.6 }}>
                    "Thành công không phải là chìa khóa của hạnh phúc. Hạnh phúc là chìa khóa của thành công."
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* ──── RIGHT SIDEBAR ────────────────────────── */}
        <Stack spacing={3}>
          {/* Profile Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: "20px",
              border: `1px solid ${C.slate200}`,
              bgcolor: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
              {/* Avatar + Name */}
              <Box textAlign="center" mb={2.5}>
                <Avatar
                  src={user?.user_avatar}
                  sx={{
                    width: 72,
                    height: 72,
                    background: `linear-gradient(135deg, ${C.indigo}, #818cf8)`,
                    fontWeight: 900,
                    fontSize: "1.8rem",
                    color: "#fff",
                    mx: "auto",
                    mb: 1.5,
                    boxShadow: "0 6px 20px rgba(79,70,229,0.3)",
                  }}
                >
                  {user?.user_name?.charAt(0)}
                </Avatar>
                <Typography sx={{ fontWeight: 900, color: C.slate900, fontSize: "1rem" }}>
                  {user?.user_name}
                </Typography>
                <Typography variant="caption" sx={{ color: C.slate500, fontWeight: 600 }}>
                  Sinh viên
                </Typography>
              </Box>

              <Divider sx={{ mb: 2, borderColor: C.slate100 }} />

              {/* Info rows */}
              <Stack spacing={0.5}>
                <InfoRow icon={<BadgeIcon />} label="Mã sinh viên" value={user?.user_id} />
                <InfoRow icon={<EmailIcon />} label="Email" value={user?.email} />
                <InfoRow
                  icon={<SchoolIcon />}
                  label="Chuyên ngành"
                  value={user?.user_major?.major_title || user?.user_major}
                />
                <InfoRow
                  icon={<AccountCircleIcon />}
                  label="Lớp"
                  value={user?.user_class}
                />
              </Stack>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/profile")}
                sx={{
                  mt: 2.5,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: C.slate200,
                  color: C.indigo,
                  "&:hover": { bgcolor: C.indigoLight, borderColor: C.indigo },
                }}
              >
                Xem & chỉnh sửa hồ sơ
              </Button>
            </CardContent>
          </Card>

          {/* Topic Status Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: "20px",
              border: `1px solid ${C.slate200}`,
              bgcolor: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
              <Typography
                sx={{ fontWeight: 800, color: C.slate900, mb: 2, fontSize: "0.95rem" }}
              >
                📊 Trạng thái đề tài
              </Typography>

              {loading ? (
                <Stack spacing={1.5}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={36} sx={{ borderRadius: "8px" }} />
                  ))}
                </Stack>
              ) : topic ? (
                <Stack spacing={1.5}>
                  {[
                    {
                      label: "Trạng thái",
                      value: (
                        <Chip
                          size="small"
                          label={topicStatusLabel}
                          sx={{
                            bgcolor: `${topicStatusColor}18`,
                            color: topicStatusColor,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            height: 24,
                          }}
                        />
                      ),
                    },
                    {
                      label: "Giảng viên HD",
                      value: topic.topic_instructor?.user_name || "Chưa phân công",
                    },
                    {
                      label: "Tiến độ",
                      value: `${dashboardData.statistics?.progress_percentage ?? 0}%`,
                    },
                    {
                      label: "Thành viên",
                      value: `${topic.topic_group_student?.length ?? 0} / ${topic.topic_max_members ?? 1}`,
                    },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1}
                      sx={{
                        borderBottom: i < 3 ? `1px solid ${C.slate100}` : "none",
                      }}
                    >
                      <Typography variant="caption" sx={{ color: C.slate500, fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                      {typeof item.value === "string" ? (
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: C.slate700 }}
                        >
                          {item.value}
                        </Typography>
                      ) : (
                        item.value
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box
                  sx={{
                    py: 3,
                    textAlign: "center",
                    bgcolor: C.slate50,
                    borderRadius: "12px",
                    border: `1px dashed ${C.slate200}`,
                  }}
                >
                  <PendingIcon sx={{ color: C.slate500, fontSize: 32, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2" sx={{ color: C.slate500, fontWeight: 600 }}>
                    Chưa có đề tài
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
