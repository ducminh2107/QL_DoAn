import React, { useState, useEffect, useMemo } from "react";
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
  InputAdornment,
  TablePagination,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  Badge as BadgeIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const ROLE_LABEL = {
  student: "Sinh viên",
  teacher: "Giảng viên",
  admin: "Quản trị viên",
};
const ROLE_COLOR = { student: "primary", teacher: "warning", admin: "error" };
const ROWS_PER_PAGE = 10;

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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Filters & pagination
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);

  const [formData, setFormData] = useState({
    user_id: "",
    user_name: "",
    email: "",
    role: "student",
    user_title: "",
    user_faculty: "",
    user_major: "",
    user_phone: "",
    user_gender: "Nam",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, facRes, majorRes] = await Promise.all([
        axios.get("/api/users"),
        axios.get("/api/faculties"),
        axios.get("/api/majors"),
      ]);
      setUsers(usersRes.data.data || []);
      setFaculties(facRes.data.data || []);
      setMajors(majorRes.data.data || []);
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách người dùng",
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset to page 0 when filter/search changes
  useEffect(() => {
    setPage(0);
  }, [roleFilter, searchTerm]);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !search ||
        u.user_name?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search) ||
        u.user_id?.toLowerCase().includes(search);
      return matchRole && matchSearch;
    });
  }, [users, roleFilter, searchTerm]);

  // Paginated
  const paginatedUsers = useMemo(() => {
    const start = page * ROWS_PER_PAGE;
    return filteredUsers.slice(start, start + ROWS_PER_PAGE);
  }, [filteredUsers, page]);

  // Stats
  const stats = useMemo(
    () => ({
      all: users.length,
      student: users.filter((u) => u.role === "student").length,
      teacher: users.filter((u) => u.role === "teacher").length,
      admin: users.filter((u) => u.role === "admin").length,
    }),
    [users],
  );

  const handleOpen = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        role: user.role,
        user_title: user.user_title || "",
        user_major: user.user_major?._id || user.user_major || "",
        user_faculty: user.user_faculty?._id || user.user_faculty || "",
        user_gender: user.user_gender || "Nam",
        user_phone: user.user_phone || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        user_id: "",
        user_name: "",
        email: "",
        role: "student",
        user_title: "",
        user_major: "",
        user_faculty: "",
        user_gender: "Nam",
        user_phone: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.user_faculty) delete payload.user_faculty;
      if (!payload.user_major) delete payload.user_major;

      if (payload.role !== "teacher") {
        delete payload.user_title;
      }

      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, payload);
        toast.success("Cập nhật tài khoản thành công");
      } else {
        await axios.post("/api/users", payload);
        toast.success("Thêm người dùng thành công");
      }
      handleClose();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa tài khoản này khỏi hệ thống?")
    ) {
      try {
        await axios.delete(`/api/users/${id}`);
        toast.success("Xóa tài khoản thành công");
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Xóa thất bại");
      }
    }
  };

  const getFacultyMajor = (user) => {
    const extractName = (field, key) => {
      if (!field) return "";
      if (typeof field === "object") return field[key] || field._id || "";
      return String(field);
    };

    const faculty = extractName(user.user_faculty, "faculty_title");
    const major = extractName(user.user_major, "major_title");

    if (!faculty && !major) return "—";
    if (!major) return faculty;
    return `${faculty} / ${major}`;
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
            👥 Quản lý Người dùng
          </Typography>
          <Typography
            sx={{ color: C.slate, mt: 0.5, fontWeight: 500, ...fontSx }}
          >
            Danh sách tất cả tài khoản trong hệ thống
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
          Cấp phát Tài khoản
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            key: "all",
            label: "Tổng số User",
            icon: <PeopleIcon />,
            color: "#1e3a8a",
            bg: "#eff6ff",
          },
          {
            key: "student",
            label: "Sinh viên",
            icon: <SchoolIcon />,
            color: C.primary,
            bg: "#dbeafe",
          },
          {
            key: "teacher",
            label: "Giảng viên",
            icon: <BadgeIcon />,
            color: C.amber,
            bg: "#fef3c7",
          },
          {
            key: "admin",
            label: "Quản trị viên",
            icon: <AdminIcon />,
            color: C.rose,
            bg: "#fee2e2",
          },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.key}>
            <Card
              onClick={() => setRoleFilter(s.key)}
              elevation={0}
              sx={{
                borderRadius: "18px",
                border: `2px solid ${roleFilter === s.key ? s.color : "#e2e8f0"}`,
                bgcolor: roleFilter === s.key ? s.bg : "#fff",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: s.color,
                  boxShadow: `0 10px 20px -10px ${alpha(s.color, 0.3)}`,
                },
              }}
            >
              <CardContent
                sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "12px",
                    bgcolor: s.bg !== "#fff" ? "#fff" : s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& svg": {
                      color: s.color,
                      fontSize: 24,
                      fill: s.color,
                      stroke: s.color,
                      strokeWidth: 0.5,
                    },
                    border: `1px solid ${alpha(s.color, 0.2)}`,
                  }}
                >
                  {s.icon}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: s.color === "#1e3a8a" ? C.slate : s.color,
                      opacity: 0.8,
                      ...fontSx,
                    }}
                  >
                    {s.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.6rem",
                      fontWeight: 900,
                      color: s.color,
                      lineHeight: 1.2,
                      ...fontSx,
                    }}
                  >
                    {stats[s.key]}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter and Content Box */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          overflow: "hidden",
          bgcolor: "#fff",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #e2e8f0",
            bgcolor: "#fafbff",
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            placeholder="Tìm theo Mã, Tên, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              flex: 1,
              minWidth: 260,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                bgcolor: "#fff",
                "& fieldset": { borderColor: "#e2e8f0" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
              style: { ...fontSx, fontSize: "0.9rem", fontWeight: 500 },
            }}
          />
          <ToggleButtonGroup
            value={roleFilter}
            exclusive
            onChange={(e, val) => val !== null && setRoleFilter(val)}
            size="small"
            sx={{
              bgcolor: "#fff",
              "& .MuiToggleButton-root": {
                ...fontSx,
                fontWeight: 600,
                px: 2,
                borderColor: "#e2e8f0",
                color: C.slate,
                textTransform: "none",
              },
              "& .Mui-selected": {
                bgcolor: "#f1f5f9 !important",
                color: "#0f172a !important",
              },
            }}
          >
            <ToggleButton value="all">Tất cả</ToggleButton>
            <ToggleButton value="student">SV ({stats.student})</ToggleButton>
            <ToggleButton value="teacher">GV ({stats.teacher})</ToggleButton>
            <ToggleButton value="admin">Admin</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {loading ? (
            <LinearProgress
              sx={{
                borderRadius: 2,
                bgcolor: "#e0f2fe",
                "& .MuiLinearProgress-bar": { bgcolor: C.primary },
              }}
            />
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography sx={{ color: C.slate, fontWeight: 600, ...fontSx }}>
                Không tìm thấy người dùng nào phù hợp với bộ lọc!
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell
                      sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                    >
                      #
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                    >
                      Mã ND
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                    >
                      Thông tin cá nhân
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                    >
                      Vai trò
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                    >
                      Đơn vị / Cơ sở
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
                  {paginatedUsers.map((user, idx) => (
                    <TableRow
                      key={user._id}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell
                        sx={{ color: "#94a3b8", fontWeight: 600, ...fontSx }}
                      >
                        {page * ROWS_PER_PAGE + idx + 1}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          color: "#1e293b",
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: "#f1f5f9",
                            px: 1,
                            py: 0.5,
                            borderRadius: "6px",
                            display: "inline-block",
                          }}
                        >
                          {user.user_id}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{ fontWeight: 800, color: "#0f172a", ...fontSx }}
                        >
                          {user.role === "teacher" && user.user_title
                            ? `${user.user_title} `
                            : ""}
                          {user.user_name}
                        </Typography>
                        <Typography
                          sx={{ color: C.slate, fontSize: "0.8rem", ...fontSx }}
                        >
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={
                            user.role === "admin" ? (
                              <AdminIcon sx={{ fontSize: "14px !important" }} />
                            ) : user.role === "teacher" ? (
                              <BadgeIcon sx={{ fontSize: "14px !important" }} />
                            ) : (
                              <SchoolIcon
                                sx={{ fontSize: "14px !important" }}
                              />
                            )
                          }
                          label={ROLE_LABEL[user.role] || user.role}
                          color={ROLE_COLOR[user.role] || "default"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            borderRadius: "8px",
                            textTransform: "uppercase",
                            fontSize: "0.68rem",
                            letterSpacing: "0.02em",
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          ...fontSx,
                          color: C.slate,
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          maxWidth: 200,
                          WebkitLineClamp: 2,
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          borderBottom: "none",
                        }}
                      >
                        {getFacultyMajor(user)}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            sx={{ color: "#3b82f6", mr: 1, bgcolor: "#eff6ff" }}
                            onClick={() => handleOpen(user)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            color="error"
                            sx={{ bgcolor: "#fef2f2" }}
                            onClick={() => handleDelete(user._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={ROWS_PER_PAGE}
            rowsPerPageOptions={[ROWS_PER_PAGE]}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} / Tổng ${count}`
            }
            sx={{
              borderTop: "1px solid #e2e8f0",
              mt: 2,
              ...fontSx,
              "& *": { ...fontSx, fontWeight: 600 },
            }}
          />
        </Box>
      </Paper>

      {/* Dialog Cấp phát / Cập nhật */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
            overflow: "hidden",
            height: "auto",
          },
        }}
        scroll="paper"
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
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
                <AdminIcon sx={{ color: "#fff", fontSize: 22 }} />
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
                  {editingUser
                    ? "Cập nhật Hồ sơ Người dùng"
                    : "Cấp phát Tài khoản Mới"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 500,
                    ...fontSx,
                  }}
                >
                  {editingUser
                    ? "Chỉnh sửa thẩm quyền và thông tin"
                    : "Mật khẩu mặc định là: 123456"}
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
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="MÃ / TÊN TÀI KHOẢN (USER ID)"
                    required
                    name="user_id"
                    placeholder="SV01, GV01..."
                    value={formData.user_id}
                    onChange={(e) =>
                      setFormData({ ...formData, user_id: e.target.value })
                    }
                    inputProps={{ style: fontSx }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="VAI TRÒ TRONG HỆ THỐNG"
                    select
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    inputProps={{
                      style: {
                        ...fontSx,
                        fontWeight: 700,
                        color:
                          ROLE_COLOR[formData.role] === "primary"
                            ? C.primaryDk
                            : ROLE_COLOR[formData.role] === "warning"
                              ? C.amber
                              : C.rose,
                      },
                    }}
                  >
                    <MenuItem
                      value="student"
                      sx={{ ...fontSx, fontWeight: 600 }}
                    >
                      🎓 Sinh viên
                    </MenuItem>
                    <MenuItem
                      value="teacher"
                      sx={{ ...fontSx, fontWeight: 600 }}
                    >
                      👨‍🏫 Giảng viên
                    </MenuItem>
                    <MenuItem value="admin" sx={{ ...fontSx, fontWeight: 600 }}>
                      🛡️ Quản trị viên
                    </MenuItem>
                  </StyledInput>
                </Grid>
                {formData.role === "teacher" && (
                  <Grid item xs={12} md={6}>
                    <StyledInput
                      label="HỌC HÀM / HỌC VỊ"
                      select
                      value={formData.user_title}
                      onChange={(e) =>
                        setFormData({ ...formData, user_title: e.target.value })
                      }
                      inputProps={{ style: fontSx }}
                    >
                      <MenuItem
                        value=""
                        sx={{ ...fontSx, fontStyle: "italic", color: C.slate }}
                      >
                        -- Trống --
                      </MenuItem>
                      <MenuItem value="Cử nhân" sx={fontSx}>
                        Cử nhân
                      </MenuItem>
                      <MenuItem value="Kỹ sư" sx={fontSx}>
                        Kỹ sư
                      </MenuItem>
                      <MenuItem value="Thạc sĩ" sx={fontSx}>
                        Thạc sĩ (ThS)
                      </MenuItem>
                      <MenuItem value="Tiến sĩ" sx={fontSx}>
                        Tiến sĩ (TS)
                      </MenuItem>
                      <MenuItem value="PGS.TS" sx={fontSx}>
                        Phó Giáo sư, Tiến sĩ (PGS.TS)
                      </MenuItem>
                      <MenuItem value="GS.TS" sx={fontSx}>
                        Giáo sư, Tiến sĩ (GS.TS)
                      </MenuItem>
                      <MenuItem value="Khác" sx={fontSx}>
                        Khác
                      </MenuItem>
                    </StyledInput>
                  </Grid>
                )}
                <Grid item xs={12} md={formData.role === "teacher" ? 6 : 12}>
                  <StyledInput
                    label="HỌ VÀ TÊN"
                    required
                    value={formData.user_name}
                    onChange={(e) =>
                      setFormData({ ...formData, user_name: e.target.value })
                    }
                    inputProps={{ style: fontSx }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="ĐỊA CHỈ EMAIL"
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    inputProps={{ style: fontSx }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="SỐ ĐIỆN THOẠI"
                    value={formData.user_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, user_phone: e.target.value })
                    }
                    inputProps={{ style: fontSx }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="GIỚI TÍNH"
                    select
                    value={formData.user_gender}
                    onChange={(e) =>
                      setFormData({ ...formData, user_gender: e.target.value })
                    }
                    inputProps={{ style: fontSx }}
                  >
                    <MenuItem value="Nam" sx={fontSx}>
                      Nam
                    </MenuItem>
                    <MenuItem value="Nữ" sx={fontSx}>
                      Nữ
                    </MenuItem>
                    <MenuItem value="Khác" sx={fontSx}>
                      Khác
                    </MenuItem>
                  </StyledInput>
                </Grid>

                {/* Bổ sung chuyên ngành & Khoa quản lý từ db trực tiếp */}
                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="TRỰC THUỘC KHOA"
                    select
                    value={formData.user_faculty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        user_faculty: e.target.value,
                        user_major: "",
                      })
                    } /* Clear major if faculty changes */
                    inputProps={{ style: fontSx }}
                  >
                    <MenuItem
                      value=""
                      sx={{ ...fontSx, fontStyle: "italic", color: C.slate }}
                    >
                      -- Bỏ qua --
                    </MenuItem>
                    {faculties.map((f) => (
                      <MenuItem
                        key={f._id}
                        value={f._id}
                        sx={{ ...fontSx, fontWeight: 500 }}
                      >
                        {f.faculty_title}
                      </MenuItem>
                    ))}
                  </StyledInput>
                </Grid>

                <Grid item xs={12} md={6}>
                  <StyledInput
                    label="CƠ SỞ CHUYÊN NGÀNH"
                    select
                    value={formData.user_major}
                    onChange={(e) =>
                      setFormData({ ...formData, user_major: e.target.value })
                    }
                    inputProps={{ style: fontSx }}
                    disabled={!formData.user_faculty}
                  >
                    <MenuItem
                      value=""
                      sx={{ ...fontSx, fontStyle: "italic", color: C.slate }}
                    >
                      -- Bỏ qua --
                    </MenuItem>
                    {majors
                      .filter(
                        (m) =>
                          !formData.user_faculty ||
                          m.major_faculty?._id === formData.user_faculty,
                      )
                      .map((m) => (
                        <MenuItem
                          key={m._id}
                          value={m._id}
                          sx={{ ...fontSx, fontWeight: 500 }}
                        >
                          {m.major_title}
                        </MenuItem>
                      ))}
                  </StyledInput>
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
              Đóng
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
              {editingUser ? "💾 Cập nhật Dữ liệu" : "✨ Xác nhận Cấp phát"}
            </Button>
          </Box>
        </form>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
