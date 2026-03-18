import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Grid,
  Chip,
  Tooltip,
  Divider,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AddCircleOutline as AddCriteriaIcon,
  RemoveCircleOutline as RemoveCriteriaIcon,
  Bolt as BoltIcon,
  FactCheck as FactCheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const fontSx = { fontFamily: "'Inter', sans-serif" };

// ── colour tokens ──────────────────────────────────────────────
const C = {
  primary: "#3b82f6",
  primaryDk: "#1d4ed8",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  violet: "#8b5cf6",
  slate: "#64748b",
};

const alpha = (hex, op) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${op})`;
};

const FieldLabel = ({ children }) => (
  <Typography
    sx={{
      fontSize: "0.78rem",
      fontWeight: 700,
      color: C.slate,
      mb: 0.8,
      letterSpacing: "0.03em",
    }}
  >
    {children}
  </Typography>
);

const StyledInput = ({ label, ...props }) => (
  <Box sx={{ mb: 2 }}>
    <FieldLabel>{label}</FieldLabel>
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
          bgcolor: "#f8fafc",
          fontSize: "0.9rem",
          fontWeight: 600,
          "& fieldset": { borderColor: "#e2e8f0" },
          "&:hover fieldset": { borderColor: C.primary },
          "&.Mui-focused fieldset": { borderColor: C.primary, borderWidth: 2 },
        },
      }}
      {...props}
    />
  </Box>
);

const CATEGORY_LABELS = {
  instructor: "Giảng viên Hướng dẫn",
  reviewer: "Giảng viên Phản biện",
  assembly: "Hội đồng đánh giá",
};

const CATEGORY_COLORS = {
  instructor: "primary",
  reviewer: "warning",
  assembly: "success",
};

const defaultEvaluation = () => ({
  serial: 1,
  evaluation_criteria: "",
  grading_scale: "10",
  weight: 1,
  note: "",
  level_core: [
    {
      level: "Xuất sắc",
      min_score: 9,
      max_score: 10,
      description: "Đạt yêu cầu xuất sắc",
    },
    {
      level: "Tốt",
      min_score: 7,
      max_score: 8.9,
      description: "Đạt yêu cầu tốt",
    },
    {
      level: "Trung bình",
      min_score: 5,
      max_score: 6.9,
      description: "Đạt yêu cầu trung bình",
    },
    {
      level: "Yếu",
      min_score: 0,
      max_score: 4.9,
      description: "Chưa đạt yêu cầu",
    },
  ],
});

const RubricManagement = () => {
  const [rubrics, setRubrics] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [topicCategories, setTopicCategories] = useState([]);
  const [formData, setFormData] = useState({
    rubric_name: "",
    rubric_note: "",
    rubric_category: "instructor",
    rubric_topic_category: "",
    semester: "",
    rubric_template: false,
    rubric_evaluations: [defaultEvaluation()],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rubricRes, categoryRes, semesterRes] = await Promise.all([
        axios.get("/api/rubrics"),
        axios.get("/api/topic-categories"),
        axios.get("/api/semesters"),
      ]);
      setRubrics(rubricRes.data.data || []);
      setTopicCategories(categoryRes.data.data || []);
      setSemesters(semesterRes.data.data || []);
    } catch {
      toast.error("Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        rubric_name: item.rubric_name || "",
        rubric_note: item.rubric_note || "",
        rubric_category: item.rubric_category || "instructor",
        rubric_topic_category:
          item.rubric_topic_category?._id || item.rubric_topic_category || "",
        semester: item.semester?._id || item.semester || "",
        rubric_template: item.rubric_template ?? false,
        rubric_evaluations:
          item.rubric_evaluations?.length > 0
            ? item.rubric_evaluations
            : [defaultEvaluation()],
      });
    } else {
      setEditingItem(null);
      setFormData({
        rubric_name: "",
        rubric_note: "",
        rubric_category: "instructor",
        rubric_topic_category: "",
        semester: semesters.find((s) => s.is_active)?._id || "",
        rubric_template: false,
        rubric_evaluations: [defaultEvaluation()],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Re-number serial
      const payload = {
        ...formData,
        rubric_evaluations: formData.rubric_evaluations.map((ev, i) => ({
          ...ev,
          serial: i + 1,
        })),
      };
      if (!payload.rubric_topic_category) {
        delete payload.rubric_topic_category;
      }
      if (!payload.semester) {
        delete payload.semester;
      }

      if (editingItem) {
        await axios.put(`/api/rubrics/${editingItem._id}`, payload);
        toast.success("Cập nhật Rubric thành công");
      } else {
        await axios.post("/api/rubrics", payload);
        toast.success("Thêm Rubric mới thành công");
      }
      handleClose();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa rubric này không? Tuyệt đối lưu ý nếu rubric này đang được sử dụng.",
      )
    ) {
      try {
        await axios.delete(`/api/rubrics/${id}`);
        toast.success("Xóa Rubric thành công");
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Xóa thất bại");
      }
    }
  };

  const updateEvaluation = (index, field, value) => {
    const updated = [...formData.rubric_evaluations];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, rubric_evaluations: updated });
  };

  const addEvaluation = () => {
    const newEv = {
      ...defaultEvaluation(),
      serial: formData.rubric_evaluations.length + 1,
    };
    setFormData({
      ...formData,
      rubric_evaluations: [...formData.rubric_evaluations, newEv],
    });
  };

  const removeEvaluation = (index) => {
    const updated = formData.rubric_evaluations.filter((_, i) => i !== index);
    setFormData({ ...formData, rubric_evaluations: updated });
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        background: "#f8faff",
        width: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "1.6rem",
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              ...fontSx,
            }}
          >
            📝 Quản lý Tiêu chí chấm điểm (Rubric)
          </Typography>
          <Typography
            sx={{ color: C.slate, mt: 0.5, fontWeight: 500, ...fontSx }}
          >
            Xây dựng các bộ tiêu chí đánh giá đề tài (GVHD, GVPB, Hội đồng)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            ...fontSx,
            bgcolor: C.primaryDk,
            borderRadius: "12px",
            fontWeight: 700,
            textTransform: "none",
            px: 3,
            py: 1.2,
            fontSize: "0.95rem",
            boxShadow: `0 4px 20px ${alpha(C.primary, 0.4)}`,
            "&:hover": { bgcolor: C.primary, transform: "translateY(-2px)" },
            transition: "all 0.2s",
          }}
        >
          Thêm Rubric mới
        </Button>
      </Box>

      {/* Summary strip */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            label: "Tổng số Rubric",
            value: rubrics.length,
            color: C.rose,
            bg: "#fff1f2",
            icon: <FactCheckIcon />,
          },
        ].map((s, i) => (
          <Grid item xs={12} sm={6} md={3} lg={3} key={i}>
            <Card
              elevation={0}
              sx={{
                borderRadius: "18px",
                border: "1px solid #e2e8f0",
                bgcolor: "#fff",
              }}
            >
              <CardContent
                sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "14px",
                    bgcolor: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& svg": { color: s.color, fontSize: 24 },
                  }}
                >
                  {s.icon}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: C.slate,
                      ...fontSx,
                    }}
                  >
                    {s.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.6rem",
                      fontWeight: 900,
                      color: "#0f172a",
                      lineHeight: 1.2,
                      ...fontSx,
                    }}
                  >
                    {s.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Content */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          overflow: "hidden",
          bgcolor: "#fff",
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {loading ? (
            <LinearProgress
              sx={{
                borderRadius: 2,
                bgcolor: "#e0f2fe",
                "& .MuiLinearProgress-bar": { bgcolor: C.primary },
              }}
            />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell
                      sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                    >
                      Tên Rubric
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                    >
                      Áp dụng cho Học kỳ
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                    >
                      Loại Đánh giá
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                    >
                      Danh mục Đề tài
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                    >
                      Số lượng TC
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: "#475569",
                        width: 110,
                        ...fontSx,
                      }}
                      align="right"
                    >
                      Hành Động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rubrics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography
                          sx={{ color: C.slate, fontWeight: 600, ...fontSx }}
                        >
                          Chưa có tiêu chí Rubric nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rubrics.map((item) => (
                      <TableRow
                        key={item._id}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            ...fontSx,
                            color: "#1e293b",
                            minWidth: 200,
                          }}
                        >
                          {item.rubric_name}
                        </TableCell>
                        <TableCell sx={{ ...fontSx, color: C.slate }}>
                          {item.semester ? (
                            <Chip
                              label={`Học kỳ ${item.semester.semester} (${item.semester.school_year_start}-${item.semester.school_year_end})`}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                bgcolor: "#f1f5f9",
                                borderRadius: "8px",
                              }}
                            />
                          ) : (
                            "Tất cả học kỳ"
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              CATEGORY_LABELS[item.rubric_category] ||
                              item.rubric_category
                            }
                            color={
                              CATEGORY_COLORS[item.rubric_category] || "default"
                            }
                            size="small"
                            sx={{
                              fontWeight: 700,
                              borderRadius: "8px",
                              textTransform: "uppercase",
                              fontSize: "0.7rem",
                              letterSpacing: "0.02em",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ ...fontSx, color: C.slate }}>
                          {item.rubric_topic_category?.topic_category_title ||
                            "Tất cả danh mục"}
                        </TableCell>
                        <TableCell
                          sx={{ ...fontSx, color: "#1e293b", fontWeight: 700 }}
                        >
                          <Box
                            sx={{
                              display: "inline-flex",
                              px: 1.5,
                              py: 0.5,
                              bgcolor: "#f8fafc",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            {item.rubric_evaluations?.length || 0}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              sx={{
                                color: "#3b82f6",
                                mr: 1,
                                bgcolor: "#eff6ff",
                              }}
                              onClick={() => handleOpen(item)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              sx={{ bgcolor: "#fef2f2" }}
                              onClick={() => handleDelete(item._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
            overflow: "hidden",
            height: "90vh",
          },
        }}
        scroll="paper"
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* Dialog header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${C.primaryDk} 0%, ${C.primary} 100%)`,
              px: 4,
              py: 3,
              position: "relative",
              flexShrink: 0,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  bgcolor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FactCheckIcon sx={{ color: "#fff", fontSize: 22 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 900,
                    color: "#fff",
                    ...fontSx,
                  }}
                >
                  {editingItem
                    ? "Chỉnh sửa Tiêu chí & Thang điểm"
                    : "Thiết lập Rubric Mới"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 500,
                    ...fontSx,
                  }}
                >
                  Thiết lập chuẩn cấu trúc điểm số cho đồ án
                </Typography>
              </Box>
            </Stack>
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 14,
                right: 14,
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.15)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                borderRadius: "10px",
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <DialogContent
            sx={{ p: 4, bgcolor: "#fafbff", flexGrow: 1, overflowY: "auto" }}
          >
            <Box
              sx={{
                bgcolor: "#fff",
                p: 3,
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                mb: 4,
              }}
            >
              <Typography
                sx={{ fontWeight: 800, color: "#1e293b", mb: 3, ...fontSx }}
              >
                1. Thông tin chung
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="TÊN BỘ TIÊU CHÍ (RUBRIC)"
                    name="rubric_name"
                    placeholder="VD: Tiêu chí chấm Hướng dẫn chuyên môn"
                    required
                    value={formData.rubric_name}
                    onChange={(e) =>
                      setFormData({ ...formData, rubric_name: e.target.value })
                    }
                    inputProps={{ style: fontSx }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="ÁP DỤNG CHO HỌC KỲ"
                    name="semester"
                    select
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    inputProps={{ style: fontSx }}
                  >
                    <MenuItem value="" sx={fontSx}>
                      -- Tất cả Học kỳ --
                    </MenuItem>
                    {semesters.map((s) => (
                      <MenuItem
                        key={s._id}
                        value={s._id}
                        sx={{ ...fontSx, fontWeight: 500 }}
                      >
                        Học kỳ {s.semester} ({s.school_year_start} -{" "}
                        {s.school_year_end}) {s.is_active ? " - Hiện tại" : ""}
                      </MenuItem>
                    ))}
                  </StyledInput>
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="LOẠI RUBRIC (KIỂU ĐÁNH GIÁ)"
                    name="rubric_category"
                    select
                    required
                    value={formData.rubric_category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rubric_category: e.target.value,
                      })
                    }
                    inputProps={{ style: fontSx }}
                  >
                    <MenuItem value="instructor" sx={fontSx}>
                      Giảng viên Hướng dẫn
                    </MenuItem>
                    <MenuItem value="reviewer" sx={fontSx}>
                      Giảng viên Phản biện
                    </MenuItem>
                    <MenuItem value="assembly" sx={fontSx}>
                      Hội đồng Đánh giá
                    </MenuItem>
                  </StyledInput>
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="ÁP DỤNG MẢNG ĐỀ TÀI"
                    name="rubric_topic_category"
                    select
                    value={formData.rubric_topic_category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rubric_topic_category: e.target.value,
                      })
                    }
                    inputProps={{ style: fontSx }}
                  >
                    <MenuItem value="" sx={fontSx}>
                      -- Tất cả các mảng --
                    </MenuItem>
                    {topicCategories.map((cat) => (
                      <MenuItem
                        key={cat._id}
                        value={cat._id}
                        sx={{ ...fontSx, fontWeight: 500 }}
                      >
                        {cat.topic_category_title}
                      </MenuItem>
                    ))}
                  </StyledInput>
                </Grid>
                <Grid item xs={12}>
                  <StyledInput
                    label="GHI CHÚ KÈM THEO"
                    name="rubric_note"
                    placeholder="Ghi chú quy chế đánh giá đặc biệt..."
                    multiline
                    rows={2}
                    value={formData.rubric_note}
                    onChange={(e) =>
                      setFormData({ ...formData, rubric_note: e.target.value })
                    }
                    inputProps={{ style: fontSx }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Box>
                  <Typography
                    sx={{ fontWeight: 800, color: "#1e293b", ...fontSx }}
                  >
                    2. Cấu trúc Tiêu chí Điểm số
                  </Typography>
                  <Typography
                    sx={{ color: C.slate, fontSize: "0.85rem", ...fontSx }}
                  >
                    Thước đo và phân tách các tiêu chí con. Tổng trọng số hoặc
                    Thang điểm cần được thống nhất.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<AddCriteriaIcon />}
                  onClick={addEvaluation}
                  sx={{
                    ...fontSx,
                    borderRadius: "10px",
                    fontWeight: 700,
                    borderColor: "#e2e8f0",
                    color: C.primaryDk,
                    bgcolor: "#fff",
                    "&:hover": { bgcolor: "#eff6ff" },
                  }}
                >
                  Thêm một nhánh Điểm (Tiêu chí mới)
                </Button>
              </Stack>

              {formData.rubric_evaluations.map((ev, idx) => (
                <Card
                  key={idx}
                  elevation={0}
                  sx={{
                    border: "2px solid #e2e8f0",
                    borderRadius: "16px",
                    mb: 3,
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  {/* Criteria Header */}
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      bgcolor: "#f1f5f9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #e2e8f0",
                      borderRadius: "14px 14px 0 0",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: 800, color: "#0f172a", ...fontSx }}
                    >
                      TIÊU CHÍ #{idx + 1}
                    </Typography>
                    {formData.rubric_evaluations.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => removeEvaluation(idx)}
                        color="error"
                        sx={{ bgcolor: "#fef2f2" }}
                      >
                        <RemoveCriteriaIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <StyledInput
                          label="MÔ TẢ NỘI DUNG YÊU CẦU TIÊU CHÍ"
                          required
                          placeholder="VD: Nội dung phần lý thuyết..."
                          value={ev.evaluation_criteria}
                          onChange={(e) =>
                            updateEvaluation(
                              idx,
                              "evaluation_criteria",
                              e.target.value,
                            )
                          }
                          inputProps={{ style: fontSx }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <StyledInput
                          label="THANG ĐIỂM TỐI ĐA"
                          type="number"
                          value={ev.grading_scale}
                          onChange={(e) =>
                            updateEvaluation(
                              idx,
                              "grading_scale",
                              e.target.value,
                            )
                          }
                          inputProps={{
                            style: {
                              ...fontSx,
                              fontWeight: 800,
                              color: C.primaryDk,
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <StyledInput
                          label="TRỌNG SỐ (HỆ SỐ MÚC)"
                          type="number"
                          value={ev.weight}
                          onChange={(e) =>
                            updateEvaluation(
                              idx,
                              "weight",
                              Number(e.target.value),
                            )
                          }
                          inputProps={{ style: fontSx }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </DialogContent>

          <Box
            sx={{
              px: 4,
              py: 2.5,
              bgcolor: "#fafbff",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Button
              onClick={handleClose}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                color: C.slate,
                px: 3,
                ...fontSx,
              }}
            >
              Hủy bỏ (Discard)
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 800,
                bgcolor: C.primaryDk,
                px: 4,
                ...fontSx,
                boxShadow: `0 4px 16px ${alpha(C.primary, 0.4)}`,
                "&:hover": {
                  bgcolor: C.primary,
                  transform: "translateY(-1px)",
                },
              }}
            >
              {editingItem
                ? "💾 Lưu mọi thay đổi"
                : "✨ Xác nhận thêm mới Rubric"}
            </Button>
          </Box>
        </form>
      </Dialog>
    </Box>
  );
};

export default RubricManagement;
