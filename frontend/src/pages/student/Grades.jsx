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
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";

const Grades = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/student/grades");
      setTopics(response.data.data || []);
    } catch (error) {
      console.error("Fetch grades error:", error);
      toast.error(error.response?.data?.message || "Không thể tải điểm số");
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFeedback(null);
  };

  const getGradeColor = (score) => {
    if (score >= 8.5) return "#4caf50"; // Xuất sắc
    if (score >= 7) return "#2196f3"; // Tốt
    if (score >= 5) return "#ff9800"; // Đạt
    return "#f44336"; // Chưa đạt
  };

  const getGradeLabel = (score) => {
    if (score >= 8.5) return "Xuất sắc";
    if (score >= 7) return "Tốt";
    if (score >= 5) return "Đạt";
    return "Chưa đạt";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
          Điểm Số & Nhận Xét
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Xem điểm số và nhận xét từ giảng viên hướng dẫn
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : topics.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="textSecondary">
            Chưa có đánh giá hoặc điểm số nào
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {topics.map((topic) => (
            <Grid item xs={12} key={topic._id}>
              <Card
                sx={{ "&:hover": { boxShadow: 4 }, transition: "all 0.3s" }}
              >
                <CardContent>
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      mb: 2,
                      pb: 2,
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {topic.topic_title}
                      </Typography>
                      {topic.teacher_name && (
                        <Typography variant="body2" color="textSecondary">
                          GVHD: {topic.teacher_name}
                        </Typography>
                      )}
                    </Box>
                    {topic.final_score !== undefined && (
                      <Box sx={{ textAlign: "center" }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            backgroundColor: getGradeColor(topic.final_score),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          <Box sx={{ textAlign: "center" }}>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                              {topic.final_score.toFixed(1)}
                            </Typography>
                            <Typography variant="caption">/10</Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={getGradeLabel(topic.final_score)}
                          sx={{ mt: 1 }}
                          color={topic.final_score >= 7 ? "success" : "warning"}
                          size="small"
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Rubric/Chi tiết điểm */}
                  {topic.rubric_scores && topic.rubric_scores.length > 0 ? (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 2 }}
                      >
                        Điểm Chi Tiết Theo Tiêu Chí
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Tiêu Chí
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                Điểm
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                Trọng Số
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {topic.rubric_scores.map((rubric, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{rubric.criteria}</TableCell>
                                <TableCell align="right">
                                  {rubric.score}/10
                                </TableCell>
                                <TableCell align="right">
                                  {rubric.weight || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ) : null}

                  {/* Nhận xét chung */}
                  {topic.feedback && topic.feedback.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 2 }}
                      >
                        Nhận Xét & Góp Ý
                      </Typography>
                      {topic.feedback.map((feedback, idx) => (
                        <Card
                          key={idx}
                          variant="outlined"
                          sx={{ mb: 2, backgroundColor: "#fafafa" }}
                        >
                          <CardContent sx={{ pb: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "start",
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {feedback.reviewer_name || "Giảng viên"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {new Date(
                                    feedback.created_at,
                                  ).toLocaleDateString("vi-VN")}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ mt: 1, lineHeight: 1.6 }}
                                >
                                  {feedback.comment}
                                </Typography>
                              </Box>
                              {feedback.rating && (
                                <Box sx={{ ml: 2 }}>
                                  <Rating
                                    value={feedback.rating}
                                    readOnly
                                    size="small"
                                  />
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}

                  {!topic.feedback || topic.feedback.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      Chưa có nhận xét
                    </Typography>
                  ) : null}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog chi tiết */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi Tiết Nhận Xét</DialogTitle>
        <DialogContent dividers>
          {selectedFeedback && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Người đánh giá
                </Typography>
                <Typography variant="body2">
                  {selectedFeedback.reviewer_name || "Giảng viên"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Ngày đánh giá
                </Typography>
                <Typography variant="body2">
                  {new Date(selectedFeedback.created_at).toLocaleDateString(
                    "vi-VN",
                  )}
                </Typography>
              </Box>
              {selectedFeedback.rating && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Đánh giá
                  </Typography>
                  <Rating value={selectedFeedback.rating} readOnly />
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Nhận xét
                </Typography>
                <Typography variant="body2">
                  {selectedFeedback.comment}
                </Typography>
              </Box>
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

export default Grades;
