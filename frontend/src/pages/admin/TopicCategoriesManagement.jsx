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
  Tooltip,
  Stack,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Topic as TopicIcon,
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

const TopicCategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    topic_category_title: "",
    topic_category_description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/topic-categories");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Fetch categories error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh mục đề tài",
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        topic_category_title: category.topic_category_title || "",
        topic_category_description: category.topic_category_description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        topic_category_title: "",
        topic_category_description: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.topic_category_title) {
        toast.error("Vui lòng nhập tên danh mục");
        return;
      }

      if (editingCategory) {
        await axios.put(
          `/api/topic-categories/${editingCategory._id}`,
          formData,
        );
        toast.success("Cập nhật danh mục thành công");
      } else {
        await axios.post("/api/topic-categories", formData);
        toast.success("Tạo danh mục thành công");
      }
      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi lưu danh mục");
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        await axios.delete(`/api/topic-categories/${categoryId}`);
        toast.success("Xóa danh mục thành công");
        fetchCategories();
      } catch (error) {
        toast.error("Lỗi xóa danh mục");
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
            📑 Quản lý Danh mục Đề tài
          </Typography>
          <Typography
            sx={{ color: C.slate, mt: 0.5, fontWeight: 500, ...fontSx }}
          >
            Phân loại và tổ chức các nhóm đề tài hệ thống
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
          Thêm danh mục
        </Button>
      </Box>

      {/* Summary strip */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            label: "Tổng số Danh mục",
            value: categories.length,
            color: C.primary,
            bg: "#eff6ff",
            icon: <CategoryIcon />,
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
                      sx={{
                        fontWeight: 800,
                        color: "#475569",
                        width: "35%",
                        minWidth: 250,
                        ...fontSx,
                      }}
                    >
                      Tên Danh Mục
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 800, color: "#475569", ...fontSx }}
                    >
                      Mô Tả
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
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                        <Typography
                          sx={{ color: C.slate, fontWeight: 600, ...fontSx }}
                        >
                          Chưa có danh mục nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow
                        key={category._id}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell
                          sx={{ fontWeight: 700, ...fontSx, color: "#1e293b" }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "8px",
                                bgcolor: "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <TopicIcon
                                sx={{ fontSize: 18, color: C.slate }}
                              />
                            </Box>
                            <Typography sx={{ fontWeight: 700, ...fontSx }}>
                              {category.topic_category_title}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ ...fontSx, color: C.slate }}>
                          {category.topic_category_description || "—"}
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
                              onClick={() => handleOpenDialog(category)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              sx={{ bgcolor: "#fef2f2" }}
                              onClick={() => handleDelete(category._id)}
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
                  {editingCategory ? "Chỉnh sửa Danh mục" : "Thêm Danh mục mới"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 500,
                    ...fontSx,
                  }}
                >
                  {editingCategory
                    ? "Cập nhật thông tin danh mục"
                    : "Tạo phân loại đề tài mới"}
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
            <StyledInput
              label="TÊN DANH MỤC"
              name="topic_category_title"
              placeholder="VD: Ứng dụng Web, Trí tuệ nhân tạo..."
              required
              value={formData.topic_category_title}
              onChange={handleChange}
              inputProps={{ style: fontSx }}
            />
            <StyledInput
              label="MÔ TẢ CHI TIẾT"
              name="topic_category_description"
              placeholder="Thông tin thêm..."
              multiline
              rows={3}
              value={formData.topic_category_description}
              onChange={handleChange}
              inputProps={{ style: fontSx }}
            />
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
              {editingCategory ? "💾 Cập nhật" : "✨ Thêm mới"}
            </Button>
          </Box>
        </form>
      </Dialog>
    </Box>
  );
};

export default TopicCategoriesManagement;
