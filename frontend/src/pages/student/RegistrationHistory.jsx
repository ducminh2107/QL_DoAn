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
  useTheme,
  alpha,
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

  const theme = useTheme();

  // Mảng màu an toàn
  const primaryMain = theme.palette?.primary?.main || "#1976d2";
  const successMain = theme.palette?.success?.main || "#2e7d32";
  const warningMain = theme.palette?.warning?.main || "#ed6c02";
  const errorMain = theme.palette?.error?.main || "#d32f2f";

  const glassCardSx = {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
  };

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

  const headerGradientSx = {
    background: `linear-gradient(135deg, ${primaryMain} 0%, ${alpha(primaryMain, 0.8)} 100%)`,
    pt: 6,
    pb: 12,
    color: "white",
    borderRadius: { xs: 0, md: "0 0 32px 32px" },
    boxShadow: `0 10px 30px -10px ${alpha(primaryMain, 0.4)}`,
    mb: -8,
    position: "relative",
    zIndex: 0,
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 8 }}>
      {/* Header Banner */}
      <Box sx={headerGradientSx}>
        <Container maxWidth="xl">
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
            <ScheduleIcon sx={{ fontSize: "3.5rem", opacity: 0.9 }} />
            Lịch Sử Đăng Ký
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, fontWeight: 400, maxWidth: "600px" }}
          >
            Theo dõi, kiểm tra lại quá trình và trạng thái đăng ký của tất cả
            các đề tài mà bạn đã từng tham gia.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, position: "relative", zIndex: 1 }}>
        {loading ? (
          <LinearProgress />
        ) : registrations.length === 0 ? (
          <Paper
            sx={{
              ...glassCardSx,
              p: 4,
              textAlign: "center",
              borderRadius: "24px",
            }}
            elevation={0}
          >
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
                  <Card
                    sx={{
                      ...glassCardSx,
                      transition: "transform 0.3s",
                      "&:hover": { transform: "translateY(-4px)" },
                    }}
                    elevation={0}
                  >
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Tổng Đăng Ký
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 800, color: primaryMain }}
                      >
                        {registrations.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      ...glassCardSx,
                      transition: "transform 0.3s",
                      "&:hover": { transform: "translateY(-4px)" },
                    }}
                    elevation={0}
                  >
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Đã Chấp Nhận
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 800, color: successMain }}
                      >
                        {
                          registrations.filter(
                            (r) =>
                              r.status === "approved" ||
                              r.status === "completed",
                          ).length
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      ...glassCardSx,
                      transition: "transform 0.3s",
                      "&:hover": { transform: "translateY(-4px)" },
                    }}
                    elevation={0}
                  >
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Đang Chờ
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 800, color: warningMain }}
                      >
                        {
                          registrations.filter((r) => r.status === "pending")
                            .length
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      ...glassCardSx,
                      transition: "transform 0.3s",
                      "&:hover": { transform: "translateY(-4px)" },
                    }}
                    elevation={0}
                  >
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Từ Chối
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 800, color: errorMain }}
                      >
                        {
                          registrations.filter(
                            (r) =>
                              r.status === "rejected" ||
                              r.status === "cancelled",
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
              <Paper sx={{ ...glassCardSx, overflow: "hidden" }} elevation={0}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Học Kỳ / Năm
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Đề Tài</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Giảng Viên
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Trạng Thái
                        </TableCell>
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
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {registration.academic_year ||
                                  new Date(
                                    registration.created_at,
                                  ).getFullYear()}
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
                              variant="contained"
                              onClick={() => handleViewDetails(registration)}
                              sx={{
                                textTransform: "none",
                                borderRadius: "10px",
                                fontWeight: 600,
                              }}
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
    </Box>
  );
};

export default RegistrationHistory;
