import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
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
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Refresh as RefreshIcon,
  Circle as CircleIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const TYPE_CONFIG = {
  warning: {
    icon: <WarningIcon sx={{ color: "#f59e0b" }} />,
    bg: "#fffbeb",
    border: "#f59e0b",
    chip: "warning",
  },
  success: {
    icon: <CheckCircleIcon sx={{ color: "#10b981" }} />,
    bg: "#f0fdf4",
    border: "#10b981",
    chip: "success",
  },
  info: {
    icon: <InfoIcon sx={{ color: "#3b82f6" }} />,
    bg: "#eff6ff",
    border: "#3b82f6",
    chip: "info",
  },
  system: {
    icon: <AdminIcon sx={{ color: "#8b5cf6" }} />,
    bg: "#f5f3ff",
    border: "#8b5cf6",
    chip: "default",
  },
  personal: {
    icon: <SchoolIcon sx={{ color: "#06b6d4" }} />,
    bg: "#ecfeff",
    border: "#06b6d4",
    chip: "default",
  },
};

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.info;

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const TeacherNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadNotifications = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const response = await axios.get("/api/teacher/notifications");
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      if (!silent) toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Auto-refresh every 60s
    const interval = setInterval(() => loadNotifications(true), 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/teacher/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    } catch {
      toast.error("Không thể cập nhật thông báo");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/teacher/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("Đã xóa thông báo");
    } catch {
      toast.error("Không thể xóa thông báo");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch("/api/teacher/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch {
      toast.error("Không thể cập nhật thông báo");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.notification_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.notification_content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "unread" && !n.is_read) ||
      (filterStatus === "read" && n.is_read);
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          borderRadius: 3,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          boxShadow: "0 8px 24px rgba(37,99,235,0.25)",
        }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon sx={{ fontSize: 32 }} />
            </Badge>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
            >
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
              onClick={handleMarkAllAsRead}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                fontWeight: 600,
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

      {/* Filter and Search */}
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
            <ToggleButton value="all">
              Tất cả ({notifications.length})
            </ToggleButton>
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
      {filteredNotifications.length === 0 ? (
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
            Bạn sẽ nhận thông báo khi sinh viên đăng ký đề tài hoặc admin thực
            hiện hành động
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filteredNotifications.map((notification, idx) => {
            const cfg = getConfig(notification.notification_type);
            const isUnread = !notification.is_read;
            return (
              <Paper
                key={notification._id}
                elevation={0}
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
                        {notification.notification_title ||
                          "(Không có tiêu đề)"}
                      </Typography>
                      {isUnread && (
                        <CircleIcon sx={{ color: "#3b82f6", fontSize: 8 }} />
                      )}
                      {notification.topic && (
                        <Chip
                          label={notification.topic}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: 11,
                            maxWidth: 160,
                            overflow: "hidden",
                          }}
                        />
                      )}
                    </Box>

                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1, lineHeight: 1.6 }}
                    >
                      {notification.notification_content}
                    </Typography>

                    <Box
                      display="flex"
                      alignItems="center"
                      gap={2}
                      flexWrap="wrap"
                    >
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <ScheduleIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                        <Typography variant="caption" color="textSecondary">
                          {timeAgo(notification.createdAt)}
                        </Typography>
                      </Box>
                      {notification.sender &&
                        notification.sender !== "Hệ thống" && (
                          <Typography variant="caption" color="textSecondary">
                            Từ: <strong>{notification.sender}</strong>
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
                          onClick={() => handleMarkAsRead(notification._id)}
                          sx={{ color: "#3b82f6" }}
                        >
                          <MarkEmailReadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Xóa thông báo">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleDeleteNotification(notification._id)
                        }
                        sx={{
                          color: "#94a3b8",
                          "&:hover": { color: "#ef4444" },
                        }}
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

      {/* Footer count */}
      {filteredNotifications.length > 0 && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="caption" color="textSecondary">
            Hiển thị {filteredNotifications.length} / {notifications.length}{" "}
            thông báo
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default TeacherNotifications;
