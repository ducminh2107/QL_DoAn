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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const TopicsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    instructor: "",
    page: 1,
    limit: 9,
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
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.instructor && { instructor: filters.instructor }),
      });

      const response = await axios.get(`/api/student/topics?${params}`);
      setTopics(response.data.data || []);
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
      // Load categories
      const categoriesRes = await axios.get("/api/topic-categories");
      setCategories(categoriesRes.data.data || []);

      // Load instructors
      const instructorsRes = await axios.get("/api/users/teachers");
      setInstructors(instructorsRes.data.data || []);
    } catch (error) {
      console.error("Failed to load filters:", error);
    }
  };

  const handleRegister = async (topic) => {
    try {
      await axios.post(`/api/student/topics/${topic._id}/register`);
      toast.success("Đã gửi yêu cầu đăng ký. Chờ giảng viên duyệt.");
      setRegisterDialog({ open: false, topic: null });
      loadTopics(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  const handlePageChange = (event, value) => {
    setFilters((prev) => ({ ...prev, page: value }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  if (loading && topics.length === 0) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          📚 Danh sách đề tài
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/student/topics/propose")}
        >
          + Đề xuất đề tài mới
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm đề tài..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                label="Danh mục"
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                value={filters.instructor}
                onChange={(e) =>
                  handleFilterChange("instructor", e.target.value)
                }
                label="Giảng viên"
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
        </Grid>
      </Paper>

      {/* Results count */}
      <Typography variant="body1" color="text.secondary" mb={2}>
        Tìm thấy {pagination.total} đề tài
      </Typography>

      {/* Topics Grid */}
      {topics.length === 0 ? (
        <Alert severity="info">
          Không tìm thấy đề tài nào phù hợp với bộ lọc.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {topics.map((topic) => (
              <Grid item xs={12} md={6} lg={4} key={topic._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Topic Status */}
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Chip
                        label={
                          topic.topic_teacher_status === "approved"
                            ? "Đã duyệt"
                            : "Chờ duyệt"
                        }
                        color={
                          topic.topic_teacher_status === "approved"
                            ? "success"
                            : "warning"
                        }
                        size="small"
                      />
                      <Chip
                        icon={<GroupIcon />}
                        label={`${topic.topic_group_student?.length || 0}/${topic.topic_max_members}`}
                        color={topic.has_available_slots ? "primary" : "error"}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    {/* Topic Title */}
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {topic.topic_title}
                    </Typography>

                    {/* Topic Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {topic.topic_description.length > 150
                        ? `${topic.topic_description.substring(0, 150)}...`
                        : topic.topic_description}
                    </Typography>

                    {/* Topic Details */}
                    <Box mt={2}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CategoryIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "primary.main" }}
                        />
                        <Typography variant="body2">
                          {topic.topic_category?.topic_category_title ||
                            "Chưa phân loại"}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <PersonIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "primary.main" }}
                        />
                        <Typography variant="body2">
                          GV:{" "}
                          {topic.topic_instructor?.user_name ||
                            "Chưa phân công"}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <GroupIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "primary.main" }}
                        />
                        <Typography variant="body2">
                          Sinh viên:{" "}
                          {topic.topic_creator?.user_name || "Ẩn danh"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Registration Status */}
                    {topic.student_registration_status && (
                      <Box mt={2}>
                        {topic.student_registration_status === "approved" && (
                          <Chip
                            label="Đã tham gia"
                            color="success"
                            size="small"
                          />
                        )}
                        {topic.student_registration_status === "pending" && (
                          <Chip
                            label="Chờ duyệt"
                            color="warning"
                            size="small"
                          />
                        )}
                        {topic.student_registration_status === "rejected" && (
                          <Chip label="Đã từ chối" color="error" size="small" />
                        )}
                      </Box>
                    )}
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/student/topics/${topic._id}`)}
                    >
                      Xem chi tiết
                    </Button>

                    {topic.student_registration_status === "not_registered" &&
                      topic.has_available_slots && (
                        <Button
                          size="small"
                          color="primary"
                          onClick={() =>
                            setRegisterDialog({ open: true, topic })
                          }
                        >
                          Đăng ký
                        </Button>
                      )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Registration Dialog */}
      <Dialog
        open={registerDialog.open}
        onClose={() => setRegisterDialog({ open: false, topic: null })}
      >
        <DialogTitle>Xác nhận đăng ký</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Bạn có chắc chắn muốn đăng ký đề tài:
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            {registerDialog.topic?.topic_title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Giảng viên:{" "}
            {registerDialog.topic?.topic_instructor?.user_name ||
              "Chưa phân công"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Số lượng: {registerDialog.topic?.topic_group_student?.length || 0}
            /{registerDialog.topic?.topic_max_members}
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Yêu cầu đăng ký của bạn sẽ được gửi đến giảng viên để duyệt.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRegisterDialog({ open: false, topic: null })}
          >
            Hủy
          </Button>
          <Button
            onClick={() => handleRegister(registerDialog.topic)}
            variant="contained"
            color="primary"
          >
            Xác nhận đăng ký
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TopicsPage;
