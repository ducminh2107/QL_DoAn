import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const RegistrationHistory = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);

  useEffect(() => {
    fetchRegistrationHistory();
  }, []);

  const fetchRegistrationHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/student/registration-history");
      setRegistrations(response.data.data || []);
    } catch (error) {
      console.error("Fetch registration history error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải lịch sử đăng ký",
      );
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedRegistration(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      registered: "success",
      pending: "warning",
      approved: "success",
      rejected: "error",
      cancelled: "error",
      completed: "info",
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
      case "completed":
        return <CheckCircleIcon />;
      case "rejected":
      case "cancelled":
        return <CancelIcon />;
      case "pending":
      default:
        return <ScheduleIcon />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      registered: "Đăng ký thành công",
      pending: "Chờ phê duyệt",
      approved: "Đã chấp nhận",
      rejected: "Bị từ chối",
      cancelled: "Đã hủy",
      completed: "Hoàn thành",
    };
    return labels[status] || status;
  };

  const getPeriodStatus = (period) => {
    const now = new Date();
    const startDate = new Date(period.start_date);
    const endDate = new Date(period.end_date);

    if (now < startDate) return "upcoming";
    if (now > endDate) return "closed";
    return "active";
  };

  const getPeriodStatusLabel = (status) => {
    const labels = {
      active: "Đang mở",
      upcoming: "Sắp bắt đầu",
      closed: "Đã đóng",
    };
    return labels[status] || status;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
          Lịch Sử Đăng Ký
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Xem lịch sử đăng ký đề tài trong các học kỳ và năm học
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : registrations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="textSecondary">
            Bạn chưa có lịch sử đăng ký nào
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Thống kê tổng quan */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Tổng Đăng Ký
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {registrations.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Đã Chấp Nhận
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {
                        registrations.filter(
                          (r) =>
                            r.status === "approved" || r.status === "completed",
                        ).length
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Đang Chờ
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {
                        registrations.filter((r) => r.status === "pending")
                          .length
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Từ Chối
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {
                        registrations.filter(
                          (r) =>
                            r.status === "rejected" || r.status === "cancelled",
                        ).length
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Bảng lịch sử */}
          <Grid item xs={12}>
            <Paper sx={{ overflow: "hidden" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Học Kỳ / Năm
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Đề Tài</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Giảng Viên</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Hành Động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {registrations.map((registration) => (
                      <TableRow
                        key={registration._id}
                        sx={{
                          "&:hover": { backgroundColor: "#f5f5f5" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {registration.semester_name ||
                                registration.semester}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {registration.academic_year ||
                                new Date(registration.created_at).getFullYear()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {registration.topic_title}
                            </Typography>
                            {registration.topic_category && (
                              <Chip
                                label={registration.topic_category}
                                size="small"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {registration.teacher_name || "Chưa phân công"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(registration.status)}
                            label={getStatusLabel(registration.status)}
                            color={getStatusColor(registration.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => handleViewDetails(registration)}
                          >
                            Xem Chi Tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Dialog chi tiết */}
      <Dialog
        open={openDetails}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi Tiết Đăng Ký</DialogTitle>
        <DialogContent dividers>
          {selectedRegistration && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Alert icon={<InfoIcon />} severity="info">
                Đăng ký vào lúc{" "}
                {new Date(selectedRegistration.created_at).toLocaleString(
                  "vi-VN",
                )}
              </Alert>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Học Kỳ / Năm
                </Typography>
                <Typography variant="body2">
                  {selectedRegistration.semester_name ||
                    selectedRegistration.semester}
                  {selectedRegistration.academic_year &&
                    ` (${selectedRegistration.academic_year})`}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Đề Tài
                </Typography>
                <Typography variant="body2">
                  {selectedRegistration.topic_title}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Giảng Viên Hướng Dẫn
                </Typography>
                <Typography variant="body2">
                  {selectedRegistration.teacher_name || "Chưa phân công"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Trạng Thái
                </Typography>
                <Chip
                  label={getStatusLabel(selectedRegistration.status)}
                  color={getStatusColor(selectedRegistration.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>

              {selectedRegistration.rejection_reason && (
                <Alert severity="error">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Lý do từ chối
                  </Typography>
                  <Typography variant="body2">
                    {selectedRegistration.rejection_reason}
                  </Typography>
                </Alert>
              )}

              {selectedRegistration.notes && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Ghi Chú
                  </Typography>
                  <Typography variant="body2">
                    {selectedRegistration.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegistrationHistory;
