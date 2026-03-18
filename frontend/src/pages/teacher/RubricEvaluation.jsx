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
  CircularProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Assignment as AssignIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const CATEGORY_LABEL = {
  instructor: "GVHD",
  reviewer: "Phản biện",
  assembly: "Hội đồng",
};

const RubricEvaluation = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rubricLoading, setRubricLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openEval, setOpenEval] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [scores, setScores] = useState({});
  const [comment, setComment] = useState("");
  const [activeRubric, setActiveRubric] = useState(null);

  useEffect(() => {
    fetchEvaluations();
    fetchRubrics();
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

  // Fetch all rubrics (instructor type, not by topicId)
  const fetchRubrics = async () => {
    try {
      setRubricLoading(true);
      const response = await axios.get("/api/rubrics");
      const all = response.data.data || [];
      // prefer instructor rubric, fallback to first
      const instructor =
        all.find((r) => r.rubric_category === "instructor") || all[0];
      setRubrics(all);
      setActiveRubric(instructor || null);
    } catch (error) {
      console.error("Fetch rubrics error:", error);
    } finally {
      setRubricLoading(false);
    }
  };

  const handleOpenEval = (item) => {
    setSelectedItem(item);
    setComment("");
    // Initialize scores from rubric evaluations
    const initScores = {};
    (activeRubric?.rubric_evaluations || []).forEach((ev) => {
      // Pre-fill if already graded
      const existing = (item.criteria_scores || []).find(
        (cs) =>
          cs.criteria_id === ev._id?.toString() ||
          cs.criteria_name === ev.evaluation_criteria,
      );
      initScores[ev._id] = existing?.score ?? 0;
    });
    setScores(initScores);
    setOpenEval(true);
  };

  const handleCloseEval = () => {
    setOpenEval(false);
    setSelectedItem(null);
    setScores({});
    setComment("");
  };

  const totalScore = () =>
    Object.values(scores).reduce((s, v) => s + (Number(v) || 0), 0);

  const maxTotalScore = () =>
    (activeRubric?.rubric_evaluations || []).reduce(
      (s, ev) => s + (ev.weight || 0),
      0,
    );

  const handleSubmitEval = async () => {
    if (!selectedItem?.student_id) {
      toast.error("Không tìm thấy mã sinh viên");
      return;
    }
    if (!activeRubric) {
      toast.error("Không có rubric để chấm điểm");
      return;
    }

    try {
      setSubmitting(true);
      const criteriaScores = (activeRubric.rubric_evaluations || []).map(
        (ev) => ({
          criteria_id: ev._id,
          criteria_name: ev.evaluation_criteria,
          score: scores[ev._id] || 0,
          max_score: ev.weight,
          weight: ev.weight,
          comment: "",
        }),
      );

      const total = totalScore();

      await axios.post(
        `/api/teacher/rubric-evaluations/${selectedItem.student_id}`,
        {
          topicId: selectedItem.topic_id,
          score: total,
          criteria_scores: criteriaScores,
          rubric_category: activeRubric.rubric_category || "instructor",
          comments: comment,
        },
      );

      toast.success(
        `Đã lưu điểm cho ${selectedItem.student_name} — Tổng: ${total.toFixed(2)}đ`,
      );
      handleCloseEval();
      fetchEvaluations();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi lưu đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const evaluatedCount = evaluations.filter((e) => e.score > 0).length;
  const pendingCount = evaluations.filter(
    (e) => !e.score || e.score === 0,
  ).length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(37, 99, 235, 0.25)",
          color: "white",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
            >
              Chấm Điểm Theo Rubric
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.85 }}>
              Đánh giá chi tiết từng tiêu chí cho sinh viên hướng dẫn
            </Typography>
          </Box>
          {activeRubric && (
            <Chip
              label={`Đang dùng: ${activeRubric.rubric_name} (${CATEGORY_LABEL[activeRubric.rubric_category] || activeRubric.rubric_category})`}
              sx={{
                bgcolor: "rgba(255,255,255,0.18)",
                color: "white",
                fontWeight: 600,
              }}
            />
          )}
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Tổng SV cần chấm",
            value: evaluations.length,
            color: "#2563eb",
            icon: <AssignIcon />,
          },
          {
            label: "Đã chấm điểm",
            value: evaluatedCount,
            color: "#10b981",
            icon: <CheckIcon />,
          },
          {
            label: "Chưa chấm",
            value: pendingCount,
            color: "#f59e0b",
            icon: <PendingIcon />,
          },
        ].map((stat) => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Card
              elevation={0}
              sx={{ border: "1px solid #e2e8f0", borderRadius: 3 }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2.5,
                  "&:last-child": { pb: 2.5 },
                }}
              >
                <Box sx={{ color: stat.color, display: "flex" }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: stat.color, lineHeight: 1 }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stat.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Rubric selector */}
      {rubricLoading ? (
        <LinearProgress sx={{ mb: 2 }} />
      ) : rubrics.length > 1 ? (
        <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, alignSelf: "center" }}
          >
            Chọn Rubric:
          </Typography>
          {rubrics.map((r) => (
            <Chip
              key={r._id}
              label={`${r.rubric_name} (${CATEGORY_LABEL[r.rubric_category] || r.rubric_category})`}
              onClick={() => setActiveRubric(r)}
              color={activeRubric?._id === r._id ? "primary" : "default"}
              variant={activeRubric?._id === r._id ? "filled" : "outlined"}
              clickable
            />
          ))}
        </Box>
      ) : null}

      {/* Table */}
      {loading ? (
        <LinearProgress />
      ) : evaluations.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <CheckIcon sx={{ fontSize: 60, color: "text.disabled", mb: 1 }} />
          <Typography color="textSecondary" variant="h6">
            Không có sinh viên cần đánh giá
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Chỉ hiển thị sinh viên trong các đề tài bạn đang hướng dẫn
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Sinh Viên
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Đề Tài
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#1e293b" }}
                    align="center"
                  >
                    Điểm
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#1e293b" }}
                    align="center"
                  >
                    Trạng Thái
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#1e293b" }}
                    align="right"
                  >
                    Hành Động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {evaluations.map((item) => {
                  const graded = item.score > 0;
                  return (
                    <TableRow key={item._id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.student_name || "—"}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {item.student_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.topic_title || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {graded ? (
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              bgcolor: "#eff6ff",
                              color: "#2563eb",
                              fontWeight: 700,
                              fontSize: 15,
                            }}
                          >
                            {item.score?.toFixed(1)}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={graded ? <CheckIcon /> : <PendingIcon />}
                          label={graded ? "Đã chấm" : "Chờ chấm"}
                          color={graded ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant={graded ? "outlined" : "contained"}
                          startIcon={graded ? <ViewIcon /> : <EditIcon />}
                          onClick={() => handleOpenEval(item)}
                          disabled={!activeRubric}
                        >
                          {graded ? "Xem / Sửa" : "Chấm Điểm"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Evaluation Dialog */}
      <Dialog
        open={openEval}
        onClose={handleCloseEval}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#1e3a8a",
            color: "white",
            py: 2.5,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <EditIcon />
          Chấm Điểm Rubric — {selectedItem?.student_name}
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {/* Student info */}
          <Box
            sx={{
              px: 3,
              pt: 2.5,
              pb: 2,
              bgcolor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Mã SV
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedItem?.student_id || "—"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Đề Tài
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedItem?.topic_title || "—"}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* No rubric warning */}
          {!activeRubric ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="warning">
                Chưa có rubric. Vui lòng yêu cầu Admin tạo rubric trước.
              </Alert>
            </Box>
          ) : (
            <>
              <Box sx={{ px: 3, py: 2, bgcolor: "#eff6ff" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#1e40af" }}
                >
                  Rubric: {activeRubric.rubric_name} — Tổng tối đa:{" "}
                  {maxTotalScore().toFixed(1)}đ
                </Typography>
              </Box>

              {/* Criteria scoring */}
              {(activeRubric.rubric_evaluations || []).map((ev, idx) => (
                <Box
                  key={ev._id}
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: "1px solid #f1f5f9",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={1.5}
                  >
                    <Box flex={1}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "#1e293b" }}
                      >
                        {idx + 1}. {ev.evaluation_criteria}
                      </Typography>
                      {ev.criteria_group && (
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          Nhóm: {ev.criteria_group}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ textAlign: "right", ml: 2, flexShrink: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          color: "#2563eb",
                          lineHeight: 1,
                        }}
                      >
                        {(scores[ev._id] || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        / {ev.weight}đ
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ minWidth: 20 }}
                    >
                      0
                    </Typography>
                    <Slider
                      value={scores[ev._id] || 0}
                      min={0}
                      max={ev.weight}
                      step={0.25}
                      onChange={(_, val) =>
                        setScores((prev) => ({ ...prev, [ev._id]: val }))
                      }
                      sx={{ flex: 1, color: "#2563eb" }}
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 0, label: "0" },
                        {
                          value: ev.weight * 0.5,
                          label: `${(ev.weight * 0.5).toFixed(1)}`,
                        },
                        { value: ev.weight, label: `${ev.weight}` },
                      ]}
                    />
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ minWidth: 30 }}
                    >
                      {ev.weight}đ
                    </Typography>
                  </Box>

                  {/* Show level description based on % */}
                  {ev.level_core?.length > 0 &&
                    (() => {
                      const pct =
                        ev.weight > 0
                          ? ((scores[ev._id] || 0) / ev.weight) * 100
                          : 0;
                      const level = ev.level_core.find(
                        (l) =>
                          pct >= (l.min_score_pct || l.min_score || 0) &&
                          pct <= (l.max_score_pct || l.max_score || 100),
                      );
                      return level ? (
                        <Box
                          sx={{
                            mt: 1,
                            px: 1.5,
                            py: 0.8,
                            bgcolor: "#f0fdf4",
                            borderRadius: 1,
                            border: "1px solid #bbf7d0",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "#15803d" }}
                          >
                            <strong>{level.level}:</strong> {level.description}
                          </Typography>
                        </Box>
                      ) : null;
                    })()}
                </Box>
              ))}

              {/* Comment */}
              <Box sx={{ px: 3, py: 2.5, bgcolor: "#f8fafc" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Nhận xét chung
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhận xét về báo cáo, thái độ, chất lượng..."
                  size="small"
                />
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            justifyContent: "space-between",
            bgcolor: "#f8fafc",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <CheckIcon sx={{ color: "#16a34a", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 700, color: "#1e3a8a" }}>
              Tổng điểm:{" "}
              <Chip
                label={`${totalScore().toFixed(2)} / ${maxTotalScore().toFixed(1)}`}
                color="primary"
                size="small"
                sx={{ fontWeight: 700, ml: 0.5 }}
              />
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button onClick={handleCloseEval} disabled={submitting}>
              Hủy
            </Button>
            <Button
              variant="contained"
              startIcon={
                submitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              onClick={handleSubmitEval}
              disabled={submitting || !activeRubric}
              sx={{ bgcolor: "#1e3a8a", fontWeight: 600 }}
            >
              {submitting ? "Đang lưu..." : "Lưu Đánh Giá"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RubricEvaluation;
