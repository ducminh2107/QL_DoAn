import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Stack,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";

// SAFE IMPORTS
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";
import ExploreIcon from "@mui/icons-material/Explore";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const TopicsPage = () => {
  console.log("🚀 TopicsPage Component is rendering (Revised Mode)...");
  const navigate = useNavigate();
  const theme = useTheme();

  // Mảng màu an toàn
  const primaryMain = theme.palette?.primary?.main || "#1976d2";
  const successMain = theme.palette?.success?.main || "#2e7d32";
  const warningMain = theme.palette?.warning?.main || "#ed6c02";
  const errorMain = theme.palette?.error?.main || "#d32f2f";

  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [apiMessage, setApiMessage] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    instructor: "",
    page: 1,
    limit: 6,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [registerDialog, setRegisterDialog] = useState({
    open: false,
    topic: null,
  });
  const [hasApprovedTopic, setHasApprovedTopic] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadTopics();
    loadFilters();
  }, [filters.page, filters.search, filters.category, filters.instructor]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
      });
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.instructor) params.append("instructor", filters.instructor);

      const response = await axios.get(`/api/student/topics?${params}`);
      const data = response.data.data || [];
      setTopics(data);
      setHasApprovedTopic(response.data.has_approved_topic || false);
      setApiMessage(response.data.message || "");
      setPagination(
        response.data.pagination || { page: 1, totalPages: 1, total: 0 },
      );
    } catch (error) {
      console.error("Failed to load topics:", error);
      toast.error("Không thể tải danh sách đề tài");
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const categoriesRes = await axios.get("/api/topic-categories");
      const cats = categoriesRes.data.data || categoriesRes.data || [];
      setCategories(Array.isArray(cats) ? cats : []);

      const instructorsRes = await axios.get("/api/users/teachers");
      const instructs = instructorsRes.data.data || instructorsRes.data || [];
      setInstructors(Array.isArray(instructs) ? instructs : []);
    } catch (error) {
      console.error("Failed to load filters:", error);
    }
  };

  const handleRegister = async () => {
    try {
      const topic = registerDialog.topic;
      if (!topic) return;

      await axios.post(`/api/student/topics/${topic._id}/register`);
      toast.success("Đã gửi yêu cầu đăng ký. Chờ giảng viên duyệt.");
      setRegisterDialog({ open: false, topic: null });
      loadTopics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  const handlePageChange = (event, value) => {
    setFilters((prev) => ({ ...prev, page: value }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const headerGradientSx = {
    background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
    pt: 6,
    pb: 12,
    color: "white",
    borderRadius: { xs: 0, md: "0 0 32px 32px" },
    boxShadow: "0 10px 30px -10px rgba(37, 99, 235, 0.4)",
    mb: -8,
    position: "relative",
    zIndex: 0,
  };

  const topicCardSx = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: "20px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    transition: "transform 0.3s, box-shadow 0.3s",
    bgcolor: "white",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      borderColor: alpha(primaryMain, 0.4),
    },
  };

  const statusBadgeSx = (status) => ({
    position: "absolute",
    top: 16,
    right: 16,
    px: 2,
    py: 0.75,
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    bgcolor:
      status === "approved" ? alpha(successMain, 0.1) : alpha(warningMain, 0.1),
    color: status === "approved" ? successMain : warningMain,
    border: `1px solid ${status === "approved" ? alpha(successMain, 0.3) : alpha(warningMain, 0.3)}`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 8 }}>
      {/* Header */}
      <Box sx={headerGradientSx}>
        <Container maxWidth="xl">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
          >
            <Box>
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
                <ExploreIcon sx={{ fontSize: "3.5rem", opacity: 0.9 }} />
                Danh sách đề tài
              </Typography>
              <Typography
                variant="h6"
                sx={{ opacity: 0.9, fontWeight: 400, maxWidth: "600px" }}
              >
                Khám phá {pagination.total} đề tài nghiên cứu đang mở đăng ký
                ngay hôm nay.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/student/topics/propose")}
              sx={{
                bgcolor: "white",
                color: "#2563eb",
                borderRadius: "12px",
                fontWeight: 800,
                px: 3,
                py: 1.5,
                textTransform: "none",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                display: { xs: "none", md: "flex" },
                "&:hover": {
                  bgcolor: "#f8fafc",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Đề xuất tư tưởng mới
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 0 }}>
        {/* Filters */}
        <Paper
          sx={{
            p: 2,
            mb: 6,
            borderRadius: "16px",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.08)",
            bgcolor: "white",
            border: "1px solid #f1f5f9",
            position: "relative",
            zIndex: 1,
            mt: -4,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm tên đề tài..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "12px",
                    bgcolor: "#f8fafc",
                    "& fieldset": { border: "none" },
                    "&:hover": { bgcolor: "#f1f5f9" },
                    transition: "all 0.2s",
                  },
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth sx={{ minWidth: 140 }}>
                <InputLabel sx={{ color: "#64748b", fontWeight: 500 }}>
                  Danh mục
                </InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  label="Danh mục"
                  sx={{
                    borderRadius: "12px",
                    bgcolor: "#f8fafc",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "#cbd5e1 !important" },
                  }}
                >
                  <MenuItem value="">Tất cả danh mục</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.topic_category_title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth sx={{ minWidth: 140 }}>
                <InputLabel sx={{ color: "#64748b", fontWeight: 500 }}>
                  Giảng viên
                </InputLabel>
                <Select
                  value={filters.instructor}
                  onChange={(e) =>
                    handleFilterChange("instructor", e.target.value)
                  }
                  label="Giảng viên"
                  sx={{
                    borderRadius: "12px",
                    bgcolor: "#f8fafc",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "#cbd5e1 !important" },
                  }}
                >
                  <MenuItem value="">Tất cả giảng viên</MenuItem>
                  {instructors.map((instructor) => (
                    <MenuItem key={instructor._id} value={instructor._id}>
                      {instructor.user_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2} display="flex" justifyContent="flex-end">
              <Button
                variant="text"
                startIcon={<FilterListIcon />}
                onClick={() =>
                  setFilters({
                    search: "",
                    category: "",
                    instructor: "",
                    page: 1,
                    limit: 6,
                  })
                }
                sx={{
                  borderRadius: "12px",
                  height: "56px",
                  width: "100%",
                  color: "#64748b",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "#eff6ff",
                    color: "#2563eb",
                  },
                }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            mb: 3,
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            size="large"
            onClick={() => navigate("/student/topics/propose")}
            sx={{
              borderRadius: "12px",
              bgcolor: "#2563eb",
              color: "white",
              fontWeight: 800,
              px: 3,
              py: 1.5,
              textTransform: "none",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              "&:hover": {
                bgcolor: "#1d4ed8",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Đề xuất tư tưởng mới
          </Button>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ width: "100%" }}>
            <LinearProgress
              sx={{
                borderRadius: 4,
                height: 6,
                mb: 6,
                bgcolor: "#e2e8f0",
                "& .MuiLinearProgress-bar": { bgcolor: "#3b82f6" },
              }}
            />
            <Grid container spacing={3}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} key={i}>
                  <Box
                    sx={{
                      height: 180,
                      bgcolor: "#e2e8f0",
                      borderRadius: "20px",
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : topics.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                bgcolor: "rgba(37,99,235,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 4,
              }}
            >
              <ExploreIcon
                sx={{ fontSize: 72, color: "#2563eb", opacity: 0.8 }}
              />
            </Box>
            <Typography
              variant="h4"
              fontWeight={800}
              color="#1e293b"
              gutterBottom
            >
              Chưa có đề tài nào mở đăng ký
            </Typography>
            <Typography
              variant="h6"
              color="#64748b"
              sx={{ maxWidth: 600, mx: "auto", mb: 4, fontWeight: 400 }}
            >
              {apiMessage
                ? apiMessage
                : "Rất tiếc, hiện tại không có đợt đăng ký hoặc không có thỏa mãn bộ lọc của bạn."}
            </Typography>
            <Button
              size="large"
              variant="outlined"
              onClick={() =>
                setFilters({
                  search: "",
                  category: "",
                  instructor: "",
                  page: 1,
                  limit: 6,
                })
              }
              sx={{
                borderRadius: "12px",
                borderWidth: "2px",
                fontWeight: 700,
                color: "#2563eb",
                borderColor: "#bfdbfe",
                px: 4,
                py: 1.5,
                "&:hover": {
                  borderWidth: "2px",
                  borderColor: "#2563eb",
                  bgcolor: "#eff6ff",
                },
              }}
            >
              Xóa bộ lọc và Thử lại
            </Button>
          </Box>
        ) : (
          <Box>
            <Grid container spacing={3} pb={4} alignItems="stretch">
              {topics.map((topic) => (
                <Grid
                  item
                  xs={12}
                  key={topic._id}
                  sx={{ display: "flex", width: "100%" }}
                >
                  <Card sx={{ ...topicCardSx, width: "100%" }} elevation={0}>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      {/* Status Badge */}
                      <Box sx={statusBadgeSx(topic.topic_teacher_status)}>
                        {topic.topic_teacher_status === "approved"
                          ? "MỞ ĐĂNG KÝ"
                          : "CHỜ DUYỆT"}
                      </Box>

                      {/* Category Tag */}
                      <Box mb={2}>
                        <Chip
                          icon={<CategoryIcon style={{ fontSize: 16 }} />}
                          label={
                            topic.topic_category?.topic_category_title || "Khác"
                          }
                          size="small"
                          sx={{
                            borderRadius: "8px",
                            bgcolor: alpha(primaryMain, 0.1),
                            color: primaryMain,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            border: "none",
                            height: "28px",
                          }}
                        />
                      </Box>

                      {/* Title */}
                      <Typography
                        variant="h5"
                        title={topic.topic_title}
                        sx={{
                          fontWeight: 700,
                          lineHeight: 1.4,
                          color: "#1e293b",
                          mb: 2,
                        }}
                      >
                        {topic.topic_title}
                      </Typography>

                      <DividerBox />

                      {/* Instructor Info */}
                      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: primaryMain,
                            fontWeight: 600,
                          }}
                        >
                          {topic.topic_instructor?.user_name?.charAt(0) || "G"}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="caption"
                            display="block"
                            color="#64748b"
                            fontWeight={500}
                          >
                            Giảng viên hướng dẫn
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="#334155"
                          >
                            {topic.topic_instructor?.user_name ||
                              "Chưa phân công"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Progress Bar */}
                      <Box
                        sx={{
                          bgcolor: "#f8fafc",
                          p: 2,
                          borderRadius: "12px",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={1}
                          alignItems="center"
                        >
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <GroupIcon
                              style={{ fontSize: 16, color: "#64748b" }}
                            />
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              color="#475569"
                            >
                              Đã đăng ký
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            color={
                              topic.has_available_slots
                                ? successMain
                                : errorMain
                            }
                          >
                            <span style={{ fontSize: "1rem" }}>
                              {topic.topic_group_student?.length || 0}
                            </span>
                            <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                              /{topic.topic_max_members}
                            </span>
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            ((topic.topic_group_student?.length || 0) /
                              topic.topic_max_members) *
                            100
                          }
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "#e2e8f0",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              bgcolor: topic.has_available_slots
                                ? "#0ea5e9"
                                : errorMain,
                            },
                          }}
                        />
                      </Box>
                    </CardContent>

                    {/* Actions Footer */}
                    <CardActions
                      sx={{
                        p: 2,
                        pt: 0,
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        variant="outlined"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate(`/student/topics/${topic._id}`)}
                        sx={{
                          textTransform: "none",
                          borderRadius: "8px",
                          fontWeight: 600,
                          color: primaryMain,
                          borderColor: alpha(primaryMain, 0.3),
                          "&:hover": {
                            bgcolor: alpha(primaryMain, 0.05),
                            borderColor: primaryMain,
                          },
                        }}
                      >
                        Chi tiết
                      </Button>

                      {hasApprovedTopic ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Đã chốt đề tài"
                          size="medium"
                          sx={{
                            borderRadius: "8px",
                            fontWeight: 600,
                            bgcolor: "#dcfce7",
                            color: "#15803d",
                            border: "1px solid #bbf7d0",
                          }}
                        />
                      ) : topic.student_registration_status?.is_member ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Đã tham gia"
                          size="medium"
                          color="success"
                          sx={{ borderRadius: "8px", fontWeight: 600 }}
                        />
                      ) : topic.student_registration_status?.has_pending_request ? (
                        <Chip
                          icon={<HourglassEmptyIcon />}
                          label="Đang chờ duyệt"
                          size="medium"
                          color="warning"
                          sx={{ borderRadius: "8px", fontWeight: 600 }}
                        />
                      ) : topic.has_available_slots ? (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setRegisterDialog({ open: true, topic })}
                          sx={{
                            borderRadius: "8px",
                            fontWeight: 600,
                            boxShadow: "none",
                            bgcolor: successMain,
                            "&:hover": { bgcolor: alpha(successMain, 0.9) },
                          }}
                        >
                          Đăng ký
                        </Button>
                      ) : (
                        <Chip
                          label="Đã đầy"
                          size="medium"
                          sx={{
                            borderRadius: "8px",
                            fontWeight: 600,
                            bgcolor: "#f1f5f9",
                            color: "#94a3b8",
                          }}
                        />
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination Component - Standard MUI */}
            {pagination.totalPages > 1 && (
              <Box display="flex" justifyContent="center" mb={6}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  size="large"
                />
              </Box>
            )}
          </Box>
        )}
      </Container>

      {/* Register Dialog */}
      <Dialog
        open={registerDialog.open}
        onClose={() => setRegisterDialog({ open: false, topic: null })}
        PaperProps={{ sx: { borderRadius: "16px", padding: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận đăng ký</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có muốn đăng ký tham gia đề tài:{" "}
            <b>{registerDialog.topic?.topic_title}</b>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setRegisterDialog({ open: false, topic: null })}
            sx={{ color: "#64748b", fontWeight: 600 }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleRegister}
            variant="contained"
            autoFocus
            sx={{
              borderRadius: "8px",
              fontWeight: 600,
              bgcolor: primaryMain,
              "&:hover": { bgcolor: alpha(primaryMain, 0.9) },
            }}
          >
            Đồng ý đăng ký
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper component for styled divider
const DividerBox = () => (
  <Box sx={{ height: "1px", bgcolor: "#f1f5f9", my: 2 }} />
);

export default TopicsPage;
