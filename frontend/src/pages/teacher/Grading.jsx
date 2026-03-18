import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Alert,
} from "@mui/material";
import {
  Grade as GradeIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const GradingPage = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [gradingData, setGradingData] = useState({
    pending: [],
    graded: [],
    history: [],
  });
  const [gradingDialog, setGradingDialog] = useState({
    open: false,
    topic: null,
    rubric: null,
    evaluations: [],
    comments: "",
  });
  const [gradingHistory, setGradingHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    topic: null,
  });

  useEffect(() => {
    loadGradingData();
  }, [tabValue]);

  const loadGradingData = async () => {
    try {
      setLoading(true);

      const [pendingRes, historyRes] = await Promise.all([
        axios.get("/api/teacher/grading/topics?type=instructor"),
        axios.get("/api/teacher/grading/history?limit=5"),
      ]);

      setGradingData({
        pending:
          pendingRes.data.data?.filter((t) => t.grading_status === "pending") ||
          [],
        graded:
          pendingRes.data.data?.filter((t) => t.grading_status === "graded") ||
          [],
        history: historyRes.data.data || [],
      });

      setStats(historyRes.data.stats || {});
      setGradingHistory(historyRes.data.data || []);
    } catch (error) {
      console.error("Failed to load grading data:", error);
      toast.error("Không thể tải dữ liệu chấm điểm");
    } finally {
      setLoading(false);
    }
  };

  const handleStartGrading = async (topic) => {
    try {
      // Load rubric chung từ admin (dùng cho toàn bộ ngành)
      const rubricRes = await axios.get("/api/rubrics");
      const allRubrics = rubricRes.data.data || [];

      // Ưu tiên rubric loại "assembly", nếu không có thì lấy đầu tiên
      const rubric =
        allRubrics.find((r) => r.rubric_category === "assembly") ||
        allRubrics.find((r) => r.rubric_category === "instructor") ||
        allRubrics[0];

      if (!rubric) {
        toast.error("Chưa có rubric. Admin cần tạo rubric trước.");
        return;
      }

      // Thử lấy điểm đã chấm trước đó (nếu có)
      let existingEvals = null;
      try {
        const existingRes = await axios.get(
          `/api/teacher/grading/rubric/${topic._id}?type=instructor`,
        );
        existingEvals =
          existingRes.data.data?.existing_grading?.evaluations || null;
      } catch {
        // Chưa chấm lần nào — bình thường
      }

      // Build evaluations từ rubric admin
      const evaluations = rubric.rubric_evaluations.map((item) => {
        const prev = existingEvals?.find(
          (e) => String(e.rubric_item_id) === String(item._id),
        );
        return {
          rubric_item_id: item._id,
          criteria_name: item.evaluation_criteria,
          criteria_group: item.criteria_group || "",
          clo: item.clo || "",
          score: prev?.score || 0,
          comment: prev?.comment || "",
          max_score: item.weight || 1,
          level_core: item.level_core || [],
        };
      });

      setGradingDialog({
        open: true,
        topic: topic,
        rubric: rubric,
        evaluations,
        comments: "",
      });
    } catch {
      toast.error("Không thể tải rubric chấm điểm");
    }
  };

  const handleViewDetails = (topic) => {
    setDetailDialog({
      open: true,
      topic: topic,
    });
  };

  const handleSubmitGrades = async () => {
    try {
      await axios.post(
        `/api/teacher/grading/submit/${gradingDialog.topic._id}`,
        {
          type: "instructor",
          rubric_id: gradingDialog.rubric?._id,
          evaluations: gradingDialog.evaluations,
          comments: gradingDialog.comments,
          final_score: calculateTotalScore(),
        },
      );

      toast.success("Chấm điểm thành công");
      setGradingDialog({
        open: false,
        topic: null,
        rubric: null,
        evaluations: [],
        comments: "",
      });
      loadGradingData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Chấm điểm thất bại");
    }
  };

  const handleScoreChange = (index, value) => {
    const newEvaluations = [...gradingDialog.evaluations];
    newEvaluations[index].score = value;
    setGradingDialog((prev) => ({ ...prev, evaluations: newEvaluations }));
  };

  const handleCommentChange = (index, value) => {
    const newEvaluations = [...gradingDialog.evaluations];
    newEvaluations[index].comment = value;
    setGradingDialog((prev) => ({ ...prev, evaluations: newEvaluations }));
  };

  const calculateTotalScore = () => {
    return gradingDialog.evaluations.reduce(
      (sum, evalItem) => sum + (evalItem.score || 0),
      0,
    );
  };

  const getGradeColor = (score) => {
    if (score >= 9) return "success";
    if (score >= 8) return "info";
    if (score >= 7) return "warning";
    return "error";
  };

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 4,
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.2)",
          color: "white",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
          >
            Chấm Điểm Đề Tài
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Thực hiện đánh giá và cho điểm sinh viên dựa trên Rubric cài sẵn
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Chip
            icon={<PendingIcon />}
            label={`${gradingData.pending.length} cần chấm`}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
              border: "none",
            }}
          />
          <Chip
            icon={<CheckCircleIcon />}
            label={`${gradingData.graded.length} đã chấm`}
            sx={{
              bgcolor: "rgba(255,255,255,0.9)",
              color: "#059669",
              fontWeight: 600,
              border: "none",
            }}
          />
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="primary">
                {stats.total_graded || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng đã chấm
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="success.main">
                {stats.average_score ? stats.average_score.toFixed(2) : "0.00"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm trung bình
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="info.main">
                {stats.by_type?.instructor?.count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chấm hướng dẫn
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="secondary.main">
                {stats.by_type?.reviewer?.count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chấm phản biện
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          centered
        >
          <Tab label="Cần chấm điểm" />
          <Tab label="Đã chấm điểm" />
          <Tab label="Lịch sử chấm" />
        </Tabs>
      </Paper>

      {/* Content based on tab */}
      {tabValue === 0 && (
        <>
          {gradingData.pending.length === 0 ? (
            <Box sx={{ width: "100%", mt: 1 }}>
              <Paper
                sx={{
                  p: 6,
                  textAlign: "center",
                  width: "100%",
                  borderRadius: "16px",
                  border: "1px dashed #e2e8f0",
                  boxShadow: "none",
                  boxSizing: "border-box",
                }}
              >
                <CheckCircleIcon
                  sx={{ fontSize: 64, color: "#10b981", mb: 2, opacity: 0.9 }}
                />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#1e293b", mb: 1 }}
                >
                  Tuyệt vời! Không có đề tài nào cần chấm điểm
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tất cả các đề tài đã được bạn xử lý và chấm điểm xong.
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {gradingData.pending.map((topic) => (
                <Grid item xs={12} md={6} key={topic._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {topic.topic_title}
                      </Typography>
                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          label={topic.topic_category?.topic_category_title}
                          size="small"
                        />
                        <Chip
                          icon={<GroupIcon />}
                          label={`${topic.student_count} sinh viên`}
                          size="small"
                          variant="outlined"
                        />
                        {!topic.has_final_report && (
                          <Chip
                            label="Chưa nộp BC"
                            color="warning"
                            size="small"
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {topic.topic_description?.substring(0, 150)}...
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="caption" color="text.secondary">
                          Hạn chót:{" "}
                          {topic.defense_schedule?.scheduled_date
                            ? new Date(
                                topic.defense_schedule.scheduled_date,
                              ).toLocaleDateString("vi-VN")
                            : "Chưa có lịch"}
                        </Typography>
                        <Chip label="Chờ chấm" color="warning" size="small" />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<GradeIcon />}
                        onClick={() => handleStartGrading(topic)}
                      >
                        Bắt đầu chấm
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleViewDetails(topic)}
                      >
                        Xem chi tiết
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Đề tài</TableCell>
                <TableCell>Sinh viên</TableCell>
                <TableCell>Điểm</TableCell>
                <TableCell>Ngày chấm</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gradingData.graded.map((topic) => (
                <TableRow key={topic._id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {topic.topic_title}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {topic.topic_category?.topic_category_title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {topic.topic_group_student?.filter(
                        (s) => s.status === "approved",
                      ).length || 0}{" "}
                      sinh viên
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={topic.total_score?.toFixed(2) || "N/A"}
                      color={getGradeColor(topic.total_score || 0)}
                    />
                  </TableCell>
                  <TableCell>
                    {topic.rubric_instructor?.submitted_at
                      ? new Date(
                          topic.rubric_instructor.submitted_at,
                        ).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleStartGrading(topic)}
                    >
                      Xem/Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Đề tài</TableCell>
                <TableCell>Sinh viên</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Điểm</TableCell>
                <TableCell>Xếp loại</TableCell>
                <TableCell>Ngày chấm</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gradingHistory.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {record.topic_id?.topic_title || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {record.student_id?.user_name || "N/A"}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {record.student_id?.user_id || ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        record.rubric_category === "instructor"
                          ? "Hướng dẫn"
                          : "Phản biện"
                      }
                      size="small"
                      color={
                        record.rubric_category === "instructor"
                          ? "primary"
                          : "secondary"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="h6"
                      color={getGradeColor(record.total_score || 0)}
                    >
                      {record.total_score?.toFixed(2) || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.student_grades || "N/A"}
                      color={getGradeColor(record.total_score || 0)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(record.created_at).toLocaleDateString("vi-VN")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Grading Dialog */}
      <Dialog
        open={gradingDialog.open}
        onClose={() => setGradingDialog({ ...gradingDialog, open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chấm điểm: {gradingDialog.topic?.topic_title}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  Nhập điểm trực tiếp vào ô tương ứng với từng tiêu chí. Tổng
                  điểm sẽ được cộng tự động. Điểm nhập không được vượt quá số
                  điểm tối đa của mỗi mục.
                </Typography>
              </Alert>
            </Grid>

            {gradingDialog.evaluations.map((evalItem, index) => (
              <Grid item xs={12} key={evalItem.rubric_item_id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {index + 1}. {evalItem.criteria_name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={3} mb={2}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 80 }}
                    >
                      {evalItem.criteria_group && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {evalItem.criteria_group}
                        </Typography>
                      )}
                      Điểm: <strong>{evalItem.score.toFixed(2)}</strong> /{" "}
                      {evalItem.max_score}
                    </Typography>
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <TextField
                        type="number"
                        value={evalItem.score}
                        onChange={(e) => {
                          const v = Math.min(
                            evalItem.max_score,
                            Math.max(0, parseFloat(e.target.value) || 0),
                          );
                          handleScoreChange(index, v);
                        }}
                        inputProps={{
                          min: 0,
                          max: evalItem.max_score,
                          step: evalItem.max_score <= 1.5 ? 0.1 : 0.25,
                          style: {
                            textAlign: "center",
                            fontSize: "1.2rem",
                            fontWeight: 700,
                          },
                        }}
                        sx={{ width: 100 }}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ minWidth: 60, textAlign: "center" }}
                    >
                      {evalItem.score.toFixed(2)}
                    </Typography>
                  </Box>
                  {/* Hiển thị mức xếp loại tương ứng */}
                  {evalItem.level_core?.length > 0 &&
                    (() => {
                      const pct =
                        evalItem.max_score > 0
                          ? (evalItem.score / evalItem.max_score) * 100
                          : 0;
                      const matched = evalItem.level_core.find(
                        (l) =>
                          pct >= (l.min_score_pct ?? l.min_score ?? 0) &&
                          pct <= (l.max_score_pct ?? l.max_score ?? 100),
                      );
                      return matched ? (
                        <Alert severity="info" sx={{ mb: 1, py: 0.5 }}>
                          <Typography variant="caption">
                            <strong>{matched.level}:</strong>{" "}
                            {matched.description}
                          </Typography>
                        </Alert>
                      ) : null;
                    })()}
                  <TextField
                    fullWidth
                    label="Nhận xét chi tiết"
                    multiline
                    rows={2}
                    value={evalItem.comment}
                    onChange={(e) => handleCommentChange(index, e.target.value)}
                    placeholder="Nhận xét về tiêu chí này..."
                  />
                </Paper>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
                <Typography variant="h6" gutterBottom fontWeight={700}>
                  Tổng kết — {gradingDialog.rubric?.rubric_name}
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <Typography variant="h4" fontWeight={700}>
                      {calculateTotalScore().toFixed(2)}
                      <Typography component="span" variant="body1">
                        {" "}
                        / 10.0
                      </Typography>
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      Tổng điểm
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" fontWeight={700}>
                      {calculateTotalScore() >= 9
                        ? "A"
                        : calculateTotalScore() >= 8
                          ? "B"
                          : calculateTotalScore() >= 7
                            ? "C"
                            : calculateTotalScore() >= 5
                              ? "D"
                              : "F"}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      Xếp loại
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nhận xét tổng thể"
                multiline
                rows={4}
                value={gradingDialog.comments}
                onChange={(e) =>
                  setGradingDialog((prev) => ({
                    ...prev,
                    comments: e.target.value,
                  }))
                }
                placeholder="Nhận xét tổng thể về đề tài, ưu điểm, khuyết điểm, hướng phát triển..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setGradingDialog({ ...gradingDialog, open: false })}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitGrades}
            variant="contained"
            color="primary"
            startIcon={<GradeIcon />}
          >
            Lưu điểm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Topic Detail Dialog */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ ...detailDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{detailDialog.topic?.topic_title}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Mô tả đề tài
              </Typography>
              <Typography variant="body2">
                {detailDialog.topic?.topic_description}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Thông tin sinh viên
              </Typography>
              <Typography variant="body2">
                Số lượng: {detailDialog.topic?.student_count || 0} sinh viên
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Danh mục
              </Typography>
              <Chip
                label={detailDialog.topic?.topic_category?.topic_category_title}
                size="small"
              />
            </Grid>
            {detailDialog.topic?.has_final_report && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="success.main">
                  ✓ Đã nộp báo cáo cuối cùng
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDetailDialog({ ...detailDialog, open: false })}
          >
            Đóng
          </Button>
          <Button
            onClick={() => {
              setDetailDialog({ ...detailDialog, open: false });
              handleStartGrading(detailDialog.topic);
            }}
            variant="contained"
            color="primary"
            startIcon={<GradeIcon />}
          >
            Chấm điểm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GradingPage;
