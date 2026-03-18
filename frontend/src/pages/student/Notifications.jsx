import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Refresh as RefreshIcon,
  Circle as CircleIcon,
  AdminPanelSettings as AdminIcon,
  School as SchoolIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

/* ─── Notification type config ──────────────────────── */
const getConfig = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("✅") || t.includes("duyệt") || t.includes("chấp nhận")) {
    return {
      icon: <CheckCircleIcon sx={{ color: "#10b981" }} />,
      bg: "#f0fdf4",
      border: "#10b981",
    };
  }
  if (t.includes("❌") || t.includes("từ chối") || t.includes("bị xóa")) {
    return {
      icon: <CancelIcon sx={{ color: "#ef4444" }} />,
      bg: "#fef2f2",
      border: "#ef4444",
    };
  }
  if (t.includes("⭐") || t.includes("điểm") || t.includes("kết quả")) {
    return {
      icon: <StarIcon sx={{ color: "#f59e0b" }} />,
      bg: "#fffbeb",
      border: "#f59e0b",
    };
  }
  if (t.includes("giảng viên") || t.includes("hướng dẫn")) {
    return {
      icon: <SchoolIcon sx={{ color: "#06b6d4" }} />,
      bg: "#ecfeff",
      border: "#06b6d4",
    };
  }
  return {
    icon: <AdminIcon sx={{ color: "#8b5cf6" }} />,
    bg: "#f5f3ff",
    border: "#8b5cf6",
  };
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

/* ─── Component ─────────────────────────────────────── */
const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadNotifications = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const res = await axios.get("/api/student/notifications");
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      if (!silent) toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => loadNotifications(true), 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`/api/student/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      toast.error("Không thể cập nhật thông báo");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/student/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Đã xóa thông báo");
    } catch {
      toast.error("Không thể xóa thông báo");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch("/api/student/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch {
      toast.error("Không thể cập nhật thông báo");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = notifications.filter((n) => {
    const matchSearch =
      n.notification_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.notification_content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      filterStatus === "all" ||
      (filterStatus === "unread" && !n.is_read) ||
      (filterStatus === "read" && n.is_read);
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress size={40} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 3.5,
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          borderRadius: 3,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          boxShadow: "0 8px 24px rgba(79,70,229,0.3)",
        }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon sx={{ fontSize: 32 }} />
            </Badge>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
              Thông Báo
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            {unreadCount > 0
              ? `Bạn có ${unreadCount} thông báo chưa đọc`
              : "Tất cả thông báo đã được đọc"}
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          {unreadCount > 0 && (
            <Button
              variant="contained"
              startIcon={<MarkEmailReadIcon />}
              onClick={handleMarkAllRead}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                fontWeight: 600,
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
            >
              Đọc tất cả
            </Button>
          )}
          <Tooltip title="Làm mới">
            <IconButton
              onClick={() => loadNotifications(true)}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.12)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
            >
              {refreshing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <RefreshIcon />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filter & Search */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: "1px solid #e2e8f0", borderRadius: 2 }}
      >
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <ToggleButtonGroup
            value={filterStatus}
            exclusive
            onChange={(_, v) => v && setFilterStatus(v)}
            size="small"
          >
            <ToggleButton value="all">Tất cả ({notifications.length})</ToggleButton>
            <ToggleButton
              value="unread"
              sx={{ color: unreadCount > 0 ? "error.main" : undefined }}
            >
              Chưa đọc ({unreadCount})
            </ToggleButton>
            <ToggleButton value="read">
              Đã đọc ({notifications.length - unreadCount})
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
          }}
        >
          <NotificationsIcon sx={{ fontSize: 72, color: "#cbd5e1", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#64748b" }}>
            {searchTerm || filterStatus !== "all"
              ? "Không tìm thấy thông báo phù hợp"
              : "Chưa có thông báo nào"}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Bạn sẽ nhận thông báo khi đề tài được duyệt, từ chối, hoặc có cập nhật mới
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered.map((n) => {
            const cfg = getConfig(n.notification_title || "");
            const isUnread = !n.is_read;
            return (
              <Paper
                key={n._id}
                elevation={0}
                onClick={() => isUnread && handleMarkAsRead(n._id)}
                sx={{
                  position: "relative",
                  borderRadius: 2.5,
                  overflow: "hidden",
                  border: isUnread
                    ? `1px solid ${cfg.border}44`
                    : "1px solid #e2e8f0",
                  bgcolor: isUnread ? cfg.bg : "background.paper",
                  borderLeft: isUnread
                    ? `4px solid ${cfg.border}`
                    : "4px solid transparent",
                  cursor: isUnread ? "pointer" : "default",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Box display="flex" alignItems="flex-start" gap={2} p={2.5}>
                  {/* Icon */}
                  <Avatar
                    sx={{
                      bgcolor: isUnread ? `${cfg.border}18` : "#f1f5f9",
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                    }}
                  >
                    {cfg.icon}
                  </Avatar>

                  {/* Content */}
                  <Box flex={1} minWidth={0}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      mb={0.5}
                      flexWrap="wrap"
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: isUnread ? 700 : 600,
                          color: "#1e293b",
                        }}
                      >
                        {n.notification_title || "(Không có tiêu đề)"}
                      </Typography>
                      {isUnread && (
                        <CircleIcon sx={{ color: "#4f46e5", fontSize: 8 }} />
                      )}
                    </Box>

                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1, lineHeight: 1.6 }}
                    >
                      {n.notification_content}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <ScheduleIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                        <Typography variant="caption" color="textSecondary">
                          {timeAgo(n.createdAt)}
                        </Typography>
                      </Box>
                      {n.sender && n.sender !== "Hệ thống" && (
                        <Typography variant="caption" color="textSecondary">
                          Từ: <strong>{n.sender}</strong>
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box display="flex" gap={0.5} flexShrink={0} mt={0.5}>
                    {isUnread && (
                      <Tooltip title="Đánh dấu đã đọc">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(n._id);
                          }}
                          sx={{ color: "#4f46e5" }}
                        >
                          <MarkEmailReadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Xóa thông báo">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(n._id);
                        }}
                        sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Footer */}
      {filtered.length > 0 && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="caption" color="textSecondary">
            Hiển thị {filtered.length} / {notifications.length} thông báo
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default StudentNotifications;
