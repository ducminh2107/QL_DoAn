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
  AlertTitle,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const ProgressMonitoring = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchStudentsProgress();
  }, []);

  const fetchStudentsProgress = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/teacher/students-progress");
      setStudents(response.data.data || []);
    } catch (error) {
      console.error("Fetch students progress error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải tiến độ sinh viên",
      );
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "success";
    if (progress >= 50) return "warning";
    return "error";
  };

  const getRiskLevel = (student) => {
    if (student.progress >= 80) return "low";
    if (student.progress >= 50) return "medium";
    return "high";
  };

  const getRiskLabel = (level) => {
    const labels = {
      low: "Thấp",
      medium: "Trung Bình",
      high: "Cao",
    };
    return labels[level] || level;
  };

  const getRiskColor = (level) => {
    const colors = {
      low: "success",
      medium: "warning",
      high: "error",
    };
    return colors[level] || "default";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
          Theo Dõi Tiến Độ Sinh Viên
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Giám sát tiến độ thực hiện đề tài của các sinh viên được hướng dẫn
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : students.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="textSecondary">
            Bạn không có sinh viên nào cần theo dõi
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
                      Tổng Sinh Viên
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {students.length}
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
                      Tiến Độ Tốt (≥80%)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {students.filter((s) => s.progress >= 80).length}
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
                      Tiến Độ Trung Bình
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {
                        students.filter(
                          (s) => s.progress >= 50 && s.progress < 80,
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
                      Tiến Độ Thấp (&lt;50%)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {students.filter((s) => s.progress < 50).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Danh sách theo dõi */}
          <Grid item xs={12}>
            <Paper sx={{ overflow: "hidden" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Sinh Viên</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Đề Tài</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tiến Độ</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Rủi Ro</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Hành Động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {student.student_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {student.student_id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.topic_title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box sx={{ flex: 1, minWidth: 100 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {student.progress}%
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  height: 6,
                                  borderRadius: 4,
                                  backgroundColor: "#e0e0e0",
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  sx={{
                                    height: "100%",
                                    width: `${student.progress}%`,
                                    backgroundColor:
                                      student.progress >= 80
                                        ? "#4caf50"
                                        : student.progress >= 50
                                          ? "#ff9800"
                                          : "#f44336",
                                    transition: "width 0.3s",
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getRiskLabel(getRiskLevel(student))}
                            color={getRiskColor(getRiskLevel(student))}
                            size="small"
                            icon={
                              getRiskLevel(student) === "high" ? (
                                <WarningIcon />
                              ) : undefined
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewDetail(student)}
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
        <DialogTitle>Chi Tiết Tiến Độ Sinh Viên</DialogTitle>
        <DialogContent dividers>
          {selectedStudent && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {getRiskLevel(selectedStudent) === "high" && (
                <Alert severity="error">
                  <AlertTitle>Cảnh Báo: Tiến Độ Thấp</AlertTitle>
                  Sinh viên này có tiến độ dưới 50%, cần được hỗ trợ để hoàn
                  thành đề tài
                </Alert>
              )}

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Sinh Viên
                </Typography>
                <Typography variant="body2">
                  {selectedStudent.student_name} ({selectedStudent.student_id})
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Đề Tài
                </Typography>
                <Typography variant="body2">
                  {selectedStudent.topic_title}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Tiến Độ Chung
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={selectedStudent.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                      color={getProgressColor(selectedStudent.progress)}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, minWidth: 45 }}
                  >
                    {selectedStudent.progress}%
                  </Typography>
                </Box>
              </Box>

              {selectedStudent.last_submission && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Lần Nộp Cuối Cùng
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedStudent.last_submission).toLocaleString(
                      "vi-VN",
                    )}
                  </Typography>
                </Box>
              )}

              {selectedStudent.expected_completion && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Dự Kiến Hoàn Thành
                  </Typography>
                  <Typography variant="body2">
                    {new Date(
                      selectedStudent.expected_completion,
                    ).toLocaleDateString("vi-VN")}
                  </Typography>
                </Box>
              )}

              {selectedStudent.notes && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Ghi Chú
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
                    <Typography variant="body2">
                      {selectedStudent.notes}
                    </Typography>
                  </Paper>
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

export default ProgressMonitoring;
