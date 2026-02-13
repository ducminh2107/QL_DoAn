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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Edit as EditIcon, Visibility as ViewIcon } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const RubricEvaluation = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEval, setOpenEval] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rubrics, setRubrics] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/teacher/rubric-evaluations");
      setEvaluations(response.data.data || []);
    } catch (error) {
      console.error("Fetch rubric evaluations error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải bảng đánh giá",
      );
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEval = (student) => {
    setSelectedStudent(student);
    setScores({});
    setOpenEval(true);
    fetchRubrics(student.topic_id);
  };

  const fetchRubrics = async (topicId) => {
    try {
      const response = await axios.get(`/api/rubrics/${topicId}`);
      setRubrics(response.data.data || []);
    } catch (error) {
      console.error("Fetch rubrics error:", error);
    }
  };

  const handleCloseEval = () => {
    setOpenEval(false);
    setSelectedStudent(null);
    setRubrics([]);
  };

  const handleScoreChange = (rubricId, value) => {
    setScores({
      ...scores,
      [rubricId]: value,
    });
  };

  const handleSubmitEval = async () => {
    try {
      await axios.post(
        `/api/teacher/rubric-evaluations/${selectedStudent._id}`,
        { scores },
      );
      toast.success("Lưu đánh giá thành công");
      handleCloseEval();
      fetchEvaluations();
    } catch (error) {
      toast.error("Lỗi lưu đánh giá");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
          Đánh Giá Theo Rubric
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Đánh giá bài làm sinh viên theo các tiêu chí và thang điểm
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : evaluations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="textSecondary">
            Không có sinh viên cần đánh giá
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Thống kê */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
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
                      {evaluations.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Đã Đánh Giá
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {evaluations.filter((e) => e.evaluated).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Chưa Đánh Giá
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {evaluations.filter((e) => !e.evaluated).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Danh sách sinh viên */}
          <Grid item xs={12}>
            <Paper sx={{ overflow: "hidden" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Sinh Viên</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Đề Tài</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Điểm Trung Bình
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Hành Động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {evaluations.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {item.student_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {item.student_id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.topic_title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {item.evaluated ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: "50%",
                                  backgroundColor: "#e3f2fd",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 600,
                                  color: "#2196f3",
                                }}
                              >
                                {item.average_score?.toFixed(1)}
                              </Box>
                              <Typography variant="body2">/10</Typography>
                            </Box>
                          ) : (
                            <Chip label="Chưa đánh giá" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {item.evaluated ? (
                            <Chip
                              label="Hoàn thành"
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Chip
                              label="Chờ đánh giá"
                              color="warning"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={
                              item.evaluated ? <ViewIcon /> : <EditIcon />
                            }
                            onClick={() => handleOpenEval(item)}
                          >
                            {item.evaluated ? "Xem" : "Đánh Giá"}
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

      {/* Dialog đánh giá */}
      <Dialog open={openEval} onClose={handleCloseEval} maxWidth="sm" fullWidth>
        <DialogTitle>Đánh Giá Rubric</DialogTitle>
        <DialogContent dividers>
          {selectedStudent && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Sinh Viên
                </Typography>
                <Typography variant="body2">
                  {selectedStudent.student_name} ({selectedStudent.student_id})
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Đề Tài
                </Typography>
                <Typography variant="body2">
                  {selectedStudent.topic_title}
                </Typography>
              </Box>

              {/* Rubric scores */}
              {rubrics.length > 0 ? (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Đánh Giá Theo Tiêu Chí
                  </Typography>
                  {rubrics.map((rubric) => (
                    <Box key={rubric._id} sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        {rubric.criteria_name || rubric.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ mb: 1 }}
                      >
                        {rubric.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Rating
                          value={scores[rubric._id] || 0}
                          max={10}
                          onChange={(e, value) =>
                            handleScoreChange(rubric._id, value)
                          }
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Không có tiêu chí đánh giá
                </Typography>
              )}

              {/* Ghi chú */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Ghi Chú Thêm
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Nhập ghi chú..."
                  size="small"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEval}>Hủy</Button>
          <Button
            onClick={handleSubmitEval}
            variant="contained"
            color="primary"
          >
            Lưu Đánh Giá
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RubricEvaluation;
