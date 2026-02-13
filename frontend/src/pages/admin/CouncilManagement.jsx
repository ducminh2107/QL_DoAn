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

const CouncilManagement = () => {
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    council_name: "",
    council_description: "",
    defense_date: "",
    defense_location: "",
    council_status: "planning",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/councils");
      setCouncils(response.data.data);
    } catch {
      toast.error("Không thể tải danh sách hội đồng");
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
        council_name: item.council_name,
        council_description: item.council_description || "",
        defense_date: item.defense_date ? item.defense_date.split("T")[0] : "",
        defense_location: item.defense_location || "",
        council_status: item.council_status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        council_name: "",
        council_description: "",
        defense_date: "",
        defense_location: "",
        council_status: "planning",
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
        await axios.put(`/api/councils/${editingItem._id}`, formData);
        toast.success("Cập nhật thành công");
      } else {
        await axios.post("/api/councils", formData);
        toast.success("Thêm thành công");
      }
      handleClose();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hội đồng này?")) {
      try {
        await axios.delete(`/api/councils/${id}`);
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
          Quản lý hội đồng bảo vệ
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm hội đồng
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên hội đồng</TableCell>
                <TableCell>Ngày bảo vệ</TableCell>
                <TableCell>Địa điểm</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {councils.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.council_name}</TableCell>
                  <TableCell>
                    {item.defense_date
                      ? new Date(item.defense_date).toLocaleDateString("vi-VN")
                      : "Chưa xếp lịch"}
                  </TableCell>
                  <TableCell>
                    {item.defense_location || "Chưa xác định"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.council_status}
                      color={
                        item.council_status === "active"
                          ? "success"
                          : item.council_status === "completed"
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
            {editingItem ? "Chỉnh sửa hội đồng" : "Thêm hội đồng mới"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên hội đồng"
                  required
                  value={formData.council_name}
                  onChange={(e) =>
                    setFormData({ ...formData, council_name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  multiline
                  rows={2}
                  value={formData.council_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      council_description: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ngày bảo vệ"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.defense_date}
                  onChange={(e) =>
                    setFormData({ ...formData, defense_date: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Địa điểm"
                  value={formData.defense_location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defense_location: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Trạng thái"
                  value={formData.council_status}
                  onChange={(e) =>
                    setFormData({ ...formData, council_status: e.target.value })
                  }
                >
                  <MenuItem value="planning">Đang lập kế hoạch</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
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

export default CouncilManagement;
