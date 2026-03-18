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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Grid,
  Tooltip,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Event as EventIcon,
  LinkOutlined as LinkIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  MoreTime as MoreTimeIcon,
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

const SEMESTER_LABEL = { 1: "Học kỳ 1", 2: "Học kỳ 2", he: "Học kỳ Hè" };

const formatSemester = (sem) => {
  if (!sem) return "—";
  const label = SEMESTER_LABEL[sem.semester] || `HK${sem.semester}`;
  return `${label} (${sem.school_year_start}-${sem.school_year_end})`;
};

const RegistrationPeriodManagement = () => {
  const [periods, setPeriods] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const defaultForm = {
    semester_id: "", // FK to Semester
    registration_period_semester: "", // auto-filled label
    registration_period_start: "",
    registration_period_end: "",
    registration_period_status: "active",
    allow_registration: true,
    allow_proposal: true,
    max_topics_per_student: 3,
    max_students_per_topic: 5,
  };
  const [formData, setFormData] = useState(defaultForm);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [periodsRes, semestersRes] = await Promise.all([
        axios.get("/api/registration-periods"),
        axios.get("/api/semesters"),
      ]);
      setPeriods(periodsRes.data.data || []);
      setSemesters(semestersRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu");
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── when semester_id changes → auto-fill label ─────────────────────────────
  const handleSemesterChange = (semId) => {
    const sem = semesters.find((s) => s._id === semId);
    const label = sem ? formatSemester(sem) : "";

    // Auto populate dates with current date matching format if blank
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 30);

    setFormData((prev) => ({
      ...prev,
      semester_id: semId,
      registration_period_semester: `Đợt đăng ký ${label}`,
      registration_period_start:
        prev.registration_period_start || now.toISOString().split("T")[0],
      registration_period_end:
        prev.registration_period_end || future.toISOString().split("T")[0],
    }));
  };

  // ── open dialog ────────────────────────────────────────────────────────────
  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        semester_id: item.semester_id?._id || item.semester_id || "",
        registration_period_semester: item.registration_period_semester || "",
        registration_period_start:
          item.registration_period_start?.split("T")[0] || "",
        registration_period_end:
          item.registration_period_end?.split("T")[0] || "",
        registration_period_status: item.registration_period_status || "active",
        allow_registration: item.allow_registration ?? true,
        allow_proposal: item.allow_proposal ?? true,
        max_topics_per_student: item.max_topics_per_student || 3,
        max_students_per_topic: item.max_students_per_topic || 5,
      });
    } else {
      setEditingItem(null);
      // Try to find the active semester dynamically
      const activeSem = semesters.find((s) => s.is_active);
      const newForm = { ...defaultForm };
      if (activeSem) {
        newForm.semester_id = activeSem._id;
        newForm.registration_period_semester = `Đợt đăng ký ${formatSemester(activeSem)}`;
        const now = new Date();
        const future = new Date();
        future.setDate(now.getDate() + 30);
        newForm.registration_period_start = now.toISOString().split("T")[0];
        newForm.registration_period_end = future.toISOString().split("T")[0];
      }
      setFormData(newForm);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
  };

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.semester_id) {
      toast.error("Vui lòng chọn học kỳ gốc để liên kết");
      return;
    }

    const startD = new Date(formData.registration_period_start);
    const endD = new Date(formData.registration_period_end);
    if (startD > endD) {
      toast.error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!");
      return;
    }

    const payload = {
      ...formData,
      max_topics_per_student: Number(formData.max_topics_per_student),
      max_students_per_topic: Number(formData.max_students_per_topic),
    };
    try {
      if (editingItem) {
        await axios.put(
          `/api/registration-periods/${editingItem._id}`,
          payload,
        );
        toast.success("Cập nhật quy định đợt đăng ký thành công");
      } else {
        await axios.post("/api/registration-periods", payload);
        toast.success("Mở đợt đăng ký thành công");
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
        "Bạn có chắc chắn muốn xóa đợt đăng ký này? Việc này sẽ ảnh hưởng tới sinh viên đang đăng ký.",
      )
    ) {
      try {
        await axios.delete(`/api/registration-periods/${id}`);
        toast.success("Xóa đợt thành công");
        fetchData();
      } catch (error) {
        toast.error("Xóa thất bại");
      }
    }
  };

  const isActive = (item) =>
    item.registration_period_status === "active" &&
    new Date() >= new Date(item.registration_period_start) &&
    new Date() <= new Date(item.registration_period_end);

  const activePeriodsCount = periods.filter((p) => isActive(p)).length;

  // ── render ─────────────────────────────────────────────────────────────────
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
            ⏳ Quản lý Đợt đăng ký
          </Typography>
          <Typography
            sx={{ color: C.slate, mt: 0.5, fontWeight: 500, ...fontSx }}
          >
            Mở hoặc đóng cổng đăng ký đề tài, giới hạn đồ án theo từng học kỳ
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
          Mở Đợt Đăng Ký
        </Button>
      </Box>

      {semesters.length === 0 && !loading && (
        <Alert
          severity="warning"
          sx={{ mb: 2, ...fontSx, borderRadius: "12px" }}
        >
          Chưa có hệ thống học kỳ. Vui lòng vào <strong>Quản lý Học kỳ</strong>{" "}
          để tạo mới trước khi tiến hành bước này.
        </Alert>
      )}

      {/* Summary strip */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            label: "Tổng đợt đăng ký",
            value: periods.length,
            color: C.violet,
            bg: "#f3e8ff",
            icon: <AccessTimeIcon />,
          },
          {
            label: "Đang mở cửa",
            value: activePeriodsCount,
            color: C.emerald,
            bg: "#d1fae5",
            icon: <EventIcon />,
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

      {loading ? (
        <LinearProgress
          sx={{
            borderRadius: 2,
            bgcolor: "#e0f2fe",
            "& .MuiLinearProgress-bar": { bgcolor: C.primary },
          }}
        />
      ) : periods.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
          }}
          elevation={0}
        >
          <EventIcon sx={{ fontSize: 60, color: "#cbd5e1", mb: 2 }} />
          <Typography
            variant="h6"
            color="#475569"
            sx={{ fontWeight: 800, ...fontSx }}
            gutterBottom
          >
            Danh sách Đợt đăng ký rỗng
          </Typography>
          <Typography
            variant="body2"
            color="#64748b"
            sx={{ fontWeight: 500, ...fontSx }}
          >
            Khoảng thời gian này quyết định lúc nào sinh viên được tiến hành
            chọn đề tài.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            "&::-webkit-scrollbar": { height: 8 },
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell
                  sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                >
                  Tên Sự kiện
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                >
                  Gắn liền Học kỳ
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                >
                  Timeline Mở / Đóng
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                >
                  Tình trạng
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                >
                  Đề xuất / Đăng ký
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {periods.map((item) => {
                const isItemActive = isActive(item);
                return (
                  <TableRow
                    key={item._id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>
                      <Typography
                        sx={{ fontWeight: 700, color: "#1e293b", ...fontSx }}
                      >
                        {item.registration_period_semester}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {item.semester_id ? (
                        <Chip
                          icon={
                            <LinkIcon sx={{ fontSize: "14px !important" }} />
                          }
                          label={formatSemester(item.semester_id)}
                          size="small"
                          sx={{
                            bgcolor: "#f1f5f9",
                            fontWeight: 600,
                            color: C.slate,
                            borderRadius: "8px",
                            "& .MuiChip-icon": { color: C.primary },
                          }}
                        />
                      ) : (
                        <Typography
                          variant="caption"
                          sx={{ color: "#94a3b8", fontWeight: 500, ...fontSx }}
                        >
                          Chưa liên kết
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          bgcolor: "#f8fafc",
                          px: 1.5,
                          py: 1,
                          borderRadius: "8px",
                          display: "inline-block",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: C.emerald,
                            ...fontSx,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          Bắt đầu:{" "}
                          {new Date(
                            item.registration_period_start,
                          ).toLocaleDateString("vi-VN")}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: C.rose,
                            ...fontSx,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          Kết thúc:{" "}
                          {new Date(
                            item.registration_period_end,
                          ).toLocaleDateString("vi-VN")}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {isItemActive ? (
                        <Chip
                          label="🟢 Đang diễn ra"
                          size="small"
                          color="success"
                          sx={{
                            fontWeight: 700,
                            ...fontSx,
                            borderRadius: "8px",
                          }}
                        />
                      ) : (
                        <Chip
                          label="Đã ngừng"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            ...fontSx,
                            bgcolor: "#f1f5f9",
                            color: "#64748b",
                            borderRadius: "8px",
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label="Đề xuất"
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            borderRadius: "6px",
                            borderColor: item.allow_proposal
                              ? C.emerald
                              : "#e2e8f0",
                            color: item.allow_proposal ? C.emerald : "#cbd5e1",
                            bgcolor: item.allow_proposal
                              ? "#ecfdf5"
                              : "transparent",
                          }}
                        />
                        <Chip
                          label="Đăng ký"
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            borderRadius: "6px",
                            borderColor: item.allow_registration
                              ? C.primary
                              : "#e2e8f0",
                            color: item.allow_registration
                              ? C.primary
                              : "#cbd5e1",
                            bgcolor: item.allow_registration
                              ? "#eff6ff"
                              : "transparent",
                          }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          sx={{ color: "#3b82f6", mr: 1, bgcolor: "#eff6ff" }}
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Dialog header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${C.primaryDk} 0%, ${C.primary} 100%)`,
              px: 4,
              py: 3,
              position: "relative",
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
                <MoreTimeIcon sx={{ color: "#fff", fontSize: 22 }} />
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
                  {editingItem ? "Sửa cài đặt Timeline" : "Mở đợt đăng ký mới"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 500,
                    ...fontSx,
                  }}
                >
                  Tích hợp trực tiếp lịch với chu kỳ Học kỳ hiện tại
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

          <DialogContent sx={{ p: 4, bgcolor: "#fafbff" }}>
            <Box
              sx={{
                bgcolor: "#fff",
                p: 3,
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                mb: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <StyledInput
                    label="GẮN VÀO HỌC KỲ TRỌNG TÂM"
                    select
                    required
                    value={formData.semester_id}
                    onChange={(e) => handleSemesterChange(e.target.value)}
                    inputProps={{ style: fontSx }}
                  >
                    <MenuItem value="" sx={{ ...fontSx, color: C.slate }}>
                      -- Hãy chọn một học kỳ --
                    </MenuItem>
                    {semesters.map((sem) => (
                      <MenuItem
                        key={sem._id}
                        value={sem._id}
                        sx={{ ...fontSx, fontWeight: 500 }}
                      >
                        {formatSemester(sem)}{" "}
                        {sem.is_active ? " (Đang diễn ra)" : ""}
                      </MenuItem>
                    ))}
                  </StyledInput>
                </Grid>

                <Grid item xs={12}>
                  <StyledInput
                    label="TÊN ĐỢT ĐĂNG KÝ (HIỂN THỊ VỚI SINH VIÊN)"
                    required
                    placeholder="VD: Đợt đăng ký Học kỳ 1..."
                    value={formData.registration_period_semester}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registration_period_semester: e.target.value,
                      })
                    }
                    inputProps={{ style: fontSx }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="NGÀY BẮT ĐẦU CHO PHÉP ĐĂNG KÝ"
                    type="date"
                    required
                    InputLabelProps={{ shrink: true, style: fontSx }}
                    inputProps={{ style: fontSx }}
                    value={formData.registration_period_start}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registration_period_start: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="NGÀY ĐÓNG CỬA HỆ THỐNG"
                    type="date"
                    required
                    InputLabelProps={{ shrink: true, style: fontSx }}
                    inputProps={{ style: fontSx }}
                    value={formData.registration_period_end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registration_period_end: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <StyledInput
                    label="CƯỠNG ÉP TRẠNG THÁI (STATUS)"
                    select
                    value={formData.registration_period_status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registration_period_status: e.target.value,
                      })
                    }
                    inputProps={{ style: fontSx }}
                  >
                    <MenuItem
                      value="active"
                      sx={{ ...fontSx, color: C.emerald, fontWeight: 700 }}
                    >
                      🟢 Giữ trạng thái Hoạt động
                    </MenuItem>
                    <MenuItem
                      value="closed"
                      sx={{ ...fontSx, color: C.rose, fontWeight: 700 }}
                    >
                      🔴 Đóng đăng ký khẩn cấp
                    </MenuItem>
                  </StyledInput>
                </Grid>
              </Grid>
            </Box>

            <Box
              sx={{
                bgcolor: "#fff",
                p: 3,
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
              }}
            >
              <Typography
                sx={{ fontWeight: 800, color: "#1e293b", mb: 2, ...fontSx }}
              >
                Quyền lợi & Giới hạn của Sinh Viên
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.allow_registration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allow_registration: e.target.checked,
                          })
                        }
                        color="success"
                      />
                    }
                    label={
                      <Typography
                        sx={{ fontWeight: 600, ...fontSx, color: "#475569" }}
                      >
                        Mở chức năng Đăng ký
                      </Typography>
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.allow_proposal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allow_proposal: e.target.checked,
                          })
                        }
                        color="success"
                      />
                    }
                    label={
                      <Typography
                        sx={{ fontWeight: 600, ...fontSx, color: "#475569" }}
                      >
                        Cho gửi Đề xuất mới
                      </Typography>
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="GIỚI HẠN ĐỀ TÀI / SV"
                    type="number"
                    value={formData.max_topics_per_student}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_topics_per_student: e.target.value,
                      })
                    }
                    inputProps={{ min: 1, max: 10, style: fontSx }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="SỐ LƯỢNG SV / MỖI ĐỀ TÀI"
                    type="number"
                    value={formData.max_students_per_topic}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_students_per_topic: e.target.value,
                      })
                    }
                    inputProps={{ min: 1, max: 20, style: fontSx }}
                  />
                </Grid>
              </Grid>
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
              Về sau
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={semesters.length === 0}
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
              {editingItem ? "💾 Cập nhật Timeline" : "✨ Xác nhận Mở cổng"}
            </Button>
          </Box>
        </form>
      </Dialog>
    </Box>
  );
};

export default RegistrationPeriodManagement;
