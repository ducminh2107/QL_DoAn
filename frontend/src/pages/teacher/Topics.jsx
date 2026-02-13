import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const TeacherTopics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    page: 0,
    rowsPerPage: 10,
  });
  const [total, setTotal] = useState(0);
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [categories, setCategories] = useState([]);
  const [majors, setMajors] = useState([]);
  const [registrationPeriods, setRegistrationPeriods] = useState([]);
  const [newTopic, setNewTopic] = useState({
    topic_title: "",
    topic_description: "",
    topic_category: "",
    topic_major: "",
    topic_registration_period: "",
    topic_max_members: 1,
    topic_advisor_request: "",
  });

  useEffect(() => {
    loadTopics();
    loadFilterData();
  }, [filters.status, filters.page, filters.search]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page + 1,
        limit: filters.rowsPerPage,
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      };

      // Add a cache-busting query param and request no-cache to avoid 304 cached responses
      params._ = Date.now();
      console.debug("Loading topics with params:", params);
      const response = await axios.get("/api/teacher/topics", {
        params,
        headers: { "Cache-Control": "no-cache" },
      });
      console.debug("Response from /api/teacher/topics:", response);
      setTopics(response.data.data || []);
      setStats(response.data.stats || {});
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to load topics:", error);
      toast.error("Không thể tải danh sách đề tài");
    } finally {
      setLoading(false);
    }
  };

  const loadFilterData = async () => {
    try {
      const [categoriesRes, majorsRes, periodsRes] = await Promise.all([
        axios.get("/api/topic-categories"),
        axios.get("/api/majors"),
        axios.get("/api/registration-periods"),
      ]);
      setCategories(categoriesRes.data.data || []);
      setMajors(majorsRes.data.data || []);
      const periods = periodsRes.data.data || [];
      setRegistrationPeriods(periods);
      // Auto-select active registration period if available
      const activePeriod = periods.find(
        (p) => p.registration_period_status === "active",
      );
      if (activePeriod) {
        setNewTopic((prev) => ({
          ...prev,
          topic_registration_period: activePeriod._id,
        }));
      }
    } catch (error) {
      console.error("Failed to load filter data:", error);
    }
  };

  const handleCreateTopic = async () => {
    try {
      const response = await axios.post("/api/teacher/topics", newTopic);
      toast.success("Tạo đề tài thành công");
      setCreateDialog(false);
      const activePeriod = registrationPeriods.find(
        (p) => p.registration_period_status === "active",
      );
      setNewTopic({
        topic_title: "",
        topic_description: "",
        topic_category: "",
        topic_major: "",
        topic_registration_period: activePeriod?._id || "",
        topic_max_members: 1,
        topic_advisor_request: "",
      });
      loadTopics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo đề tài thất bại");
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await axios.delete(`/api/teacher/topics/${topicId}`);
      toast.success("Đã xóa đề tài");
      setDeleteDialog(null);
      loadTopics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa đề tài thất bại");
    }
  };

  const getStatusChip = (topic) => {
    if (topic.is_completed) {
      return <Chip label="Hoàn thành" color="success" size="small" />;
    }
    if (topic.topic_teacher_status === "approved") {
      return <Chip label="Đã duyệt" color="success" size="small" />;
    }
    if (topic.topic_teacher_status === "pending") {
      return <Chip label="Chờ duyệt" color="warning" size="small" />;
    }
    if (topic.topic_teacher_status === "rejected") {
      return <Chip label="Từ chối" color="error" size="small" />;
    }
    return <Chip label="Cần sửa" color="info" size="small" />;
  };

  const handlePageChange = (event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    }));
  };

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
          📚 Quản lý đề tài của tôi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/teacher/topics/create")}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "#1e3a8a",
            "&:hover": { bgcolor: "#1e293b" },
          }}
        >
          Tạo đề tài mới
        </Button>
      </Box>

      {/* Empty state */}
      {!loading && topics.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="text.secondary">
            Không có đề tài nào để hiển thị.
          </Typography>
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h5" color="primary">
                {stats.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng đề tài
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h5" color="success.main">
                {stats.my_guided || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đang hướng dẫn
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h5" color="warning.main">
                {stats.pending_approval || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chờ duyệt
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h5" color="info.main">
                {stats.in_progress || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đang thực hiện
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h5" color="secondary.main">
                {stats.completed || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã hoàn thành
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h5" color="text.primary">
                {stats.my_created || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tôi tạo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm đề tài..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                  page: 0,
                }))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Lọc theo trạng thái</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                    page: 0,
                  }))
                }
                label="Lọc theo trạng thái"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="my_created">Tôi tạo</MenuItem>
                <MenuItem value="my_guided">Tôi hướng dẫn</MenuItem>
                <MenuItem value="pending_approval">Chờ duyệt</MenuItem>
                <MenuItem value="approved">Đã duyệt</MenuItem>
                <MenuItem value="in_progress">Đang thực hiện</MenuItem>
                <MenuItem value="completed">Hoàn thành</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Topics Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {loading ? (
          <LinearProgress />
        ) : topics.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy đề tài nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {filters.status !== "all" || filters.search
                ? "Thử thay đổi bộ lọc"
                : "Hãy tạo đề tài đầu tiên của bạn"}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Tiêu đề đề tài</TableCell>
                    <TableCell>Danh mục</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Sinh viên</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topics.map((topic) => (
                    <TableRow
                      key={topic._id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/teacher/topics/${topic._id}`)}
                    >
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          noWrap
                          sx={{ maxWidth: 300 }}
                        >
                          {topic.topic_title}
                        </Typography>
                        {topic.topic_creator?._id !==
                          topic.topic_instructor?._id && (
                          <Typography variant="caption" color="text.secondary">
                            Đề xuất bởi: {topic.topic_creator?.user_name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            topic.topic_category?.topic_category_title || "N/A"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{getStatusChip(topic)}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <GroupIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {topic.topic_group_student?.filter(
                              (s) => s.status === "approved",
                            ).length || 0}
                            /{topic.topic_max_members}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(topic.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/teacher/topics/${topic._id}`);
                            }}
                            title="Xem chi tiết"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {topic.topic_creator === topic.topic_instructor && (
                            <>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/teacher/topics/${topic._id}/edit`);
                                }}
                                title="Chỉnh sửa"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDialog(topic._id);
                                }}
                                title="Xóa"
                                disabled={topic.topic_group_student?.some(
                                  (s) => s.status === "approved",
                                )}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={filters.rowsPerPage}
              page={filters.page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} trong ${count}`
              }
            />
          </>
        )}
      </Paper>

      {/* Create Topic Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#1e3a8a", pb: 1 }}>
          🚀 Tạo đề tài nghiên cứu mới
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Điền các thông tin chi tiết để công bố đề tài cho sinh viên đăng ký.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề đề tài"
                placeholder="Nhập tiêu đề học thuật của đề tài..."
                value={newTopic.topic_title}
                onChange={(e) =>
                  setNewTopic((prev) => ({
                    ...prev,
                    topic_title: e.target.value,
                  }))
                }
                required
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả đề tài"
                placeholder="Chi tiết công nghệ, kỹ năng và mục tiêu..."
                multiline
                rows={4}
                value={newTopic.topic_description}
                onChange={(e) =>
                  setNewTopic((prev) => ({
                    ...prev,
                    topic_description: e.target.value,
                  }))
                }
                required
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Danh mục đề tài</InputLabel>
                <Select
                  value={newTopic.topic_category}
                  onChange={(e) =>
                    setNewTopic((prev) => ({
                      ...prev,
                      topic_category: e.target.value,
                    }))
                  }
                  label="Danh mục đề tài"
                  sx={{ borderRadius: "12px" }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.topic_category_title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Chuyên ngành phù hợp</InputLabel>
                <Select
                  value={newTopic.topic_major}
                  onChange={(e) =>
                    setNewTopic((prev) => ({
                      ...prev,
                      topic_major: e.target.value,
                    }))
                  }
                  label="Chuyên ngành phù hợp"
                  sx={{ borderRadius: "12px" }}
                >
                  <MenuItem value="">
                    <em>Tất cả chuyên ngành</em>
                  </MenuItem>
                  {majors.map((major) => (
                    <MenuItem key={major._id} value={major._id}>
                      {major.major_title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Kỳ đăng ký hiện tại</InputLabel>
                <Select
                  value={newTopic.topic_registration_period}
                  onChange={(e) =>
                    setNewTopic((prev) => ({
                      ...prev,
                      topic_registration_period: e.target.value,
                    }))
                  }
                  label="Kỳ đăng ký hiện tại"
                  sx={{ borderRadius: "12px" }}
                >
                  {registrationPeriods.map((period) => (
                    <MenuItem key={period._id} value={period._id}>
                      {period.registration_period_semester} (
                      {period.registration_period_status})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số sinh viên tối đa"
                type="number"
                value={newTopic.topic_max_members}
                onChange={(e) =>
                  setNewTopic((prev) => ({
                    ...prev,
                    topic_max_members: parseInt(e.target.value) || 1,
                  }))
                }
                inputProps={{ min: 1, max: 5 }}
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Yêu cầu / Ghi chú cho sinh viên"
                placeholder="Ví dụ: Ưu tiên sinh viên biết React, siêng năng..."
                multiline
                rows={2}
                value={newTopic.topic_advisor_request}
                onChange={(e) =>
                  setNewTopic((prev) => ({
                    ...prev,
                    topic_advisor_request: e.target.value,
                  }))
                }
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setCreateDialog(false)}
            sx={{ borderRadius: "10px", color: "#64748b" }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleCreateTopic}
            variant="contained"
            disabled={
              !newTopic.topic_title ||
              !newTopic.topic_description ||
              !newTopic.topic_category ||
              !newTopic.topic_registration_period
            }
            sx={{
              borderRadius: "10px",
              px: 4,
              bgcolor: "#1e3a8a",
              "&:hover": { bgcolor: "#1e293b" },
            }}
          >
            Tạo đề tài
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa đề tài này? Hành động này không thể hoàn
            tác.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Lưu ý: Không thể xóa đề tài đã có sinh viên được duyệt.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Hủy</Button>
          <Button
            onClick={() => handleDeleteTopic(deleteDialog)}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherTopics;
