import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  HourglassEmpty as RevisionIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

/* ── helpers ── */
const STATUS_MAP = {
  approved: { label: "Đã duyệt", color: "success", icon: <CheckCircleIcon fontSize="small" /> },
  rejected: { label: "Từ chối", color: "error", icon: <CancelIcon fontSize="small" /> },
  need_revision: { label: "Cần chỉnh sửa", color: "warning", icon: <RevisionIcon fontSize="small" /> },
  pending: { label: "Chờ duyệt", color: "default", icon: <PendingIcon fontSize="small" /> },
};

const MEMBER_STATUS = {
  approved: { label: "Đã duyệt", color: "success" },
  pending: { label: "Chờ duyệt", color: "warning" },
  rejected: { label: "Từ chối", color: "error" },
};

const InfoRow = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ mt: 0.3, fontWeight: 500 }}>
      {value || "—"}
    </Typography>
  </Box>
);

/* ── component ── */
const TopicDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTopic();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTopic = async () => {
    try {
      setLoading(true);
      // Gọi đúng API lấy 1 topic theo id — không load cả list
      const response = await axios.get(`/api/teacher/topics/${id}`);
      setTopic(response.data.data);
    } catch (error) {
      console.error("Failed to load topic:", error);
      toast.error("Không thể tải chi tiết đề tài");
      navigate("/teacher/topics");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`/api/teacher/topics/${id}`);
      toast.success("Đã xóa đề tài");
      navigate("/teacher/topics");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa thất bại");
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
    }
  };

  if (loading) return <LinearProgress />;
  if (!topic) return <Typography sx={{ m: 4 }}>Đề tài không tồn tại</Typography>;

  let statusInfo = { label: "Chờ Khoa duyệt", color: "warning", icon: <PendingIcon fontSize="small" /> };
  if (topic.is_completed) {
    statusInfo = { label: "Hoàn thành", color: "success", icon: <CheckCircleIcon fontSize="small" /> };
  } else if (topic.topic_teacher_status === "rejected" || topic.topic_leader_status === "rejected") {
    statusInfo = { label: "Từ chối", color: "error", icon: <CancelIcon fontSize="small" /> };
  } else if (topic.topic_teacher_status === "pending") {
    statusInfo = { label: "Chờ GV duyệt", color: "warning", icon: <PendingIcon fontSize="small" /> };
  } else if (topic.topic_teacher_status === "approved" && topic.topic_leader_status === "pending") {
    statusInfo = { label: "Chờ Khoa duyệt", color: "warning", icon: <PendingIcon fontSize="small" /> };
  } else if (topic.topic_leader_status === "approved") {
    statusInfo = { label: "Đã duyệt", color: "success", icon: <CheckCircleIcon fontSize="small" /> };
  }

  const approvedCount = (topic.topic_group_student || []).filter(
    (m) => m.status === "approved"
  ).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* ── Header ── */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/teacher/topics")}
            sx={{ color: "rgba(255,255,255,0.8)", mb: 1, textTransform: "none", p: 0 }}
          >
            Quay lại danh sách
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
            {topic.topic_title}
          </Typography>
          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              icon={statusInfo.icon}
              label={statusInfo.label}
              color={statusInfo.color}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<GroupIcon fontSize="small" />}
              label={`${approvedCount}/${topic.topic_max_members} SV`}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
            />
          </Box>
        </Box>

        <Box display="flex" gap={1} flexShrink={0} sx={{ mt: 0.5 }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/teacher/topics/${id}/edit`)}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Chỉnh sửa
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialog(true)}
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.4)",
              "&:hover": { borderColor: "white", bgcolor: "rgba(255,0,0,0.15)" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Xóa
          </Button>
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" } }}>
        {/* Left – mô tả + sinh viên */}
        <Box sx={{ flex: "1 1 0%", minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Mô tả */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: "#1e293b" }}>
              📄 Mô tả đề tài
            </Typography>
            <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {topic.topic_description || "Chưa có mô tả"}
            </Typography>

            {topic.topic_advisor_request && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "#eff6ff", borderRadius: 2, borderLeft: "3px solid #3b82f6" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#1d4ed8" }}>
                  YÊU CẦU CỦA SINH VIÊN
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.3, color: "#1e40af" }}>
                  {topic.topic_advisor_request}
                </Typography>
              </Box>
            )}

            {topic.teacher_notes && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "#fefce8", borderRadius: 2, borderLeft: "3px solid #f59e0b" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#b45309" }}>
                  GHI CHÚ CỦA GIẢNG VIÊN
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.3, color: "#78350f" }}>
                  {topic.teacher_notes}
                </Typography>
              </Box>
            )}

            {topic.topic_leader_status === "rejected" && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "#fef2f2", borderRadius: 2, borderLeft: "3px solid #ef4444" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#b91c1c" }}>
                  LÝ DO KHOA / QUẢN TRỊ VIÊN TỪ CHỐI
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.3, color: "#991b1b" }}>
                  {topic.leader_feedback || "Không có lý do cụ thể."}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Danh sách sinh viên */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "#1e293b" }}>
              👥 Sinh viên trong nhóm ({approvedCount}/{topic.topic_max_members})
            </Typography>

            {(!topic.topic_group_student || topic.topic_group_student.length === 0) ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <GroupIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Chưa có sinh viên nào đăng ký
                </Typography>
              </Box>
            ) : (
              topic.topic_group_student.map((member, idx) => {
                const ms = MEMBER_STATUS[member.status] || { label: member.status, color: "default" };
                return (
                  <Box
                    key={member._id || idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: idx % 2 === 0 ? "#f8fafc" : "white",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: "#3b82f6", fontSize: 14 }}>
                        {(member.student?.user_name || "?")[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {member.student?.user_name || "N/A"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.student?.user_id || ""}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      size="small"
                      label={ms.label}
                      color={ms.color}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                );
              })
            )}
          </Paper>
        </Box>

        {/* Right – sidebar thông tin (cố định bên phải) */}
        <Box sx={{ width: { xs: "100%", md: "320px" }, flexShrink: 0, position: { md: "sticky" }, top: { md: "88px" }, alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Slot SV card */}
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <Box sx={{ p: 2, bgcolor: approvedCount >= topic.topic_max_members ? "#fef2f2" : "#f0fdf4", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 1 }}>
              <GroupIcon sx={{ color: approvedCount >= topic.topic_max_members ? "#dc2626" : "#16a34a", fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: approvedCount >= topic.topic_max_members ? "#dc2626" : "#15803d" }}>
                {approvedCount >= topic.topic_max_members ? "Đã đầy chỗ" : `Còn ${topic.topic_max_members - approvedCount} chỗ trống`}
              </Typography>
            </Box>
            <CardContent sx={{ p: 2, pt: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Sinh viên đã duyệt</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{approvedCount}/{topic.topic_max_members}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((approvedCount / topic.topic_max_members) * 100, 100)}
                sx={{ height: 8, borderRadius: 4, bgcolor: "#e2e8f0", "& .MuiLinearProgress-bar": { bgcolor: approvedCount >= topic.topic_max_members ? "#dc2626" : "#22c55e" } }}
              />
            </CardContent>
          </Card>

          {/* Thông tin chi tiết card */}
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "#1e293b" }}>
                ℹ️ Thông tin
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box display="flex" alignItems="flex-start" gap={1.5}>
                  <CategoryIcon sx={{ color: "#94a3b8", mt: 0.2, flexShrink: 0 }} fontSize="small" />
                  <InfoRow label="Danh mục" value={topic.topic_category?.topic_category_title} />
                </Box>

                <Divider />

                <Box display="flex" alignItems="flex-start" gap={1.5}>
                  <SchoolIcon sx={{ color: "#94a3b8", mt: 0.2, flexShrink: 0 }} fontSize="small" />
                  <InfoRow label="Chuyên ngành" value={topic.topic_major?.major_title} />
                </Box>

                <Divider />

                <Box display="flex" alignItems="flex-start" gap={1.5}>
                  <PersonIcon sx={{ color: "#94a3b8", mt: 0.2, flexShrink: 0 }} fontSize="small" />
                  <InfoRow
                    label="Người tạo"
                    value={
                      topic.topic_creator?.user_name
                        ? `${topic.topic_creator.user_name} (${topic.topic_creator.user_id || ""})`
                        : null
                    }
                  />
                </Box>

                <Divider />

                <Box display="flex" alignItems="flex-start" gap={1.5}>
                  <CalendarIcon sx={{ color: "#94a3b8", mt: 0.2, flexShrink: 0 }} fontSize="small" />
                  <InfoRow
                    label="Ngày tạo"
                    value={
                      topic.created_at
                        ? new Date(topic.created_at).toLocaleDateString("vi-VN")
                        : null
                    }
                  />
                </Box>

                <Divider />

                <Box display="flex" alignItems="flex-start" gap={1.5}>
                  <GroupIcon sx={{ color: "#94a3b8", mt: 0.2, flexShrink: 0 }} fontSize="small" />
                  <InfoRow label="Số SV tối đa" value={`${topic.topic_max_members} sinh viên`} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#dc2626" }}>⚠️ Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Bạn có chắc muốn xóa đề tài{" "}
            <strong>"{topic.topic_title}"</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} disabled={deleting}>
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Đang xóa..." : "Xóa đề tài"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TopicDetail;
