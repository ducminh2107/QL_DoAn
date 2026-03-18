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
  useTheme,
  alpha,
} from "@mui/material";
import {
  Grade as GradeIcon,
  AutoGraph as AutoGraphIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const Grades = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();

  // Safe colors
  const primaryMain = theme.palette?.primary?.main || "#1976d2";
  const successMain = theme.palette?.success?.main || "#2e7d32";
  const infoMain = theme.palette?.info?.main || "#1e88e5";
  const warningMain = theme.palette?.warning?.main || "#ed6c02";
  const errorMain = theme.palette?.error?.main || "#d32f2f";

  const getGradeColor = (score) => {
    if (score >= 8.5) return successMain; // Xuất sắc
    if (score >= 7) return infoMain; // Tốt
    if (score >= 5) return warningMain; // Đạt
    return errorMain; // Chưa đạt
  };

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

  const getGradeLabel = (score) => {
    if (score >= 8.5) return "Xuất sắc";
    if (score >= 7) return "Tốt";
    if (score >= 5) return "Đạt";
    return "Chưa đạt";
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
            <AutoGraphIcon sx={{ fontSize: "3.5rem", opacity: 0.9 }} />
            Điểm Số & Nhận Xét
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, fontWeight: 400, maxWidth: "600px" }}
          >
            Theo dõi kết quả đánh giá và những góp ý tận tâm từ giảng viên hướng
            dẫn của bạn.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, position: "relative", zIndex: 1 }}>
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
                  sx={{
                    borderRadius: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
                    "&:hover": {
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
                      transform: "translateY(-4px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  elevation={0}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 4,
                      }}
                    >
                      {/* Cột Trái / Khung 2: Topic Info & Details */}
                      <Box sx={{ flex: { xs: 1, md: 2 }, minWidth: 0 }}>
                        <Box sx={{ mb: 4 }}>
                          <Typography
                            variant="overline"
                            sx={{
                              color: primaryMain,
                              fontWeight: 800,
                              letterSpacing: 1.5,
                            }}
                          >
                            Đề tài
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 800,
                              color: "#1e293b",
                              mt: 1,
                              mb: 1,
                              lineHeight: 1.4,
                            }}
                          >
                            {topic.topic_title}
                          </Typography>
                          {topic.teacher_name && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography
                                variant="body2"
                                color="#64748b"
                                sx={{ fontWeight: 500 }}
                              >
                                Giảng viên hướng dẫn:
                              </Typography>
                              <Chip
                                label={topic.teacher_name}
                                size="small"
                                sx={{
                                  bgcolor: alpha(primaryMain, 0.1),
                                  color: primaryMain,
                                  fontWeight: 700,
                                  borderRadius: "8px",
                                }}
                              />
                            </Box>
                          )}
                        </Box>

                        {/* Rubric/Chi tiết điểm */}
                        {topic.rubric_scores &&
                        topic.rubric_scores.length > 0 ? (
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 800, mb: 2, color: "#1e293b" }}
                            >
                              Điểm Chi Tiết Theo Tiêu Chí
                            </Typography>
                            <Box
                              sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: "16px",
                                overflow: "hidden",
                              }}
                            >
                              <TableContainer>
                                <Table size="medium">
                                  <TableHead>
                                    <TableRow
                                      sx={{ backgroundColor: "#f8fafc" }}
                                    >
                                      <TableCell
                                        sx={{
                                          fontWeight: 700,
                                          color: "#475569",
                                        }}
                                      >
                                        Tiêu Chí Đánh Giá
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: 700,
                                          color: "#475569",
                                          width: "100px",
                                        }}
                                      >
                                        Điểm
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontWeight: 700,
                                          color: "#475569",
                                        }}
                                      >
                                        Nhận xét
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {topic.rubric_scores.map((rubric, idx) => (
                                      <TableRow
                                        key={idx}
                                        sx={{
                                          "&:last-child td": { border: 0 },
                                        }}
                                      >
                                        <TableCell
                                          sx={{
                                            fontWeight: 600,
                                            color: "#1e293b",
                                          }}
                                        >
                                          {rubric.criteria}
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontWeight: 800,
                                              color: primaryMain,
                                            }}
                                          >
                                            {rubric.score}
                                            <span
                                              style={{
                                                color: "#94a3b8",
                                                fontWeight: 500,
                                              }}
                                            >
                                              /{rubric.max_score || 10}
                                            </span>
                                          </Typography>
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            color: "#64748b",
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          {rubric.comment || "-"}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Box>
                        ) : null}
                      </Box>

                      {/* Cột Phải / Khung 1: Score & Feedback */}
                      <Box
                        sx={{
                          flex: { xs: 1, md: 1 },
                          minWidth: { md: "350px" },
                          maxWidth: { md: "450px" },
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: "#f8fafc",
                            p: 3,
                            borderRadius: "20px",
                            height: "100%",
                            border: "1px solid #f1f5f9",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {topic.final_score !== undefined && (
                            <Box sx={{ textAlign: "center", mb: 4 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  color: "#64748b",
                                  fontWeight: 700,
                                  mb: 2,
                                  textTransform: "uppercase",
                                  letterSpacing: 1,
                                }}
                              >
                                Tổng điểm
                              </Typography>
                              <Box
                                sx={{
                                  width: 120,
                                  height: 120,
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg, ${getGradeColor(topic.final_score)} 0%, ${alpha(getGradeColor(topic.final_score), 0.8)} 100%)`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  mx: "auto",
                                  boxShadow: `0 15px 30px ${alpha(getGradeColor(topic.final_score), 0.3)}`,
                                  mb: 2,
                                }}
                              >
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography
                                    variant="h3"
                                    sx={{ fontWeight: 900, lineHeight: 1 }}
                                  >
                                    {topic.final_score.toFixed(1)}
                                  </Typography>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ opacity: 0.8, fontWeight: 600 }}
                                  >
                                    /10
                                  </Typography>
                                </Box>
                              </Box>
                              <Chip
                                label={getGradeLabel(topic.final_score)}
                                sx={{
                                  fontWeight: 800,
                                  px: 2,
                                  py: 2.5,
                                  borderRadius: "14px",
                                  fontSize: "0.875rem",
                                  bgcolor: alpha(
                                    getGradeColor(topic.final_score),
                                    0.1,
                                  ),
                                  color: getGradeColor(topic.final_score),
                                  border: `1px solid ${alpha(getGradeColor(topic.final_score), 0.2)}`,
                                }}
                              />
                            </Box>
                          )}

                          {/* Nhận xét chung */}
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: "#64748b",
                                fontWeight: 700,
                                mb: 2,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                              }}
                            >
                              Nhận Xét Chung
                            </Typography>

                            {topic.feedback && topic.feedback.length > 0 ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 2,
                                }}
                              >
                                {topic.feedback.map((feedback, idx) => (
                                  <Paper
                                    key={idx}
                                    elevation={0}
                                    sx={{
                                      p: 2,
                                      bgcolor: "white",
                                      borderRadius: "16px",
                                      border: "1px solid #e2e8f0",
                                      boxShadow:
                                        "0 4px 6px -1px rgba(0,0,0,0.02)",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mb: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          fontWeight: 800,
                                          color: "#1e293b",
                                        }}
                                      >
                                        {feedback.reviewer_name || "Giảng viên"}
                                      </Typography>
                                      {feedback.rating && (
                                        <Rating
                                          value={feedback.rating}
                                          readOnly
                                          size="small"
                                        />
                                      )}
                                    </Box>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#94a3b8",
                                        display: "block",
                                        mb: 1,
                                        fontWeight: 500,
                                      }}
                                    >
                                      {new Date(
                                        feedback.created_at,
                                      ).toLocaleDateString("vi-VN")}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#475569", lineHeight: 1.6 }}
                                    >
                                      "{feedback.comment}"
                                    </Typography>
                                  </Paper>
                                ))}
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  textAlign: "center",
                                  py: 4,
                                  bgcolor: "white",
                                  borderRadius: "16px",
                                  border: "1px dashed #cbd5e1",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="#94a3b8"
                                  sx={{ fontStyle: "italic", fontWeight: 500 }}
                                >
                                  Chưa có nhận xét tổng hợp
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Grades;
