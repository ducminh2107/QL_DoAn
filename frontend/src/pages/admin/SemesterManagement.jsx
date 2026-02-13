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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const SemesterManagement = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    semester_name: "",
    semester_start_date: "",
    semester_end_date: "",
    semester_status: "upcoming",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/semesters");
      setSemesters(response.data.data || []);
    } catch (error) {
      console.error("Fetch semesters error:", error);
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
        semester_name: item.semester_name,
        semester_start_date: item.semester_start_date.split("T")[0],
        semester_end_date: item.semester_end_date.split("T")[0],
        semester_status: item.semester_status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        semester_name: "",
        semester_start_date: "",
        semester_end_date: "",
        semester_status: "upcoming",
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
      if (editingItem) {
        await axios.put(`/api/semesters/${editingItem._id}`, formData);
        toast.success("Cập nhật học kỳ thành công");
      } else {
        await axios.post("/api/semesters", formData);
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
      } catch (error) {
        toast.error("Xóa thất bại");
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Quản lý học kỳ
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm học kỳ
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : semesters.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không có học kỳ nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nhấp nút "Thêm học kỳ" để tạo học kỳ mới
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên học kỳ</TableCell>
                <TableCell>Bắt đầu</TableCell>
                <TableCell>Kết thúc</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {semesters.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.semester_name}</TableCell>
                  <TableCell>
                    {new Date(item.semester_start_date).toLocaleDateString(
                      "vi-VN",
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(item.semester_end_date).toLocaleDateString(
                      "vi-VN",
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.semester_status}
                      color={
                        item.semester_status === "active"
                          ? "success"
                          : item.semester_status === "completed"
                            ? "default"
                            : "primary"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpen(item)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingItem ? "Chỉnh sửa học kỳ" : "Thêm học kỳ mới"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên học kỳ"
                  required
                  value={formData.semester_name}
                  onChange={(e) =>
                    setFormData({ ...formData, semester_name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ngày bắt đầu"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.semester_start_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semester_start_date: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ngày kết thúc"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.semester_end_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semester_end_date: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Trạng thái"
                  value={formData.semester_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semester_status: e.target.value,
                    })
                  }
                >
                  <MenuItem value="upcoming">Sắp diễn ra</MenuItem>
                  <MenuItem value="active">Đang diễn ra</MenuItem>
                  <MenuItem value="completed">Đã kết thúc</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="contained">
              {editingItem ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default SemesterManagement;
