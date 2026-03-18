import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  LinearProgress,
  Grid,
  Tooltip,
  Switch,
  Stack,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CalendarMonth as CalIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as InactiveIcon,
  School as SchoolIcon,
  DateRange as DateRangeIcon,
  Close as CloseIcon,
  Bolt as BoltIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";

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

const SEMESTER_LABEL = { 1: "Học kỳ 1", 2: "Học kỳ 2", he: "Học kỳ Hè" };
const SEMESTER_COLOR = { 1: C.primary, 2: C.violet, he: C.emerald };
const SEMESTER_BG = { 1: "#eff6ff", 2: "#f5f3ff", he: "#ecfdf5" };

const alpha = (hex, op) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${op})`;
};

// ── sub-components ─────────────────────────────────────────────
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
  <Box>
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

// ──────────────────────────────────────────────────────────────
const SemesterManagement = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    school_year_start: new Date().getFullYear(),
    school_year_end: new Date().getFullYear() + 1,
    semester: "1",
    start_date: "",
    end_date: "",
    is_active: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/semesters");
      setSemesters(response.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách học kỳ",
      );
      setSemesters([]);
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
        school_year_start: item.school_year_start,
        school_year_end: item.school_year_end,
        semester: item.semester,
        start_date: item.start_date
          ? dayjs(item.start_date).format("YYYY-MM-DD")
          : "",
        end_date: item.end_date
          ? dayjs(item.end_date).format("YYYY-MM-DD")
          : "",
        is_active: item.is_active || false,
      });
    } else {
      setEditingItem(null);
      setFormData({
        school_year_start: new Date().getFullYear(),
        school_year_end: new Date().getFullYear() + 1,
        semester: "1",
        start_date: "",
        end_date: "",
        is_active: false,
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
    if (!formData.start_date || !formData.end_date) {
      toast.error("Vui lòng chọn ngày bắt đầu và ngày kết thúc");
      return;
    }
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error("Ngày kết thúc phải lớn hơn ngày bắt đầu");
      return;
    }
    const payload = {
      school_year_start: Number(formData.school_year_start),
      school_year_end: Number(formData.school_year_end),
      semester: formData.semester,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active,
    };
    try {
      if (editingItem) {
        await axios.put(`/api/semesters/${editingItem._id}`, payload);
        toast.success("Cập nhật học kỳ thành công");
      } else {
        await axios.post("/api/semesters", payload);
        toast.success("Thêm học kỳ thành công");
      }
      handleClose();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa học kỳ này?")) {
      try {
        await axios.delete(`/api/semesters/${id}`);
        toast.success("Xóa thành công");
        fetchData();
      } catch {
        toast.error("Xóa thất bại");
      }
    }
  };

  const handleSetActive = async (id) => {
    if (window.confirm("Chuyển học kỳ này thành học kỳ đang hoạt động?")) {
      try {
        await axios.put(`/api/semesters/${id}`, { is_active: true });
        toast.success("Đã thay đổi học kỳ hoạt động");
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Thao tác thất bại");
      }
    }
  };

  const activeSem = semesters.find((s) => s.is_active);
  const totalSem = semesters.length;

  // ── render ──────────────────────────────────────────────────
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
            }}
          >
            🎓 Quản lý Học kỳ
          </Typography>
          <Typography sx={{ color: C.slate, mt: 0.5, fontWeight: 500 }}>
            Tạo và quản lý các học kỳ · {totalSem} học kỳ
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
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
          Thêm học kỳ
        </Button>
      </Box>

      {/* Summary strip */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            label: "Tổng học kỳ",
            value: totalSem,
            color: C.primary,
            bg: "#eff6ff",
            icon: <CalIcon />,
          },
          {
            label: "Học kỳ không hoạt động",
            value: semesters.filter((s) => !s.is_active).length,
            color: C.slate,
            bg: "#f1f5f9",
            icon: <InactiveIcon />,
          },
          {
            label: "Đang hoạt động",
            value: activeSem
              ? `HK${activeSem.semester} (${activeSem.school_year_start}-${activeSem.school_year_end})`
              : "---",
            color: C.emerald,
            bg: "#ecfdf5",
            icon: <CheckCircleIcon />,
          },
          {
            label: "Số học kỳ Hè",
            value: semesters.filter((s) => s.semester === "he").length,
            color: C.amber,
            bg: "#fffbeb",
            icon: <DateRangeIcon />,
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
                    }}
                  >
                    {s.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: i === 0 ? "1.6rem" : "0.95rem",
                      fontWeight: 900,
                      color: "#0f172a",
                      lineHeight: 1.2,
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
      {loading ? (
        <LinearProgress
          sx={{
            borderRadius: 2,
            bgcolor: "#e0f2fe",
            "& .MuiLinearProgress-bar": { bgcolor: C.primary },
          }}
        />
      ) : semesters.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <CalIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
          <Typography variant="h6" sx={{ color: C.slate, fontWeight: 700 }}>
            Chưa có học kỳ nào
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
            Nhấn "Thêm học kỳ" để tạo học kỳ đầu tiên
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {semesters.map((item) => {
            const col = SEMESTER_COLOR[item.semester] || C.primary;
            const bg = SEMESTER_BG[item.semester] || "#eff6ff";
            return (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "20px",
                    border: item.is_active
                      ? `2px solid ${col}`
                      : "1px solid #e2e8f0",
                    bgcolor: "#fff",
                    boxShadow: item.is_active
                      ? `0 8px 32px ${alpha(col, 0.15)}`
                      : "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "all 0.25s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 16px 40px ${alpha(col, 0.18)}`,
                    },
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* top accent bar */}
                  <Box sx={{ height: 5, bgcolor: col }} />

                  <CardContent sx={{ p: 3 }}>
                    {/* Row 1: badge + status */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          px: 2,
                          py: 0.7,
                          borderRadius: "10px",
                          bgcolor: bg,
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          color: col,
                        }}
                      >
                        {SEMESTER_LABEL[item.semester] || `HK${item.semester}`}
                      </Box>
                      {item.is_active ? (
                        <Chip
                          icon={
                            <CheckCircleIcon
                              sx={{
                                fontSize: "0.95rem !important",
                                color: `${C.emerald} !important`,
                              }}
                            />
                          }
                          label="Đang hoạt động"
                          size="small"
                          sx={{
                            bgcolor: "#ecfdf5",
                            color: C.emerald,
                            fontWeight: 700,
                            borderRadius: "8px",
                            border: `1px solid ${alpha(C.emerald, 0.3)}`,
                          }}
                        />
                      ) : (
                        <Chip
                          label="Không hoạt động"
                          size="small"
                          sx={{
                            bgcolor: "#f1f5f9",
                            color: C.slate,
                            fontWeight: 600,
                            borderRadius: "8px",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#e0f2fe", color: C.primary },
                          }}
                          onClick={() => handleSetActive(item._id)}
                        />
                      )}
                    </Box>

                    {/* Row 2: year */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1.5,
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 18, color: C.slate }} />
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1.15rem",
                          color: "#1e293b",
                        }}
                      >
                        {item.school_year_start} – {item.school_year_end}
                      </Typography>
                    </Box>

                    {/* Row 3: dates */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1.5,
                        borderRadius: "12px",
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        mb: 2.5,
                      }}
                    >
                      <DateRangeIcon sx={{ fontSize: 16, color: C.slate }} />
                      <Typography
                        variant="caption"
                        sx={{ color: C.slate, fontWeight: 600 }}
                      >
                        {item.start_date
                          ? dayjs(item.start_date).format("DD/MM/YYYY")
                          : "---"}
                        {" → "}
                        {item.end_date
                          ? dayjs(item.end_date).format("DD/MM/YYYY")
                          : "---"}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon sx={{ fontSize: "0.9rem" }} />}
                        onClick={() => handleOpen(item)}
                        sx={{
                          flex: 1,
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          border: `1px solid ${alpha(col, 0.3)}`,
                          color: col,
                          bgcolor: bg,
                          "&:hover": { bgcolor: alpha(col, 0.15) },
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                      {!item.is_active && (
                        <Tooltip title="Xóa học kỳ">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item._id)}
                            sx={{
                              borderRadius: "10px",
                              border: "1px solid #fee2e2",
                              bgcolor: "#fff5f5",
                              color: C.rose,
                              "&:hover": { bgcolor: "#fee2e2" },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ── Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
            overflow: "hidden",
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Dialog header gradient */}
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
                <BoltIcon sx={{ color: "#fff", fontSize: 22 }} />
              </Box>
              <Box>
                <Typography
                  sx={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}
                >
                  {editingItem ? "Chỉnh sửa học kỳ" : "Thêm học kỳ mới"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}
                >
                  {editingItem
                    ? "Cập nhật thông tin học kỳ"
                    : "Điền đầy đủ thông tin bên dưới"}
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

          <DialogContent sx={{ px: 4, py: 3.5, bgcolor: "#fafbff" }}>
            <Grid container spacing={2.5}>
              {/* Semester type */}
              <Grid item xs={12}>
                <StyledInput
                  label="LOẠI HỌC KỲ"
                  select
                  required
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: e.target.value })
                  }
                >
                  <MenuItem value="1">Học kỳ 1</MenuItem>
                  <MenuItem value="2">Học kỳ 2</MenuItem>
                  <MenuItem value="he">Học kỳ Hè</MenuItem>
                </StyledInput>
              </Grid>

              {/* Year start / end */}
              <Grid item xs={6}>
                <StyledInput
                  label="NĂM HỌC BẮT ĐẦU"
                  type="number"
                  required
                  value={formData.school_year_start}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      school_year_start: e.target.value,
                    })
                  }
                  inputProps={{ min: 2000, max: 2100 }}
                />
              </Grid>
              <Grid item xs={6}>
                <StyledInput
                  label="NĂM HỌC KẾT THÚC"
                  type="number"
                  required
                  value={formData.school_year_end}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      school_year_end: e.target.value,
                    })
                  }
                  inputProps={{ min: 2000, max: 2100 }}
                />
              </Grid>

              {/* Date range */}
              <Grid item xs={6}>
                <StyledInput
                  label="NGÀY BẮT ĐẦU"
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <StyledInput
                  label="NGÀY KẾT THÚC"
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Preview pill */}
              {formData.school_year_start && formData.semester && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "14px",
                      bgcolor: "#eff6ff",
                      border: `1px dashed ${alpha(C.primary, 0.4)}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <CalIcon sx={{ color: C.primary, fontSize: 20 }} />
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: C.primaryDk,
                        fontSize: "0.9rem",
                      }}
                    >
                      Xem trước: {SEMESTER_LABEL[formData.semester]} (
                      {formData.school_year_start}–{formData.school_year_end})
                    </Typography>
                  </Box>
                </Grid>
              )}

              {/* Active toggle */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: formData.is_active ? "#ecfdf5" : "#f8fafc",
                    border: `1px solid ${formData.is_active ? alpha(C.emerald, 0.4) : "#e2e8f0"}`,
                    transition: "all 0.25s",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#1e293b",
                        fontSize: "0.9rem",
                      }}
                    >
                      Đặt làm học kỳ hiện tại
                    </Typography>
                    <Typography variant="caption" sx={{ color: C.slate }}>
                      {formData.is_active
                        ? "⚠️ Học kỳ khác sẽ tự động bị tắt"
                        : "Bấm để đặt học kỳ này là đang hoạt động"}
                    </Typography>
                  </Box>
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: C.emerald,
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        { bgcolor: C.emerald },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          {/* Dialog footer */}
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
              }}
            >
              Hủy bỏ
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
                boxShadow: `0 4px 16px ${alpha(C.primary, 0.4)}`,
                "&:hover": {
                  bgcolor: C.primary,
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s",
              }}
            >
              {editingItem ? "💾 Cập nhật" : "✨ Thêm mới"}
            </Button>
          </Box>
        </form>
      </Dialog>
    </Box>
  );
};

export default SemesterManagement;
