import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  Divider,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore as ExpandIcon,
  FactCheck as RubricIcon,
  Assignment as EvalIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const fontSx = { fontFamily: "'Inter', sans-serif" };

const LEVEL_COLORS = {
  Tốt: "#16a34a",
  Khá: "#2563eb",
  "Trung bình": "#d97706",
  Kém: "#dc2626",
};

const getLevelBg = (level) => {
  for (const key of Object.keys(LEVEL_COLORS)) {
    if (level?.includes(key)) {
      return {
        Tốt: "#f0fdf4",
        Khá: "#eff6ff",
        "Trung bình": "#fffbeb",
        Kém: "#fef2f2",
      }[key];
    }
  }
  return "#f8fafc";
};

const RubricView = () => {
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [openScore, setOpenScore] = useState(false);
  const [scores, setScores] = useState({});
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState("");

  useEffect(() => {
    fetchRubrics();
  }, []);

  const fetchRubrics = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/rubrics");
      setRubrics(res.data.data || []);
    } catch {
      toast.error("Không thể tải danh sách rubric");
    } finally {
      setLoading(false);
    }
  };

  const groupEvaluations = (evals) => {
    const groups = {};
    (evals || []).forEach((e) => {
      const group = e.criteria_group || "Tiêu chí";
      if (!groups[group]) groups[group] = [];
      groups[group].push(e);
    });
    return groups;
  };

  const totalWeight = (evals) =>
    (evals || []).reduce((s, e) => s + (e.weight || 0), 0);

  const handleOpenScore = (rubric) => {
    setSelected(rubric);
    const initScores = {};
    (rubric.rubric_evaluations || []).forEach((e) => {
      initScores[e._id] = { score: 0, max: e.weight, note: "" };
    });
    setScores(initScores);
    setNote("");
    setStudentIdInput("");
    setOpenScore(true);
  };

  const totalScore = () =>
    Object.values(scores).reduce((s, v) => s + (v.score || 0), 0);

  const handleSaveScore = async () => {
    if (!studentIdInput.trim()) {
      toast.error("Vui lòng nhập mã sinh viên cần đánh giá");
      return;
    }
    try {
      setSubmitting(true);
      const criteriaScores = (selected?.rubric_evaluations || []).map((ev) => ({
        criteria_id: ev._id,
        criteria_name: ev.evaluation_criteria,
        score: scores[ev._id]?.score || 0,
        max_score: ev.weight,
        weight: ev.weight,
        comment: scores[ev._id]?.note || "",
      }));
      const total = totalScore();
      await axios.post(
        `/api/teacher/rubric-evaluations/${studentIdInput.trim()}`,
        {
          topicId: undefined,
          score: total,
          criteria_scores: criteriaScores,
          rubric_category: selected?.rubric_category || "instructor",
          comments: note,
        },
      );
      toast.success(
        `Đã lưu điểm cho SV ${studentIdInput} — Tổng: ${total.toFixed(2)} điểm`,
      );
      setOpenScore(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi lưu điểm");
    } finally {
      setSubmitting(false);
    }
  };

  const CATEGORY_LABEL = {
    instructor: "GVHD",
    reviewer: "Phản biện",
    assembly: "Hội đồng",
  };
  const CATEGORY_COLOR = {
    instructor: "primary",
    reviewer: "warning",
    assembly: "success",
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, ...fontSx }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <RubricIcon sx={{ color: "#2563eb", fontSize: 28 }} />
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#1e293b", ...fontSx }}
          >
            Tiêu chí đánh giá (Rubric)
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", ...fontSx }}>
            Xem và sử dụng bảng tiêu chí để đánh giá báo cáo tốt nghiệp sinh
            viên
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : rubrics.length === 0 ? (
        <Alert severity="info" sx={fontSx}>
          Chưa có rubric nào. Vui lòng yêu cầu Admin tạo rubric trước.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {rubrics.map((rubric) => {
            const groups = groupEvaluations(rubric.rubric_evaluations);
            const total = totalWeight(rubric.rubric_evaluations);

            return (
              <Grid item xs={12} key={rubric._id}>
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  {/* Rubric Header */}
                  <Box sx={{ p: 2.5, bgcolor: "#1e3a8a", color: "#fff" }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, ...fontSx, color: "#fff" }}
                        >
                          {rubric.rubric_name}
                        </Typography>
                        {rubric.rubric_note && (
                          <Typography
                            variant="body2"
                            sx={{ color: "#93c5fd", mt: 0.5, ...fontSx }}
                          >
                            {rubric.rubric_note}
                          </Typography>
                        )}
                      </Box>
                      <Box
                        display="flex"
                        gap={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Chip
                          label={
                            CATEGORY_LABEL[rubric.rubric_category] ||
                            rubric.rubric_category
                          }
                          color={
                            CATEGORY_COLOR[rubric.rubric_category] || "default"
                          }
                          size="small"
                          sx={{ fontWeight: 600, ...fontSx }}
                        />
                        <Chip
                          label={`Tổng: ${total.toFixed(1)} điểm`}
                          sx={{
                            bgcolor: "#fff",
                            color: "#1e3a8a",
                            fontWeight: 700,
                            ...fontSx,
                          }}
                          size="small"
                        />
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EvalIcon />}
                          onClick={() => handleOpenScore(rubric)}
                          sx={{
                            bgcolor: "#2563eb",
                            ...fontSx,
                            fontWeight: 600,
                            borderRadius: "6px",
                          }}
                        >
                          Chấm điểm
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {/* Criteria Table */}
                  {Object.entries(groups).map(([groupName, evals]) => (
                    <Accordion
                      key={groupName}
                      defaultExpanded
                      elevation={0}
                      disableGutters
                    >
                      <AccordionSummary
                        expandIcon={<ExpandIcon />}
                        sx={{
                          bgcolor: "#f1f5f9",
                          borderBottom: "1px solid #e2e8f0",
                          px: 2.5,
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 700,
                              color: "#1e3a8a",
                              ...fontSx,
                            }}
                          >
                            {groupName}
                          </Typography>
                          <Chip
                            label={`${evals.reduce((s, e) => s + (e.weight || 0), 0).toFixed(2)}đ`}
                            size="small"
                            sx={{
                              bgcolor: "#1e3a8a",
                              color: "#fff",
                              fontWeight: 600,
                              ...fontSx,
                              fontSize: "0.72rem",
                            }}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    width: 40,
                                    ...fontSx,
                                    color: "#475569",
                                  }}
                                >
                                  STT
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    width: 160,
                                    ...fontSx,
                                    color: "#475569",
                                  }}
                                >
                                  Tiêu chí
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    width: 60,
                                    ...fontSx,
                                    color: "#475569",
                                  }}
                                >
                                  Điểm
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    width: 80,
                                    ...fontSx,
                                    color: "#475569",
                                  }}
                                >
                                  CLO
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    ...fontSx,
                                    color: "#16a34a",
                                  }}
                                >
                                  Tốt (85-100%)
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    ...fontSx,
                                    color: "#2563eb",
                                  }}
                                >
                                  Khá (70-84%)
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    ...fontSx,
                                    color: "#d97706",
                                  }}
                                >
                                  Trung bình (50-69%)
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    ...fontSx,
                                    color: "#dc2626",
                                  }}
                                >
                                  Kém (&lt;50%)
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {evals.map((ev) => {
                                const levels = ev.level_core || [];
                                const getDesc = (keyword) =>
                                  levels.find((l) => l.level?.includes(keyword))
                                    ?.description || "—";

                                return (
                                  <TableRow
                                    key={ev._id}
                                    hover
                                    sx={{ verticalAlign: "top" }}
                                  >
                                    <TableCell
                                      sx={{
                                        ...fontSx,
                                        color: "#94a3b8",
                                        fontSize: "0.8rem",
                                      }}
                                    >
                                      {ev.serial}
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600, ...fontSx }}
                                      >
                                        {ev.evaluation_criteria}
                                      </Typography>
                                      {ev.note && (
                                        <Typography
                                          variant="caption"
                                          sx={{ color: "#94a3b8", ...fontSx }}
                                        >
                                          {ev.note}
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={`${ev.weight}đ`}
                                        size="small"
                                        sx={{
                                          bgcolor: "#dbeafe",
                                          color: "#1e40af",
                                          fontWeight: 700,
                                          ...fontSx,
                                          fontSize: "0.75rem",
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontFamily: "monospace",
                                          bgcolor: "#f1f5f9",
                                          px: 0.8,
                                          py: 0.3,
                                          borderRadius: "4px",
                                          color: "#475569",
                                        }}
                                      >
                                        {ev.clo || "—"}
                                      </Typography>
                                    </TableCell>
                                    {["Tốt", "Khá", "Trung bình", "Kém"].map(
                                      (key) => (
                                        <TableCell
                                          key={key}
                                          sx={{
                                            maxWidth: 180,
                                            bgcolor: levels.find((l) =>
                                              l.level?.includes(key),
                                            )
                                              ? getLevelBg(key + " ")
                                              : undefined,
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              ...fontSx,
                                              color: "#334155",
                                              lineHeight: 1.5,
                                              display: "block",
                                            }}
                                          >
                                            {getDesc(key)}
                                          </Typography>
                                        </TableCell>
                                      ),
                                    )}
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  {/* Footer */}
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      bgcolor: "#f8fafc",
                      borderTop: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "#1e3a8a", ...fontSx }}
                    >
                      Tổng số điểm: {total.toFixed(1)} / 10.0
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Score Dialog */}
      <Dialog
        open={openScore}
        onClose={() => setOpenScore(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            ...fontSx,
            bgcolor: "#1e3a8a",
            color: "#fff",
            py: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <EvalIcon />
            Chấm điểm — {selected?.rubric_name}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {selected?.rubric_evaluations?.map((ev, idx) => {
            const levelDesc = (ev.level_core || []).find((l) => {
              const pct = scores[ev._id]?.score
                ? (scores[ev._id].score / ev.weight) * 100
                : 0;
              return (
                pct >= (l.min_score_pct || l.min_score || 0) &&
                pct <= (l.max_score_pct || l.max_score || 100)
              );
            });

            return (
              <Box
                key={ev._id}
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: "1px solid #f1f5f9",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={1}
                >
                  <Box flex={1}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, ...fontSx, color: "#1e293b" }}
                    >
                      {idx + 1}. {ev.evaluation_criteria}
                    </Typography>
                    {ev.criteria_group && (
                      <Typography
                        variant="caption"
                        sx={{ color: "#94a3b8", ...fontSx }}
                      >
                        {ev.criteria_group}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={`Tối đa: ${ev.weight}đ`}
                    size="small"
                    sx={{
                      bgcolor: "#dbeafe",
                      color: "#1e40af",
                      fontWeight: 600,
                      ...fontSx,
                      ml: 1,
                    }}
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={2} mt={1.5}>
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 55, ...fontSx, color: "#64748b" }}
                  >
                    0 — {ev.weight}đ
                  </Typography>
                  <Slider
                    value={scores[ev._id]?.score || 0}
                    min={0}
                    max={ev.weight}
                    step={0.25}
                    onChange={(e, val) =>
                      setScores((prev) => ({
                        ...prev,
                        [ev._id]: { ...prev[ev._id], score: val },
                      }))
                    }
                    sx={{ flex: 1 }}
                    valueLabelDisplay="auto"
                  />
                  <Box sx={{ minWidth: 52, textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#2563eb",
                        ...fontSx,
                        lineHeight: 1,
                      }}
                    >
                      {(scores[ev._id]?.score || 0).toFixed(2)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#94a3b8", ...fontSx }}
                    >
                      điểm
                    </Typography>
                  </Box>
                </Box>

                {levelDesc && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      bgcolor: "#f0fdf4",
                      borderRadius: "6px",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#15803d", ...fontSx }}
                    >
                      <strong>{levelDesc.level}:</strong>{" "}
                      {levelDesc.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}

          <Box sx={{ px: 3, py: 2, bgcolor: "#f8fafc" }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 0.5, ...fontSx }}
              >
                Mã sinh viên cần chấm
              </Typography>
              <TextField
                size="small"
                fullWidth
                placeholder="Nhập mã sinh viên (VD: SV001)..."
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                InputProps={{ style: fontSx }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 1, ...fontSx }}
            >
              Nhận xét chung
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhận xét về báo cáo của sinh viên..."
              size="small"
              InputProps={{ style: fontSx }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckIcon sx={{ color: "#16a34a" }} />
            <Typography sx={{ fontWeight: 700, color: "#1e3a8a", ...fontSx }}>
              Tổng điểm: {totalScore().toFixed(2)} /{" "}
              {totalWeight(selected?.rubric_evaluations).toFixed(1)}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              onClick={() => setOpenScore(false)}
              sx={fontSx}
              disabled={submitting}
            >
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
              onClick={handleSaveScore}
              disabled={submitting}
              sx={{ bgcolor: "#1e3a8a", ...fontSx, fontWeight: 600 }}
            >
              {submitting ? "Đang lưu..." : "Lưu điểm"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RubricView;
