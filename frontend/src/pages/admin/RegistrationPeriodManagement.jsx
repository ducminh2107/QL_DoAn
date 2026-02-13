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

const RegistrationPeriodManagement = () => {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    registration_period_semester: "",
    registration_period_start: "",
    registration_period_end: "",
    registration_period_status: "active",
    allow_registration: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/registration-periods");
      setPeriods(response.data.data || []);
    } catch (error) {
      console.error("Fetch registration periods error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách đợt đăng ký",
      );
      setPeriods([]);
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
        registration_period_semester: item.registration_period_semester,
        registration_period_start: item.registration_period_start.split("T")[0],
        registration_period_end: item.registration_period_end.split("T")[0],
        registration_period_status: item.registration_period_status,
        allow_registration: item.allow_registration,
      });
    } else {
      setEditingItem(null);
      setFormData({
        registration_period_semester: "",
        registration_period_start: "",
        registration_period_end: "",
        registration_period_status: "active",
        allow_registration: true,
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
        await axios.put(
          `/api/registration-periods/${editingItem._id}`,
          formData,
        );
        toast.success("Cập nhật thành công");
      } else {
        await axios.post("/api/registration-periods", formData);
        toast.success("Thêm thành công");
      }
      handleClose();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đợt đăng ký này?")) {
      try {
        await axios.delete(`/api/registration-periods/${id}`);
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
          Quản lý đợt đăng ký
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm đợt đăng ký
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : periods.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không có đợt đăng ký nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nhấp nút "Thêm đợt đăng ký" để tạo đợt đăng ký mới
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên đợt/Học kỳ</TableCell>
                <TableCell>Bắt đầu</TableCell>
                <TableCell>Kết thúc</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Cho phép ĐK</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {periods.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.registration_period_semester}</TableCell>
                  <TableCell>
                    {new Date(
                      item.registration_period_start,
                    ).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    {new Date(item.registration_period_end).toLocaleDateString(
                      "vi-VN",
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.registration_period_status}
                      color={
                        item.registration_period_status === "active"
                          ? "success"
                          : item.registration_period_status === "closed"
                            ? "default"
                            : "primary"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.allow_registration ? "Mở" : "Khóa"}
                      color={item.allow_registration ? "success" : "error"}
                      variant="outlined"
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
            {editingItem ? "Chỉnh sửa đợt đăng ký" : "Thêm đợt đăng ký mới"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên đợt/Học kỳ"
                  required
                  value={formData.registration_period_semester}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registration_period_semester: e.target.value,
                    })
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
                <TextField
                  fullWidth
                  label="Ngày kết thúc"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.registration_period_end}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registration_period_end: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Trạng thái"
                  value={formData.registration_period_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registration_period_status: e.target.value,
                    })
                  }
                >
                  <MenuItem value="active">Đang mở</MenuItem>
                  <MenuItem value="closed">Đã đóng</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Cho phép đăng ký"
                  value={formData.allow_registration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allow_registration:
                        e.target.value === "true" || e.target.value === true,
                    })
                  }
                >
                  <MenuItem value={true}>Cho phép</MenuItem>
                  <MenuItem value={false}>Không cho phép</MenuItem>
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

export default RegistrationPeriodManagement;
