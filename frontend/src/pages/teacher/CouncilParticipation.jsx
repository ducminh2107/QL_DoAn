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
} from "@mui/material";
import { Visibility as ViewIcon, Info as InfoIcon } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const CouncilParticipation = () => {
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCouncil, setSelectedCouncil] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchCouncils();
  }, []);

  const fetchCouncils = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/teacher/councils");
      setCouncils(response.data.data || []);
    } catch (error) {
      console.error("Fetch councils error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách hội đồng",
      );
      setCouncils([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (council) => {
    setSelectedCouncil(council);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCouncil(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "info",
      in_progress: "warning",
      completed: "success",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: "Lên Lịch",
      in_progress: "Đang Thực Hiện",
      completed: "Hoàn Thành",
      cancelled: "Đã Hủy",
    };
    return labels[status] || status;
  };

  const getRoleLabel = (role) => {
    const labels = {
      chair: "Chủ Tịch",
      member: "Thành Viên",
      secretary: "Thư Ký",
    };
    return labels[role] || role;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
          Tham Gia Hội Đồng
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Quản lý tham gia của bạn trong các hội đồng đánh giá
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : councils.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="textSecondary">
            Bạn chưa tham gia hội đồng nào
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Thống kê */}
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
                      Tổng Hội Đồng
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {councils.length}
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
                      Đang Lên Lịch
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {councils.filter((c) => c.status === "scheduled").length}
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
                      Đang Thực Hiện
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {
                        councils.filter((c) => c.status === "in_progress")
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
                      Hoàn Thành
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {councils.filter((c) => c.status === "completed").length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Danh sách */}
          <Grid item xs={12}>
            <Paper sx={{ overflow: "hidden" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Tên Hội Đồng
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Vai Trò</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Ngày</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Hành Động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {councils.map((council) => (
                      <TableRow key={council._id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {council.council_name || council.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getRoleLabel(council.role)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {council.meeting_date
                            ? new Date(council.meeting_date).toLocaleDateString(
                                "vi-VN",
                              )
                            : "Chưa xác định"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(council.status)}
                            color={getStatusColor(council.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewDetail(council)}
                          >
                            Chi Tiết
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
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi Tiết Hội Đồng</DialogTitle>
        <DialogContent dividers>
          {selectedCouncil && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Tên Hội Đồng
                </Typography>
                <Typography variant="body2">
                  {selectedCouncil.council_name || selectedCouncil.name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Vai Trò Của Bạn
                </Typography>
                <Chip
                  label={getRoleLabel(selectedCouncil.role)}
                  size="small"
                  color="primary"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Ngày Họp
                </Typography>
                <Typography variant="body2">
                  {selectedCouncil.meeting_date
                    ? new Date(selectedCouncil.meeting_date).toLocaleString(
                        "vi-VN",
                      )
                    : "Chưa xác định"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Địa Điểm
                </Typography>
                <Typography variant="body2">
                  {selectedCouncil.location || "Chưa xác định"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Trạng Thái
                </Typography>
                <Chip
                  label={getStatusLabel(selectedCouncil.status)}
                  color={getStatusColor(selectedCouncil.status)}
                />
              </Box>

              {selectedCouncil.members &&
                selectedCouncil.members.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Thành Viên
                    </Typography>
                    {selectedCouncil.members.map((member, idx) => (
                      <Typography key={idx} variant="body2">
                        • {member.name} - {getRoleLabel(member.role)}
                      </Typography>
                    ))}
                  </Box>
                )}

              {selectedCouncil.description && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Mô Tả
                  </Typography>
                  <Typography variant="body2">
                    {selectedCouncil.description}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CouncilParticipation;
