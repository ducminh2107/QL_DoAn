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
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
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

  // --- STYLES ---
  const headerGradientSx = {
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    pt: 6,
    pb: 12,
    color: "white",
    borderRadius: { xs: 0, md: "0 0 32px 32px" },
    boxShadow: "0 10px 30px -10px rgba(30, 58, 138, 0.4)",
    mb: -8,
    position: "relative",
    zIndex: 0,
  };

  const filterPaperSx = {
    p: 3,
    mb: 5,
    borderRadius: "20px",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
    bgcolor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    position: "relative",
    zIndex: 1,
  };

  const topicCardSx = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: "20px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
    bgcolor: "white",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      borderColor: "#93c5fd",
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
    bgcolor: status === "approved" ? "#ecfdf5" : "#fefce8",
    color: status === "approved" ? "#059669" : "#a16207",
    border: `1px solid ${status === "approved" ? "#a7f3d0" : "#fde047"}`,
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
                color: "#1e3a8a",
                borderRadius: "12px",
                fontWeight: 700,
                px: 3,
                py: 1.5,
                textTransform: "none",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                display: { xs: "none", md: "flex" },
                "&:hover": {
                  bgcolor: "#f8fafc",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Đề xuất đề tài mới
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 0 }}>
        {/* Filters */}
        <Paper sx={filterPaperSx}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm tên đề tài..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "12px",
                    bgcolor: "#f8fafc",
                    "& fieldset": { borderColor: "#e2e8f0" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  label="Danh mục"
                  sx={{ borderRadius: "12px", bgcolor: "#fff" }}
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
              <FormControl fullWidth>
                <InputLabel>Giảng viên</InputLabel>
                <Select
                  value={filters.instructor}
                  onChange={(e) =>
                    handleFilterChange("instructor", e.target.value)
                  }
                  label="Giảng viên"
                  sx={{ borderRadius: "12px", bgcolor: "#fff" }}
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
                variant="outlined"
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
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  textTransform: "none",
                  "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
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
            sx={{ borderRadius: "12px" }}
          >
            Đề xuất đề tài mới
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
                <Grid item xs={12} md={4} key={i}>
                  <Box
                    sx={{
                      height: 280,
                      bgcolor: "#e2e8f0",
                      borderRadius: "20px",
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : topics.length === 0 ? (
          <Paper
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: "24px",
              bgcolor: "white",
              boxShadow: "none",
              border: "1px dashed #e2e8f0",
            }}
          >
            <Box sx={{ mx: "auto", color: "#cbd5e1", mb: 2 }}>
              <HourglassEmptyIcon style={{ fontSize: 80, opacity: 0.5 }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight={700}
              color="#334155"
              gutterBottom
            >
              Không tìm thấy đề tài nào
            </Typography>
            <Typography color="#64748b">
              Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc xem sao.
            </Typography>
            <Button
              sx={{ mt: 3 }}
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
            >
              Xóa bộ lọc
            </Button>
          </Paper>
        ) : (
          <Box>
            <Grid container spacing={3} pb={4} alignItems="stretch">
              {topics.map((topic) => (
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={4}
                  key={topic._id}
                  sx={{ display: "flex" }}
                >
                  <Card sx={topicCardSx} elevation={0}>
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
                            bgcolor: "#eff6ff",
                            color: "#3b82f6",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            border: "none",
                            height: "28px",
                          }}
                        />
                      </Box>

                      {/* Title - Fixed Min Height for Alignment */}
                      <Typography
                        variant="h6"
                        title={topic.topic_title}
                        sx={{
                          fontWeight: 700,
                          lineHeight: 1.4,
                          color: "#1e293b",
                          mb: 2,
                          minHeight: "3.6em", // ~2.5 lines of text fixed height
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
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
                            bgcolor: "#3b82f6",
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
                              topic.has_available_slots ? "#16a34a" : "#dc2626"
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
                                ? "#3b82f6"
                                : "#ef4444",
                            },
                          }}
                        />
                      </Box>
                    </CardContent>

                    {/* Actions Footer */}
                    <CardActions
                      sx={{
                        p: 2,
                        px: 3,
                        pt: 0,
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        startIcon={<BlockIcon style={{ fontSize: 18 }} />} // Placeholder details icon
                        onClick={() => navigate(`/student/topics/${topic._id}`)}
                        sx={{
                          textTransform: "none",
                          color: "#64748b",
                          fontWeight: 600,
                          "&:hover": {
                            color: "#3b82f6",
                            bgcolor: "transparent",
                          },
                        }}
                      >
                        Chi tiết
                      </Button>

                      {topic.has_available_slots ? (
                        <Button
                          variant="contained"
                          disableElevation
                          onClick={() =>
                            setRegisterDialog({ open: true, topic })
                          }
                          endIcon={
                            <ArrowForwardIcon style={{ fontSize: 18 }} />
                          }
                          sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 700,
                            bgcolor: "#1e3a8a",
                            px: 3,
                            "&:hover": { bgcolor: "#1e293b" },
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
            sx={{ borderRadius: "8px", fontWeight: 600, bgcolor: "#1e3a8a" }}
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
