import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Stack,
  Tooltip,
  Avatar,
  Paper,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Assignment as TopicIcon,
  School as TeacherIcon,
  Info as InfoIcon,
  EmojiObjects as IdeaIcon,
  CalendarMonth as DateIcon,
  ArrowForward as ArrowIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const MyTopics = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const primaryMain = theme.palette?.primary?.main || "#1976d2";

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  useEffect(() => {
    fetchMyTopics();
  }, []);

  const fetchMyTopics = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/student/my-topics");
      setTopics(response.data.data || []);
    } catch (error) {
      console.error("Fetch my topics error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách đề tài",
      );
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (topic) => {
    setSelectedTopic(topic);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedTopic(null);
  };

  const handleCancel = async (topicId) => {
    if (window.confirm("Bạn có chắc muốn hủy đăng ký đề tài này?")) {
      try {
        await axios.delete(`/api/student/topics/${topicId}/register`);
        toast.success("Hủy đăng ký đề tài thành công");
        fetchMyTopics();
      } catch {
        toast.error("Lỗi hủy đăng ký đề tài");
      }
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "warning",
        label: "Chờ duyệt",
        icon: <InfoIcon fontSize="small" />,
      },
      approved: {
        color: "success",
        label: "Đã duyệt",
        icon: <CheckCircleIcon fontSize="small" />,
      },
      rejected: {
        color: "error",
        label: "Từ chối",
        icon: <CancelIcon fontSize="small" />,
      },
      in_progress: {
        color: "info",
        label: "Đang thực hiện",
        icon: <TopicIcon fontSize="small" />,
      },
      completed: {
        color: "success",
        label: "Hoàn thành",
        icon: <CheckCircleIcon fontSize="small" />,
      },
    };
    return configs[status] || { color: "default", label: status, icon: null };
  };

  const glassCardSx = {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 15px 45px rgba(0, 0, 0, 0.08)",
      borderColor: alpha(primaryMain, 0.4),
    },
  };

  const headerGradientSx = {
    background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
    pt: 6,
    pb: 12,
    color: "white",
    borderRadius: { xs: 0, md: "0 0 32px 32px" },
    boxShadow: "0 10px 30px -10px rgba(37, 99, 235, 0.4)",
    mb: -6,
    position: "relative",
    zIndex: 0,
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4, px: 4 }}>
        <LinearProgress sx={{ borderRadius: 8, height: 6 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 6 }}>
      {/* Header */}
      <Box sx={headerGradientSx}>
        <Container maxWidth="xl">
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 1.5,
              letterSpacing: "-0.02em",
            }}
          >
            Đề tài của tôi 📚
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, fontWeight: 400, maxWidth: "600px" }}
          >
            Nơi lưu giữ và theo dõi hành trình nghiên cứu của bạn.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        {topics.length === 0 ? (
          <Paper
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: "32px",
              bgcolor: "transparent",
              border: "2px dashed #CBD5E1",
            }}
            elevation={0}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "#F1F5F9",
                mx: "auto",
                mb: 3,
              }}
            >
              <TopicIcon sx={{ fontSize: 50, color: "#94A3B8" }} />
            </Avatar>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "#1E293B", mb: 2 }}
            >
              Bạn chưa đăng ký đề tài nào
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#64748B", mb: 4, maxWidth: "450px", mx: "auto" }}
            >
              Hãy ghé thăm danh sách đề tài từ giảng viên hoặc tự mình đưa ra
              một ý tưởng tuyệt vời ngay hôm nay!
            </Typography>
            <Button
              onClick={() => navigate("/student/topics")}
              variant="contained"
              size="large"
              sx={{ borderRadius: "12px", px: 4, fontWeight: 700 }}
              endIcon={<ArrowIcon />}
            >
              Khám phá danh sách đề tài
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {topics.map((topic) => {
              const statusConfig = getStatusConfig(topic.status);
              return (
                <Grid item xs={12} md={6} key={topic._id}>
                  <Card sx={glassCardSx} elevation={0}>
                    <CardContent sx={{ p: 4 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        sx={{ mb: 2 }}
                      >
                        <Chip
                          label={statusConfig.label}
                          color={statusConfig.color}
                          sx={{ fontWeight: 700, borderRadius: "10px", px: 1 }}
                          size="small"
                        />
                        <Box>
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              onClick={() => handleViewDetail(topic)}
                              sx={{
                                color: theme.palette.primary.main,
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.05,
                                ),
                                mr: 1,
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {topic.status === "pending" && (
                            <Tooltip title="Hủy đăng ký">
                              <IconButton
                                onClick={() => handleCancel(topic._id)}
                                sx={{
                                  color: theme.palette.error.main,
                                  bgcolor: alpha(
                                    theme.palette.error.main,
                                    0.05,
                                  ),
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Stack>

                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          mb: 2,
                          color: "#0F172A",
                          lineHeight: 1.3,
                        }}
                      >
                        {topic.topic_title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748B",
                          mb: 4,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "60px",
                        }}
                      >
                        {topic.topic_description ||
                          topic.description ||
                          "Không có mô tả chi tiết cho đề tài này."}
                      </Typography>

                      <Divider sx={{ mb: 3, borderStyle: "dashed" }} />

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: alpha(
                                  theme.palette.secondary.main,
                                  0.1,
                                ),
                              }}
                            >
                              <TeacherIcon
                                sx={{
                                  fontSize: 18,
                                  color: theme.palette.secondary.main,
                                }}
                              />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ color: "#94A3B8", display: "block" }}
                              >
                                Giảng viên HD
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700 }}
                              >
                                {topic.teacher_name || "Chưa phân công"}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                              }}
                            >
                              <DateIcon
                                sx={{
                                  fontSize: 18,
                                  color: theme.palette.info.main,
                                }}
                              />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ color: "#94A3B8", display: "block" }}
                              >
                                Ngày đăng ký
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700 }}
                              >
                                {topic.start_date
                                  ? new Date(
                                      topic.start_date,
                                    ).toLocaleDateString("vi-VN")
                                  : "Hôm nay"}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Dynamic Detail Dialog */}
        <Dialog
          open={openDetail}
          onClose={handleCloseDetail}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: "28px", p: 2 },
          }}
        >
          <DialogTitle sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              Chi tiết đề tài 📋
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {selectedTopic && (
              <Stack spacing={4}>
                <Box sx={{ p: 4, bgcolor: "#F8FAFC", borderRadius: "20px" }}>
                  <Typography
                    variant="overline"
                    color="primary"
                    sx={{ fontWeight: 800 }}
                  >
                    Tên đề tài
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
                    {selectedTopic.topic_title}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 800, mb: 1 }}
                  >
                    📚 Mô tả chi tiết
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#475569", lineHeight: 1.6 }}
                  >
                    {selectedTopic.topic_description ||
                      selectedTopic.description}
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 3,
                        border: "1px solid #E2E8F0",
                        borderRadius: "16px",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Trạng thái
                      </Typography>
                      <Chip
                        label={getStatusLabel(selectedTopic.status)}
                        color={getStatusColor(selectedTopic.status)}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 3,
                        border: "1px solid #E2E8F0",
                        borderRadius: "16px",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Giảng viên hướng dẫn
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {selectedTopic.teacher_name || "Chưa phân công"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleCloseDetail}
              variant="outlined"
              sx={{ borderRadius: "10px", px: 4 }}
            >
              Đóng
            </Button>
            <Button
              onClick={() => {
                handleCloseDetail();
                navigate("/student/progress");
              }}
              variant="contained"
              sx={{ borderRadius: "10px", px: 4 }}
            >
              Theo dõi tiến độ
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

// Helper components internal to this file to avoid extra imports if not needed
const CheckCircleIcon = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
      fill="currentColor"
    />
  </svg>
);

const getStatusColor = (status) => {
  const colors = {
    pending: "warning",
    approved: "success",
    rejected: "error",
    in_progress: "info",
    completed: "success",
  };
  return colors[status] || "default";
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
    in_progress: "Đang thực hiện",
    completed: "Hoàn thành",
  };
  return labels[status] || status;
};

export default MyTopics;
