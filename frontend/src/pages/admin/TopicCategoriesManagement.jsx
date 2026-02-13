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
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const TopicCategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_name: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/topic-categories");
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
      setFormData(category);
    } else {
      setEditingCategory(null);
      setFormData({
        category_name: "",
        description: "",
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await axios.put(
          `/api/admin/topic-categories/${editingCategory._id}`,
          formData,
        );
        toast.success("Cập nhật danh mục thành công");
      } else {
        await axios.post("/api/admin/topic-categories", formData);
        toast.success("Tạo danh mục thành công");
      }
      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      toast.error("Lỗi lưu danh mục");
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        await axios.delete(`/api/admin/topic-categories/${categoryId}`);
        toast.success("Xóa danh mục thành công");
        fetchCategories();
      } catch (error) {
        toast.error("Lỗi xóa danh mục");
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Quản Lý Danh Mục Đề Tài
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Tổ chức các danh mục phân loại đề tài
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm Danh Mục
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : categories.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="textSecondary">Không có danh mục nào</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Tổng Danh Mục
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {categories.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Danh Mục Hoạt Động
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {categories.filter((c) => c.is_active).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ overflow: "hidden" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Tên Danh Mục
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Mô Tả</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Hành Động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {category.category_name}
                          </Typography>
                        </TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          {category.is_active ? (
                            <Typography
                              variant="body2"
                              sx={{ color: "#4caf50" }}
                            >
                              Hoạt động
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ color: "#999" }}>
                              Không hoạt động
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(category)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(category._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? "Cập Nhật Danh Mục" : "Thêm Danh Mục Mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Tên Danh Mục"
              name="category_name"
              value={formData.category_name}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Mô Tả"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Switch
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
              }
              label="Hoạt động"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingCategory ? "Cập Nhật" : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TopicCategoriesManagement;
