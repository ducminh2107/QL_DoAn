import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
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
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Done as DoneIcon,
  Create as CreateIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  approved: {
    label: "Đã duyệt",
    bgcolor: "#dcfce7",
    color: "#15803d",
    dot: "#22c55e",
  },
  pending_khoa: {
    label: "Chờ Khoa duyệt",
    bgcolor: "#fef9c3",
    color: "#a16207",
    dot: "#eab308",
  },
  pending_gv: {
    label: "Chờ GV duyệt",
    bgcolor: "#fef9c3",
    color: "#a16207",
    dot: "#eab308",
  },
  rejected: {
    label: "Từ chối",
    bgcolor: "#fee2e2",
    color: "#dc2626",
    dot: "#ef4444",
  },
  need_revision: {
    label: "Cần sửa",
    bgcolor: "#e0f2fe",
    color: "#0369a1",
    dot: "#0ea5e9",
  },
  completed: {
    label: "Hoàn thành",
    bgcolor: "#f0fdf4",
    color: "#166534",
    dot: "#16a34a",
  },
};

const StatusBadge = ({ topic }) => {
  let key = "pending_khoa";
  if (topic.is_completed) {
    key = "completed";
  } else if (
    topic.topic_teacher_status === "rejected" ||
    topic.topic_leader_status === "rejected"
  ) {
    key = "rejected";
  } else if (topic.topic_teacher_status === "pending") {
    key = "pending_gv";
  } else if (
    topic.topic_teacher_status === "approved" &&
    topic.topic_leader_status === "pending"
  ) {
    key = "pending_khoa";
  } else if (topic.topic_leader_status === "approved") {
    key = "approved";
  }

  const s = STATUS_STYLES[key] || STATUS_STYLES.pending_khoa;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.7,
        px: 1.5,
        py: 0.4,
        borderRadius: "20px",
        bgcolor: s.bgcolor,
      }}
    >
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: s.dot }} />
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: s.color, lineHeight: 1 }}
      >
        {s.label}
      </Typography>
    </Box>
  );
};

