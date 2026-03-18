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
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  MenuItem,
  Stack,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Domain as DomainIcon,
  School as SchoolIcon,
  Bolt as BoltIcon,
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

const FacultyMajorManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    faculty_title: "",
    faculty_code: "",
    faculty_description: "",
    major_title: "",
    major_code: "",
    major_faculty: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facultyRes, majorRes] = await Promise.all([
        axios.get("/api/faculties"),
        axios.get("/api/majors"),
      ]);
      setFaculties(facultyRes.data.data || []);
      setMajors(majorRes.data.data || []);
    } catch (error) {
      console.error("Fetch data error:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      if (tabValue === 0) {
        setFormData({
          faculty_code: item.faculty_code || "",
          faculty_title: item.faculty_title,
          faculty_description: item.faculty_description || "",
        });
      } else {
        setFormData({
          major_code: item.major_code || "",
          major_title: item.major_title,
          major_faculty: item.major_faculty?._id || item.major_faculty || "",
        });
      }
    } else {
      setEditingItem(null);
      setFormData(
        tabValue === 0
          ? { faculty_code: "", faculty_title: "", faculty_description: "" }
          : { major_code: "", major_title: "", major_faculty: "" },
      );
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (tabValue === 0) {
        if (!formData.faculty_code || !formData.faculty_title) {
          toast.error("Vui lòng nhập Mã khoa và Tên khoa");
          return;
        }
        if (editingItem) {
          await axios.put(`/api/faculties/${editingItem._id}`, {
            faculty_code: formData.faculty_code,
            faculty_title: formData.faculty_title,
            faculty_description: formData.faculty_description,
          });
          toast.success("Cập nhật khoa thành công");
        } else {
          await axios.post("/api/faculties", {
            faculty_code: formData.faculty_code,
            faculty_title: formData.faculty_title,
            faculty_description: formData.faculty_description,
          });
          toast.success("Tạo khoa thành công");
        }
      } else {
        if (
          !formData.major_code ||
          !formData.major_title ||
          !formData.major_faculty
        ) {
          toast.error("Vui lòng nhập đầy đủ Mã ngành, Tên ngành và chọn Khoa");
          return;
        }
        if (editingItem) {
          await axios.put(`/api/majors/${editingItem._id}`, {
            major_code: formData.major_code,
            major_title: formData.major_title,
            major_faculty: formData.major_faculty,
          });
          toast.success("Cập nhật ngành thành công");
        } else {
          await axios.post("/api/majors", {
            major_code: formData.major_code,
            major_title: formData.major_title,
            major_faculty: formData.major_faculty,
          });
          toast.success("Tạo ngành thành công");
        }
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi lưu dữ liệu");
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      try {
        const endpoint =
          tabValue === 0 ? `/api/faculties/${itemId}` : `/api/majors/${itemId}`;
        await axios.delete(endpoint);
        toast.success("Xóa thành công");
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi xóa dữ liệu");
      }
    }
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
            🏢 Quản lý Khoa &amp; Ngành
          </Typography>
          <Typography
            sx={{ color: C.slate, mt: 0.5, fontWeight: 500, ...fontSx }}
          >
            Quản lý cơ cấu phòng ban, khoa viện và các chuyên ngành đào tạo
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
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
          {tabValue === 0 ? "Thêm khoa mới" : "Thêm ngành mới"}
        </Button>
      </Box>

      {/* Summary strip */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            label: "Tổng số Khoa",
            value: faculties.length,
            color: C.violet,
            bg: "#f5f3ff",
            icon: <DomainIcon />,
          },
          {
            label: "Tổng số Ngành",
            value: majors.length,
            color: C.emerald,
            bg: "#ecfdf5",
            icon: <SchoolIcon />,
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
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          sx={{
            borderBottom: "1px solid #e2e8f0",
            bgcolor: "#fafbfc",
            "& .MuiTab-root": { fontWeight: 700, ...fontSx, px: 4, py: 2 },
            "& .Mui-selected": { color: C.primaryDk },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              bgcolor: C.primaryDk,
            },
          }}
        >
          <Tab label="Quản Lý Khoa" />
          <Tab label="Quản Lý Ngành" />
        </Tabs>

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
            <>
              {tabValue === 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                        <TableCell
                          sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                        >
                          Mã Khoa
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                        >
                          Tên Khoa
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                        >
                          Mô Tả
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                          align="right"
                        >
                          Hành Động
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {faculties.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                            <Typography
                              sx={{
                                color: C.slate,
                                fontWeight: 600,
                                ...fontSx,
                              }}
                            >
                              Chưa có dữ liệu Khoa
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        faculties.map((faculty) => (
                          <TableRow
                            key={faculty._id}
                            hover
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                ...fontSx,
                                color: C.primaryDk,
                              }}
                            >
                              <Chip
                                label={faculty.faculty_code || "---"}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: "#eff6ff",
                                  color: C.primaryDk,
                                  borderRadius: "8px",
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, ...fontSx }}>
                              {faculty.faculty_title}
                            </TableCell>
                            <TableCell sx={{ ...fontSx, color: C.slate }}>
                              {faculty.faculty_description || "—"}
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Chỉnh sửa">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#3b82f6",
                                    mr: 1,
                                    bgcolor: "#eff6ff",
                                  }}
                                  onClick={() => handleOpenDialog(faculty)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  size="small"
                                  color="error"
                                  sx={{ bgcolor: "#fef2f2" }}
                                  onClick={() => handleDelete(faculty._id)}
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
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                        <TableCell
                          sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                        >
                          Mã Ngành
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                        >
                          Tên Ngành
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                        >
                          Trực thuộc Khoa
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                          align="right"
                        >
                          Hành Động
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {majors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                            <Typography
                              sx={{
                                color: C.slate,
                                fontWeight: 600,
                                ...fontSx,
                              }}
                            >
                              Chưa có dữ liệu Ngành
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        majors.map((major) => (
                          <TableRow
                            key={major._id}
                            hover
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell sx={{ fontWeight: 700, ...fontSx }}>
                              <Chip
                                label={major.major_code || "---"}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: "#f5f3ff",
                                  color: C.violet,
                                  borderRadius: "8px",
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, ...fontSx }}>
                              {major.major_title}
                            </TableCell>
                            <TableCell sx={{ ...fontSx }}>
                              <Chip
                                icon={
                                  <DomainIcon
                                    sx={{ fontSize: "1rem !important" }}
                                  />
                                }
                                label={
                                  major.major_faculty?.faculty_title ||
                                  faculties.find(
                                    (f) =>
                                      f._id ===
                                      (major.major_faculty?._id ||
                                        major.major_faculty),
                                  )?.faculty_title ||
                                  "N/A"
                                }
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontWeight: 600,
                                  borderRadius: "8px",
                                  borderColor: "#e2e8f0",
                                  color: C.slate,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Chỉnh sửa">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#3b82f6",
                                    mr: 1,
                                    bgcolor: "#eff6ff",
                                  }}
                                  onClick={() => handleOpenDialog(major)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  size="small"
                                  color="error"
                                  sx={{ bgcolor: "#fef2f2" }}
                                  onClick={() => handleDelete(major._id)}
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
            </>
          )}
        </Box>
      </Paper>

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
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
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 900,
                    color: "#fff",
                    ...fontSx,
                  }}
                >
                  {tabValue === 0
                    ? editingItem
                      ? "Chỉnh Sửa Thông Tin Khoa"
                      : "Thêm Khoa Mới"
                    : editingItem
                      ? "Chỉnh Sửa Thông Tin Ngành"
                      : "Thêm Ngành Mới"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 500,
                    ...fontSx,
                  }}
                >
                  {editingItem
                    ? "Cập nhật dữ liệu vào hệ thống"
                    : "Nhập đầy đủ các thông tin cần thiết"}
                </Typography>
              </Box>
            </Stack>
            <IconButton
              onClick={handleCloseDialog}
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
            {tabValue === 0 ? (
              <>
                <StyledInput
                  label="MÃ KHOA"
                  name="faculty_code"
                  placeholder="Ví dụ: CNTT"
                  required
                  value={formData.faculty_code}
                  onChange={handleChange}
                  inputProps={{ style: fontSx, textTransform: "uppercase" }}
                />
                <StyledInput
                  label="TÊN KHOA"
                  name="faculty_title"
                  placeholder="Ví dụ: Khoa Công nghệ Thông tin"
                  required
                  value={formData.faculty_title}
                  onChange={handleChange}
                  inputProps={{ style: fontSx }}
                />
                <StyledInput
                  label="MÔ TẢ KHOA"
                  name="faculty_description"
                  placeholder="Thông tin thêm..."
                  multiline
                  rows={3}
                  value={formData.faculty_description}
                  onChange={handleChange}
                  inputProps={{ style: fontSx }}
                />
              </>
            ) : (
              <>
                <StyledInput
                  label="MÃ NGÀNH"
                  name="major_code"
                  placeholder="Ví dụ: KTPM"
                  required
                  value={formData.major_code}
                  onChange={handleChange}
                  inputProps={{ style: fontSx, textTransform: "uppercase" }}
                />
                <StyledInput
                  label="TÊN NGÀNH"
                  name="major_title"
                  placeholder="Ví dụ: Kỹ thuật Phần mềm"
                  required
                  value={formData.major_title}
                  onChange={handleChange}
                  inputProps={{ style: fontSx }}
                />
                <StyledInput
                  label="KHOA QUẢN LÝ"
                  name="major_faculty"
                  select
                  required
                  value={formData.major_faculty}
                  onChange={handleChange}
                  SelectProps={{ style: fontSx }}
                >
                  <MenuItem value="" sx={fontSx} disabled>
                    -- Chọn khoa --
                  </MenuItem>
                  {faculties.map((f) => (
                    <MenuItem
                      key={f._id}
                      value={f._id}
                      sx={{ ...fontSx, fontWeight: 500 }}
                    >
                      {f.faculty_code ? `[${f.faculty_code}] ` : ""}
                      {f.faculty_title}
                    </MenuItem>
                  ))}
                </StyledInput>
              </>
            )}
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
              onClick={handleCloseDialog}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                color: C.slate,
                px: 3,
                ...fontSx,
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
                ...fontSx,
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

export default FacultyMajorManagement;
