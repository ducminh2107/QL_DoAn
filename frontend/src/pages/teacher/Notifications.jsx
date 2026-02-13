import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
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
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const TeacherNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/teacher/notifications", {
        headers: { "Cache-Control": "no-cache" },
      });
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/teacher/notifications/${notificationId}/read`);
      setNotifications(
        notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, is_read: true } : notif,
        ),
      );
      toast.success("Đánh dấu là đã đọc");
    } catch (error) {
      toast.error("Không thể cập nhật thông báo");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/teacher/notifications/${notificationId}`);
      setNotifications(
        notifications.filter((notif) => notif._id !== notificationId),
      );
      toast.success("Xóa thông báo thành công");
    } catch (error) {
      toast.error("Không thể xóa thông báo");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch("/api/teacher/notifications/mark-all-read");
      setNotifications(
        notifications.map((notif) => ({ ...notif, is_read: true })),
      );
      toast.success("Đánh dấu tất cả là đã đọc");
    } catch (error) {
      toast.error("Không thể cập nhật thông báo");
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.notification_title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      notif.notification_content
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "unread" && !notif.is_read) ||
      (filterStatus === "read" && notif.is_read);

    return matchesSearch && matchesFilter;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "warning":
        return <WarningIcon sx={{ color: "#ff9800" }} />;
      case "success":
        return <CheckCircleIcon sx={{ color: "#4caf50" }} />;
      case "info":
      default:
        return <InfoIcon sx={{ color: "#2196f3" }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "warning":
        return "#fff3e0";
      case "success":
        return "#f1f8e9";
      case "info":
      default:
        return "#e3f2fd";
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <NotificationsIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Thông báo
            </Typography>
            {unreadCount > 0 && (
              <Typography variant="body2" color="error">
                {unreadCount} thông báo chưa đọc
              </Typography>
            )}
          </Box>
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<MarkEmailReadIcon />}
            onClick={handleMarkAllAsRead}
          >
            Đánh dấu tất cả là đã đọc
          </Button>
        )}
      </Box>

      {/* Filter and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <ToggleButtonGroup
            value={filterStatus}
            exclusive
            onChange={(e, value) => setFilterStatus(value)}
            size="small"
          >
            <ToggleButton value="all">Tất cả</ToggleButton>
            <ToggleButton value="unread">Chưa đọc</ToggleButton>
            <ToggleButton value="read">Đã đọc</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Empty State */}
      {filteredNotifications.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <NotificationsIcon
            sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary">
            {searchTerm || filterStatus !== "all"
              ? "Không tìm thấy thông báo"
              : "Không có thông báo nào"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bạn sẽ nhận thông báo khi có hoạt động mới
          </Typography>
        </Box>
      )}

      {/* Notifications List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredNotifications.map((notification) => (
          <Card
            key={notification._id}
            sx={{
              bgcolor: !notification.is_read
                ? getNotificationColor(notification.notification_type)
                : "background.paper",
              p: 2,
              transition: "all 0.3s",
              "&:hover": {
                boxShadow: 3,
              },
              position: "relative",
              borderLeft: !notification.is_read ? "4px solid #2196f3" : "none",
            }}
          >
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ mt: 1 }}>
                {getNotificationIcon(notification.notification_type || "info")}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {notification.notification_title}
                  </Typography>
                  {!notification.is_read && (
                    <Chip label="Chưa đọc" size="small" color="primary" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {notification.notification_content}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <ScheduleIcon
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.createdAt).toLocaleString("vi-VN")}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                {!notification.is_read && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    Đã đọc
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteNotification(notification._id)}
                >
                  Xóa
                </Button>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default TeacherNotifications;