const StatCard = ({ value, label, color, icon, onClick, active }) => (
  <Box
    onClick={onClick}
    sx={{
      flex: "1 1 0%",
      minWidth: 110,
      cursor: onClick ? "pointer" : "default",
      p: 2.5,
      borderRadius: 3,
      border: active ? `2px solid ${color}` : "2px solid transparent",
      bgcolor: active ? `${color}18` : "#fff",
      boxShadow: active ? `0 0 0 4px ${color}22` : "0 1px 4px rgba(0,0,0,0.07)",
      transition: "all 0.18s",
      "&:hover": onClick
        ? { transform: "translateY(-2px)", boxShadow: `0 4px 16px ${color}33` }
        : {},
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 0.5,
    }}
  >
    <Box sx={{ fontSize: 26, color, mb: 0.3 }}>{icon}</Box>
    <Typography sx={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: "#64748b",
        fontWeight: 600,
        textAlign: "center",
        lineHeight: 1.3,
      }}
    >
      {label}
    </Typography>
  </Box>
);

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
  const [createDialog, setCreateDialog] = useState(false);

  useEffect(() => {
    loadTopics();
  }, [filters.status, filters.page, filters.search]);
  useEffect(() => {
    loadFilterData();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page + 1,
        limit: filters.rowsPerPage,
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        _: Date.now(),
      };
      const response = await axios.get("/api/teacher/topics", {
        params,
        headers: { "Cache-Control": "no-cache" },
      });
      setTopics(response.data.data || []);
      setStats(response.data.stats || {});
      setTotal(response.data.pagination?.total || 0);
    } catch {
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
      const active = periods.find(
        (p) => p.registration_period_status === "active",
      );
      if (active)
        setNewTopic((prev) => ({
          ...prev,
          topic_registration_period: active._id,
        }));
    } catch {
      /* ignore */
    }
  };

  const handleCreateTopic = async () => {
    try {
      await axios.post("/api/teacher/topics", newTopic);
      toast.success("Tạo đề tài thành công");
      setCreateDialog(false);
      const active = registrationPeriods.find(
        (p) => p.registration_period_status === "active",
      );
      setNewTopic({
        topic_title: "",
        topic_description: "",
        topic_category: "",
        topic_major: "",
        topic_registration_period: active?._id || "",
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

  const statCards = [
    {
      key: "all",
      value: stats.total || 0,
      label: "Tổng đề tài",
      color: "#6366f1",
      icon: <AssignmentIcon sx={{ fontSize: 26 }} />,
    },
    {
      key: "my_guided",
      value: stats.my_guided || 0,
      label: "Đang hướng dẫn",
      color: "#22c55e",
      icon: <GroupIcon sx={{ fontSize: 26 }} />,
    },
    {
      key: "pending_approval",
      value: stats.pending_approval || 0,
      label: "Chờ duyệt",
      color: "#eab308",
      icon: <PendingIcon sx={{ fontSize: 26 }} />,
    },
    {
      key: "in_progress",
      value: stats.in_progress || 0,
      label: "Đang thực hiện",
      color: "#3b82f6",
      icon: <TrendingUpIcon sx={{ fontSize: 26 }} />,
    },
    {
      key: "completed",
      value: stats.completed || 0,
      label: "Hoàn thành",
      color: "#10b981",
      icon: <DoneIcon sx={{ fontSize: 26 }} />,
    },
    {
      key: "my_created",
      value: stats.my_created || 0,
      label: "Tôi tạo",
      color: "#8b5cf6",
      icon: <CreateIcon sx={{ fontSize: 26 }} />,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 5 }}>
      {/* ─── Header ─── */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}
          >
            📚 Quản lý đề tài
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.75)", mt: 0.3 }}
          >
            Tổng hợp các đề tài bạn đã tạo và đang hướng dẫn
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/teacher/topics/create")}
          sx={{
            bgcolor: "#fff",
            color: "#1e3a8a",
            fontWeight: 700,
            borderRadius: "12px",
            textTransform: "none",
            px: 3,
            py: 1.2,
            boxShadow: "none",
            "&:hover": { bgcolor: "#e0e7ff", boxShadow: "none" },
          }}
        >
          Tạo đề tài mới
        </Button>
      </Box>

      {/* ─── Stat Cards ─── */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {statCards.map((s) => (
          <StatCard
            key={s.key}
            value={s.value}
            label={s.label}
            color={s.color}
            icon={s.icon}
            active={filters.status === s.key}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                status: s.key === "all" ? "all" : s.key,
                page: 0,
              }))
            }
          />
        ))}
      </Box>

      {/* ─── Search Bar ─── */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          bgcolor: "#fff",
          border: "1px solid #e2e8f0",
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Tìm kiếm tên đề tài..."
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value, page: 0 }))
          }
          size="small"
          sx={{ flex: 1, minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
            sx: { borderRadius: "10px", bgcolor: "#f8fafc" },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Lọc trạng thái</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
                page: 0,
              }))
            }
            label="Lọc trạng thái"
            sx={{ borderRadius: "10px", bgcolor: "#f8fafc" }}
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
      </Box>

      {/* ─── Table ─── */}
      <Box
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          bgcolor: "#fff",
        }}
      >
        {loading && <LinearProgress />}

        {!loading && topics.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <AssignmentIcon sx={{ fontSize: 56, color: "#cbd5e1", mb: 1.5 }} />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 700 }}
            >
              Chưa có đề tài nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {filters.status !== "all" || filters.search
                ? "Thử thay đổi bộ lọc"
                : "Hãy tạo đề tài đầu tiên của bạn"}
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: 13,
                      py: 1.8,
                    }}
                  >
                    Tiêu đề đề tài
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#475569", fontSize: 13 }}
                  >
                    Danh mục
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#475569", fontSize: 13 }}
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#475569", fontSize: 13 }}
                  >
                    Sinh viên
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#475569", fontSize: 13 }}
                  >
                    Ngày tạo
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#475569", fontSize: 13 }}
                    align="right"
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topics.map((topic, idx) => {
                  const approved =
                    topic.topic_group_student?.filter(
                      (s) => s.status === "approved",
                    ).length || 0;
                  const full = approved >= topic.topic_max_members;
                  return (
                    <TableRow
                      key={topic._id}
                      hover
                      onClick={() => navigate(`/teacher/topics/${topic._id}`)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: idx % 2 === 0 ? "#fff" : "#fafbfc",
                        "&:hover": { bgcolor: "#eff6ff" },
                        transition: "background 0.12s",
                      }}
                    >
                      {/* Title */}
                      <TableCell sx={{ py: 2 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              flexShrink: 0,
                              bgcolor: "#e0e7ff",
                              color: "#6366f1",
                              fontWeight: 800,
                              fontSize: 14,
                            }}
                          >
                            {topic.topic_title?.[0]?.toUpperCase() || "T"}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: "#1e293b",
                                maxWidth: 280,
                              }}
                              noWrap
                            >
                              {topic.topic_title}
                            </Typography>
                            {topic.topic_creator?._id !==
                              topic.topic_instructor?._id && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Đề xuất bởi: {topic.topic_creator?.user_name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Chip
                          label={
                            topic.topic_category?.topic_category_title || "N/A"
                          }
                          size="small"
                          sx={{
                            bgcolor: "#f1f5f9",
                            color: "#475569",
                            fontWeight: 600,
                            borderRadius: "8px",
                          }}
                        />
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge topic={topic} />
                      </TableCell>

                      {/* Students */}
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.8}>
                          <GroupIcon
                            sx={{
                              fontSize: 16,
                              color: full ? "#dc2626" : "#22c55e",
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: full ? "#dc2626" : "#15803d",
                            }}
                          >
                            {approved}/{topic.topic_max_members}
                          </Typography>
                          {full && (
                            <Chip
                              label="Đầy"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: 10,
                                fontWeight: 700,
                                bgcolor: "#fee2e2",
                                color: "#dc2626",
                                borderRadius: "6px",
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          {new Date(topic.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell
                        align="right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Box display="flex" justifyContent="flex-end" gap={0.5}>
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/teacher/topics/${topic._id}`);
                              }}
                              sx={{
                                color: "#3b82f6",
                                "&:hover": { bgcolor: "#eff6ff" },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/teacher/topics/${topic._id}/edit`);
                              }}
                              sx={{
                                color: "#f59e0b",
                                "&:hover": { bgcolor: "#fefce8" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={
                              approved > 0
                                ? "Không thể xóa khi đã có SV"
                                : "Xóa đề tài"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={approved > 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDialog(topic._id);
                                }}
                                sx={{
                                  color: "#ef4444",
                                  "&:hover": { bgcolor: "#fef2f2" },
                                  "&.Mui-disabled": { color: "#cbd5e1" },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={filters.rowsPerPage}
              page={filters.page}
              onPageChange={(e, p) =>
                setFilters((prev) => ({ ...prev, page: p }))
              }
              onRowsPerPageChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  rowsPerPage: parseInt(e.target.value, 10),
                  page: 0,
                }))
              }
              labelRowsPerPage="Số hàng:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} trong ${count}`
              }
              sx={{ borderTop: "1px solid #e2e8f0", color: "#64748b" }}
            />
          </>
        )}
      </Box>

      {/* ─── Create Dialog ─── */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#1e3a8a", pb: 0.5 }}>
          🚀 Tạo đề tài nghiên cứu mới
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Điền các thông tin chi tiết để công bố đề tài cho sinh viên đăng ký.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControl sx={{ flex: 1, minWidth: 180 }} required>
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
              <FormControl sx={{ flex: 1, minWidth: 180 }}>
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
                  {majors.map((m) => (
                    <MenuItem key={m._id} value={m._id}>
                      {m.major_title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControl sx={{ flex: 1, minWidth: 180 }} required>
                <InputLabel>Kỳ đăng ký</InputLabel>
                <Select
                  value={newTopic.topic_registration_period}
                  onChange={(e) =>
                    setNewTopic((prev) => ({
                      ...prev,
                      topic_registration_period: e.target.value,
                    }))
                  }
                  label="Kỳ đăng ký"
                  sx={{ borderRadius: "12px" }}
                >
                  {registrationPeriods.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.registration_period_semester} (
                      {p.registration_period_status})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Số SV tối đa"
                type="number"
                sx={{ width: 160 }}
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
            </Box>
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
          </Box>
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

      {/* ─── Delete Dialog ─── */}
      <Dialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#dc2626" }}>
          ⚠️ Xác nhận xóa
        </DialogTitle>
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
