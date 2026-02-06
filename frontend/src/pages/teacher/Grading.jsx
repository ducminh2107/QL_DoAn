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
      const response = await axios.get(
        `/api/teacher/grading/rubric/${topic._id}?type=instructor`
      );
      setGradingDialog({
        open: true,
        topic: response.data.data.topic,
        rubric: response.data.data.rubric,
        evaluations:
          response.data.data.existing_grading?.evaluations ||
          response.data.data.rubric.rubric_evaluations.map((item) => ({
            rubric_item_id: item._id,
            criteria_name: item.evaluation_criteria,
            score: 0,
            comment: "",
            max_score: 10,
          })),
        comments: response.data.data.existing_grading?.comments || "",
      });
    } catch (error) {
      toast.error("Không thể tải rubric chấm điểm");
    }
  };

  const handleSubmitGrades = async () => {
    try {
      await axios.post(
        `/api/teacher/grading/submit/${gradingDialog.topic._id}`,
        {
          type: "instructor",
          evaluations: gradingDialog.evaluations,
          comments: gradingDialog.comments,
        }
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
      0
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
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          📝 Chấm điểm đề tài
        </Typography>
        <Box display="flex" gap={2}>
          <Chip
            icon={<PendingIcon />}
            label={`${gradingData.pending.length} cần chấm`}
            color="warning"
          />
          <Chip
            icon={<CheckCircleIcon />}
            label={`${gradingData.graded.length} đã chấm`}
            color="success"
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
        <Grid container spacing={3}>
          {gradingData.pending.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <CheckCircleIcon
                  sx={{ fontSize: 60, color: "success.main", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  Không có đề tài nào cần chấm điểm
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tất cả đề tài đã được chấm điểm
                </Typography>
              </Paper>
            </Grid>
          ) : (
            gradingData.pending.map((topic) => (
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
                              topic.defense_schedule.scheduled_date
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
                      disabled={!topic.has_final_report}
                    >
                      Bắt đầu chấm
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        /* View topic details */
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
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
                        (s) => s.status === "approved"
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
                          topic.rubric_instructor.submitted_at
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
                  Sử dụng thanh trượt để chấm điểm từng tiêu chí. Tổng điểm sẽ
                  được tính tự động.
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
                      sx={{ minWidth: 60 }}
                    >
                      Điểm: {evalItem.score}
                    </Typography>
                    <Slider
                      value={evalItem.score}
                      onChange={(e, value) => handleScoreChange(index, value)}
                      min={0}
                      max={10}
                      step={0.5}
                      valueLabelDisplay="auto"
                      sx={{ flex: 1 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 80 }}
                    >
                      / {evalItem.max_score}
                    </Typography>
                  </Box>
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
              <Paper sx={{ p: 2, bgcolor: "primary.light", color: "white" }}>
                <Typography variant="h6" gutterBottom>
                  Tổng kết
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      Tổng điểm:{" "}
                      <strong>{calculateTotalScore().toFixed(2)}/100</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      Xếp loại:{" "}
                      <strong>
                        {calculateTotalScore() >= 9
                          ? "A"
                          : calculateTotalScore() >= 8
                            ? "B"
                            : calculateTotalScore() >= 7
                              ? "C"
                              : calculateTotalScore() >= 6
                                ? "D"
                                : "F"}
                      </strong>
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
    </Container>
  );
};

export default GradingPage;
