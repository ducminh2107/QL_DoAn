import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  LinearProgress,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Divider,
  InputAdornment,
  Badge,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  MenuBook as MenuBookIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

/* ─── helpers ─── */
const getAvatarLetter = (name) => (name ? name[0].toUpperCase() : "?");
const CATEGORY_COLORS = [
  "#6366f1",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
];
const tagColor = (str) =>
  CATEGORY_COLORS[(str?.charCodeAt(0) || 0) % CATEGORY_COLORS.length];

/* ─── sub-components ─── */
const StatBadge = ({ icon, label, count, color }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 2.5,
      py: 1.5,
      bgcolor: "rgba(255,255,255,0.15)",
      borderRadius: 3,
      border: "1px solid rgba(255,255,255,0.2)",
      backdropFilter: "blur(4px)",
    }}
  >
    <Box
      sx={{
        color,
        bgcolor: "rgba(255,255,255,0.15)",
        borderRadius: "50%",
        p: 0.8,
        display: "flex",
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        sx={{ fontSize: 22, fontWeight: 900, lineHeight: 1, color: "#fff" }}
      >
        {count}
      </Typography>
      <Typography
        sx={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}
      >
        {label}
      </Typography>
    </Box>
  </Box>
);

/* ─── Topic Card for Tab 0 ─── */
const TopicCard = ({ topic, onView, onEdit, onDelete }) => {
  const cat = topic.topic_category?.topic_category_title || "N/A";
  const color = tagColor(cat);
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        p: 3,
        transition: "all 0.25s",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)",
          borderColor: "#a5b4fc",
        },
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: color + "22",
            color,
            width: 44,
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {getAvatarLetter(topic.topic_title)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              lineHeight: 1.4,
              mb: 0.5,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {topic.topic_title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#64748b",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {topic.topic_description || "Chưa có mô tả"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Chip
          size="small"
          icon={<CategoryIcon sx={{ fontSize: "12px !important" }} />}
          label={cat}
          sx={{
            bgcolor: color + "15",
            color,
            borderColor: color + "30",
            border: "1px solid",
            fontWeight: 600,
            fontSize: 11,
          }}
        />
        <Chip
          size="small"
          icon={<SchoolIcon sx={{ fontSize: "12px !important" }} />}
          label={topic.topic_major?.major_title || "N/A"}
          sx={{
            bgcolor: "#f1f5f9",
            color: "#475569",
            fontWeight: 600,
            fontSize: 11,
          }}
        />
        <Chip
          size="small"
          icon={<GroupIcon sx={{ fontSize: "12px !important" }} />}
          label={`${topic.topic_max_members} SV tối đa`}
          sx={{
            bgcolor: "#f0fdf4",
            color: "#16a34a",
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Tooltip title="Xem chi tiết">
          <IconButton
            size="small"
            onClick={() => onView(topic)}
            sx={{
              color: "#64748b",
              bgcolor: "#f8fafc",
              "&:hover": { bgcolor: "#e0e7ff", color: "#6366f1" },
            }}
          >
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Chỉnh sửa">
          <IconButton
            size="small"
            onClick={() => onEdit(topic)}
            sx={{
              color: "#3b82f6",
              bgcolor: "#eff6ff",
              "&:hover": { bgcolor: "#bfdbfe" },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa">
          <IconButton
            size="small"
            onClick={() => onDelete(topic._id)}
            sx={{
              color: "#ef4444",
              bgcolor: "#fef2f2",
              "&:hover": { bgcolor: "#fecaca" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

/* ─── Pending Topic Card for Tab 1 ─── */
const PendingCard = ({ topic, onView, onApprove, onReject }) => {
  const cat = topic.topic_category?.topic_category_title || "N/A";
  const color = tagColor(cat);
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "2px solid #fef3c7",
        p: 3,
        background: "linear-gradient(135deg, #fffbeb 0%, #fff 60%)",
        transition: "all 0.25s",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(245,158,11,0.15)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flex: 1, minWidth: 0 }}>
          <Avatar
            sx={{
              bgcolor: color + "22",
              color,
              width: 44,
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {getAvatarLetter(topic.topic_title)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: "#1e293b",
                lineHeight: 1.4,
                mb: 0.5,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {topic.topic_title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: "#dbeafe",
                  color: "#1d4ed8",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {getAvatarLetter(topic.topic_creator?.user_name)}
              </Avatar>
              <Typography
                variant="caption"
                sx={{ color: "#3b82f6", fontWeight: 600 }}
              >
                {topic.topic_creator?.user_name || "N/A"}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Chip
          label="Chờ duyệt"
          size="small"
          sx={{
            bgcolor: "#fef3c7",
            color: "#b45309",
            fontWeight: 700,
            border: "1px solid #fde68a",
            flexShrink: 0,
          }}
        />
      </Box>

      <Typography
        variant="caption"
        sx={{
          mt: 1.5,
          display: "block",
          color: "#64748b",
          //display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {topic.topic_description || "Chưa có mô tả"}
      </Typography>

      <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Chip
          size="small"
          label={cat}
          sx={{
            bgcolor: color + "15",
            color,
            border: "1px solid " + color + "30",
            fontWeight: 600,
            fontSize: 11,
          }}
        />
        <Chip
          size="small"
          label={topic.topic_major?.major_title || "N/A"}
          sx={{
            bgcolor: "#f1f5f9",
            color: "#475569",
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />
      <Box
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<ViewIcon />}
          onClick={() => onView(topic)}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 600,
            borderColor: "#e2e8f0",
            color: "#64748b",
          }}
        >
          Xem
        </Button>
        <Button
          size="small"
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={() => onApprove(topic._id)}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 700,
            boxShadow: "none",
          }}
        >
          Phê duyệt
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          startIcon={<CancelIcon />}
          onClick={() => onReject(topic._id)}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 700,
            boxShadow: "none",
          }}
        >
          Từ chối
        </Button>
      </Box>
    </Paper>
  );
};

/* ─── Main Component ─── */
const SystemTopicsManagement = () => {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [pendingTopics, setPendingTopics] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [viewDetailTopic, setViewDetailTopic] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [formData, setFormData] = useState({
    topic_title: "",
    topic_description: "",
    topic_category: "",
    topic_major: "",
    topic_max_members: 1,
    topic_registration_period: "",
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const [topicsRes, categoriesRes, majorsRes, pendingRes] =
        await Promise.all([
          axios.get("/api/admin/system-topics"),
          axios.get("/api/topic-categories"),
          axios.get("/api/majors"),
          axios
            .get("/api/admin/topics/pending")
            .catch(() => ({ data: { data: [] } })),
        ]);
      setTopics(topicsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setMajors(majorsRes.data.data || []);
      setPendingTopics(pendingRes.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách đề tài",
      );
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
      setFormData({
        topic_title: topic.topic_title || "",
        topic_description: topic.topic_description || "",
        topic_category: topic.topic_category?._id || topic.topic_category || "",
        topic_major: topic.topic_major?._id || topic.topic_major || "",
        topic_max_members: topic.topic_max_members || 1,
        topic_registration_period: "",
      });
    } else {
      setEditingTopic(null);
      setFormData({
        topic_title: "",
        topic_description: "",
        topic_category: "",
        topic_major: "",
        topic_max_members: 1,
        topic_registration_period: "",
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...formData };
      if (!payload.topic_registration_period)
        delete payload.topic_registration_period;
      if (editingTopic) {
        await axios.put(
          `/api/admin/system-topics/${editingTopic._id}`,
          payload,
        );
        toast.success("Cập nhật đề tài thành công");
      } else {
        await axios.post("/api/admin/system-topics", payload);
        toast.success("Tạo đề tài thành công");
      }
      setOpenDialog(false);
      setEditingTopic(null);
      fetchTopics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi lưu đề tài");
    }
  };

  const handleDelete = async (topicId) => {
    if (window.confirm("Bạn có chắc muốn xóa đề tài này?")) {
      try {
        await axios.delete(`/api/admin/system-topics/${topicId}`);
        toast.success("Xóa đề tài thành công");
        fetchTopics();
      } catch {
        toast.error("Lỗi xóa đề tài");
      }
    }
  };

  const handleApprove = async (topicId) => {
    try {
      await axios.put(`/api/admin/topics/${topicId}/approve`);
      toast.success("Đã duyệt đề tài");
      if (viewDetailTopic) setViewDetailTopic(null);
      fetchTopics();
    } catch {
      toast.error("Lỗi khi duyệt đề tài");
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    try {
      await axios.put(`/api/admin/topics/${rejectDialog}/reject`, {
        feedback: rejectReason,
      });
      toast.success("Đã từ chối đề tài");
      if (viewDetailTopic) setViewDetailTopic(null);
      setRejectDialog(null);
      setRejectReason("");
      fetchTopics();
    } catch {
      toast.error("Lỗi khi từ chối");
    }
  };

  const filteredTopics = topics.filter(
    (t) =>
      t.topic_title?.toLowerCase().includes(searchText.toLowerCase()) ||
      t.topic_description?.toLowerCase().includes(searchText.toLowerCase()),
  );
  const filteredPending = pendingTopics.filter((t) =>
    t.topic_title?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4, fontFamily: "'Inter', sans-serif" }}>
      {/* ── HEADER ── */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
          borderRadius: 4,
          color: "white",
          boxShadow: "0 20px 50px rgba(37, 99, 235, 0.35)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, letterSpacing: "-0.5px", mb: 0.5 }}
            >
              🗂️ Kho Đề Tài Hệ Thống
            </Typography>
            <Typography sx={{ opacity: 0.85, fontSize: 15 }}>
              Kiểm duyệt đề xuất của Giảng viên & Quản lý kho đề tài dùng chung
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              fontWeight: 800,
              borderRadius: 2,
              bgcolor: "white",
              color: "#1e3a8a",
              px: 3,
              py: 1.5,
              textTransform: "none",
              fontSize: "0.95rem",
              "&:hover": { bgcolor: "#f1f5f9", transform: "scale(1.03)" },
              transition: "all 0.2s",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            }}
          >
            Thêm Đề Tài Mới
          </Button>
        </Box>

        {/* Stats */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <StatBadge
            icon={<MenuBookIcon sx={{ fontSize: 20 }} />}
            label="Tổng Đề Tài"
            count={topics.length}
            color="#93c5fd"
          />
          <StatBadge
            icon={<AssignmentIcon sx={{ fontSize: 20 }} />}
            label="Chờ Duyệt"
            count={pendingTopics.length}
            color="#fcd34d"
          />
          <StatBadge
            icon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
            label="Đã Duyệt"
            count={
              topics.filter((t) => t.topic_leader_status === "approved")
                .length || topics.length
            }
            color="#6ee7b7"
          />
        </Box>
      </Box>

      {/* ── SEARCH + TABS ── */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TextField
          placeholder="Tìm kiếm đề tài..."
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 2, bgcolor: "white" },
          }}
          sx={{ width: { xs: "100%", sm: 300 } }}
        />
        <Box sx={{ ml: "auto" }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            TabIndicatorProps={{
              style: { height: 3, borderRadius: "3px 3px 0 0" },
            }}
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 700 },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MenuBookIcon sx={{ fontSize: 18 }} /> Đề Tài Hệ Thống
                  <Chip
                    label={topics.length}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 11,
                      fontWeight: 800,
                      bgcolor: "#eff6ff",
                      color: "#3b82f6",
                    }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AssignmentIcon sx={{ fontSize: 18 }} /> Chờ Duyệt
                  {pendingTopics.length > 0 && (
                    <Chip
                      label={pendingTopics.length}
                      size="small"
                      color="error"
                      sx={{ height: 20, fontSize: 11, fontWeight: 800 }}
                    />
                  )}
                </Box>
              }
            />
          </Tabs>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ borderRadius: 2, mb: 2 }} />}

      {/* ── TAB 0: ĐỀ TÀI HỆ THỐNG ── */}
      {tabValue === 0 &&
        !loading &&
        (filteredTopics.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <MenuBookIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              {searchText
                ? "Không tìm thấy kết quả"
                : "Chưa có đề tài hệ thống nào"}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                mt: 2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Thêm đề tài đầu tiên
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {filteredTopics.map((topic) => (
              <Grid item xs={12} sm={6} lg={4} key={topic._id}>
                <TopicCard
                  topic={topic}
                  onView={setViewDetailTopic}
                  onEdit={handleOpenDialog}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        ))}

      {/* ── TAB 1: CHỜ DUYỆT ── */}
      {tabValue === 1 &&
        !loading &&
        (filteredPending.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "#10b981", mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Tuyệt vời! Không có đề tài nào đang chờ duyệt.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {filteredPending.map((topic) => (
              <Grid item xs={12} sm={6} lg={4} key={topic._id}>
                <PendingCard
                  topic={topic}
                  onView={setViewDetailTopic}
                  onApprove={handleApprove}
                  onReject={setRejectDialog}
                />
              </Grid>
            ))}
          </Grid>
        ))}

      {/* ── CREATE/EDIT DIALOG ── */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingTopic(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            color: "white",
            px: 4,
            py: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: "1.2rem" }}>
            {editingTopic
              ? "✏️ Cập Nhật Đề Tài Hệ Thống"
              : "✨ Thêm Đề Tài Hệ Thống Mới"}
          </Typography>
          <IconButton
            onClick={() => setOpenDialog(false)}
            sx={{ color: "rgba(255,255,255,0.8)" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1.5 }}
          >
            <TextField
              fullWidth
              label="Tên Đề Tài *"
              name="topic_title"
              value={formData.topic_title}
              onChange={(e) =>
                setFormData({ ...formData, topic_title: e.target.value })
              }
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Mô Tả Chi Tiết"
              name="topic_description"
              value={formData.topic_description}
              onChange={(e) =>
                setFormData({ ...formData, topic_description: e.target.value })
              }
              multiline
              rows={5}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              placeholder="Mô tả mục tiêu, yêu cầu chức năng, công nghệ sử dụng và kết quả mong đợi..."
            />

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <TextField
                fullWidth
                select
                label="Danh Mục *"
                name="topic_category"
                value={formData.topic_category}
                onChange={(e) =>
                  setFormData({ ...formData, topic_category: e.target.value })
                }
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.topic_category_title}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Chuyên Ngành *"
                name="topic_major"
                value={formData.topic_major}
                onChange={(e) =>
                  setFormData({ ...formData, topic_major: e.target.value })
                }
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                {majors.map((major) => (
                  <MenuItem key={major._id} value={major._id}>
                    {major.major_title}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <TextField
                label="Số SV Tối Đa"
                name="topic_max_members"
                type="number"
                value={formData.topic_max_members}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    topic_max_members: e.target.value,
                  })
                }
                inputProps={{ min: 1, max: 10 }}
                sx={{
                  width: { xs: "100%", md: "50%" },
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 4,
            py: 3,
            bgcolor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            gap: 1,
          }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ fontWeight: 600, color: "#64748b", borderRadius: 2 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              px: 4,
              bgcolor: "#3b82f6",
              textTransform: "none",
            }}
          >
            {editingTopic ? "Lưu Thay Đổi" : "Tạo Đề Tài"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── VIEW DETAIL DIALOG ── */}
      <Dialog
        open={!!viewDetailTopic}
        onClose={() => setViewDetailTopic(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        {viewDetailTopic && (
          <>
            <Box
              sx={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                p: 3,
                color: "white",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 900, lineHeight: 1.4, mb: 1 }}
                  >
                    {viewDetailTopic.topic_title}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {viewDetailTopic.topic_leader_status === "pending" && (
                      <Chip
                        size="small"
                        label="⏳ Chờ duyệt"
                        sx={{
                          bgcolor: "#fef3c7",
                          color: "#b45309",
                          fontWeight: 700,
                        }}
                      />
                    )}
                    <Chip
                      size="small"
                      label={
                        viewDetailTopic.topic_category?.topic_category_title ||
                        "N/A"
                      }
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      size="small"
                      icon={
                        <GroupIcon
                          sx={{
                            color: "white !important",
                            fontSize: "14px !important",
                          }}
                        />
                      }
                      label={`${viewDetailTopic.topic_max_members} SV`}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>
                <IconButton
                  onClick={() => setViewDetailTopic(null)}
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            <DialogContent sx={{ p: 0 }}>
              <Grid container sx={{ minHeight: 300 }}>
                <Grid
                  item
                  xs={12}
                  md={8}
                  sx={{ p: 3, borderRight: { md: "1px solid #e2e8f0" } }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      mb: 1.5,
                    }}
                  >
                    📄 Mô Tả Đề Tài
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#334155",
                      lineHeight: 1.8,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {viewDetailTopic.topic_description ||
                      "Chưa có mô tả chi tiết."}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} sx={{ p: 3, bgcolor: "#f8fafc" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      mb: 2,
                    }}
                  >
                    ℹ️ Thông Tin
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {viewDetailTopic.topic_creator && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ fontWeight: 700 }}
                        >
                          Người Đề Xuất
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "#dbeafe",
                              color: "#1d4ed8",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {getAvatarLetter(
                              viewDetailTopic.topic_creator.user_name,
                            )}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {viewDetailTopic.topic_creator.user_name}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ fontWeight: 700 }}
                      >
                        Danh Mục
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mt: 0.5 }}
                      >
                        {viewDetailTopic.topic_category?.topic_category_title ||
                          "N/A"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ fontWeight: 700 }}
                      >
                        Chuyên Ngành
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mt: 0.5 }}
                      >
                        {viewDetailTopic.topic_major?.major_title || "N/A"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ fontWeight: 700 }}
                      >
                        Số SV Tối Đa
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, mt: 0.5 }}
                      >
                        {viewDetailTopic.topic_max_members} sinh viên
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions
              sx={{
                p: 3,
                bgcolor: "white",
                borderTop: "1px solid #e2e8f0",
                gap: 1,
              }}
            >
              <Button
                onClick={() => setViewDetailTopic(null)}
                sx={{ color: "#64748b", fontWeight: 600, borderRadius: 2 }}
              >
                Đóng
              </Button>
              {viewDetailTopic.topic_leader_status === "pending" && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 3,
                      textTransform: "none",
                    }}
                    onClick={() => {
                      setRejectDialog(viewDetailTopic._id);
                    }}
                  >
                    Từ chối
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 3,
                      textTransform: "none",
                      boxShadow: "none",
                    }}
                    onClick={() => handleApprove(viewDetailTopic._id)}
                  >
                    Phê duyệt
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── REJECT DIALOG ── */}
      <Dialog
        open={!!rejectDialog}
        onClose={() => setRejectDialog(null)}
        PaperProps={{ sx: { borderRadius: 4 } }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 900, color: "#dc2626", pb: 1 }}>
          ❌ Từ Chối Đề Tài
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: "#64748b" }}>
            Vui lòng nhập lý do từ chối để Giảng viên có thể biết và chỉnh sửa
            lại đề tài.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            multiline
            rows={4}
            variant="outlined"
            placeholder="Nhập lý do chi tiết... (bắt buộc)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button
            onClick={() => setRejectDialog(null)}
            sx={{ color: "#64748b", fontWeight: 600, borderRadius: 2 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              px: 4,
              textTransform: "none",
            }}
            disabled={!rejectReason.trim()}
          >
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SystemTopicsManagement;
