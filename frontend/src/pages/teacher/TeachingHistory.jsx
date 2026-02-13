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
  TextField,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const TeachingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchTeachingHistory();
  }, []);

  const fetchTeachingHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/teacher/teaching-history");
      setHistory(response.data.data || []);
    } catch (error) {
      console.error("Fetch teaching history error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải lịch sử giảng dạy",
      );
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecord(null);
  };

  const handleDownloadCertificate = async (recordId) => {
    try {
      const response = await axios.get(
        `/api/teacher/teaching-history/${recordId}/certificate`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "certificate.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (error) {
      toast.error("Lỗi tải chứng chỉ");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ongoing: "info",
      completed: "success",
      archived: "default",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      ongoing: "Đang Diễn Ra",
      completed: "Hoàn Thành",
      archived: "Lưu Trữ",
    };
    return labels[status] || status;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
          Lịch Sử Giảng Dạy
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Xem lịch sử hướng dẫn và giảng dạy các đề tài
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : history.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="textSecondary">
            Không có lịch sử giảng dạy nào
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
                      Tổng Đề Tài
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {history.length}
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
                      Đang Dạy
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {history.filter((h) => h.status === "ongoing").length}
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
                      {history.filter((h) => h.status === "completed").length}
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
                      Đánh Giá Trung Bình
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {history.length > 0
                        ? (
                            history.reduce(
                              (sum, h) => sum + (h.average_score || 0),
                              0,
                            ) / history.length
                          ).toFixed(1)
                        : "-"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Danh sách lịch sử */}
          <Grid item xs={12}>
            <Paper sx={{ overflow: "hidden" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Đề Tài</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Sinh Viên</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Năm Học</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Điểm Số</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Hành Động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {record.topic_title}
                            </Typography>
                            {record.category && (
                              <Chip
                                label={record.category}
                                size="small"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {record.student_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {record.student_id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {record.academic_year}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {record.average_score ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 45,
                                  height: 45,
                                  borderRadius: "50%",
                                  backgroundColor:
                                    record.average_score >= 8
                                      ? "#c8e6c9"
                                      : record.average_score >= 6
                                        ? "#fff9c4"
                                        : "#ffccbc",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 600,
                                  fontSize: "0.9rem",
                                }}
                              >
                                {record.average_score.toFixed(1)}
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Chưa có
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(record.status)}
                            color={getStatusColor(record.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewDetail(record)}
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
        <DialogTitle>Chi Tiết Lịch Sử Giảng Dạy</DialogTitle>
        <DialogContent dividers>
          {selectedRecord && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Đề Tài
                </Typography>
                <Typography variant="body2">
                  {selectedRecord.topic_title}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Sinh Viên
                </Typography>
                <Typography variant="body2">
                  {selectedRecord.student_name} ({selectedRecord.student_id})
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Năm Học
                </Typography>
                <Typography variant="body2">
                  {selectedRecord.academic_year}
                </Typography>
              </Box>

              {selectedRecord.start_date && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Thời Gian Hướng Dẫn
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedRecord.start_date).toLocaleDateString(
                      "vi-VN",
                    )}{" "}
                    -{" "}
                    {selectedRecord.end_date
                      ? new Date(selectedRecord.end_date).toLocaleDateString(
                          "vi-VN",
                        )
                      : "Đang diễn ra"}
                  </Typography>
                </Box>
              )}

              {selectedRecord.average_score && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Điểm Số
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    {selectedRecord.average_score.toFixed(1)}/10
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Trạng Thái
                </Typography>
                <Chip
                  label={getStatusLabel(selectedRecord.status)}
                  color={getStatusColor(selectedRecord.status)}
                />
              </Box>

              {selectedRecord.description && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Mô Tả
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
                    <Typography variant="body2">
                      {selectedRecord.description}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {selectedRecord.status === "completed" && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() =>
                      handleDownloadCertificate(selectedRecord._id)
                    }
                  >
                    Tải Chứng Chỉ
                  </Button>
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

export default TeachingHistory;
