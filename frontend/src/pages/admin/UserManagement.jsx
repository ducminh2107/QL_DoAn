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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    user_id: "",
    user_name: "",
    email: "",
    role: "student",
    user_major: "",
    user_faculty: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/users");
      setUsers(response.data.data || []);
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
    fetchUsers();
  }, []);

  const handleOpen = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        role: user.role,
        user_major: user.user_major || "",
        user_faculty: user.user_faculty || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        user_id: "",
        user_name: "",
        email: "",
        role: "student",
        user_major: "",
        user_faculty: "",
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
      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, formData);
        toast.success("Cập nhật người dùng thành công");
      } else {
        await axios.post("/api/users", formData);
        toast.success("Thêm người dùng thành công");
      }
      handleClose();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await axios.delete(`/api/users/${id}`);
        toast.success("Xóa người dùng thành công");
        fetchUsers();
      } catch (error) {
        toast.error("Xóa người dùng thất bại");
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Quản lý người dùng
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm người dùng
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : users.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không có người dùng nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nhấp nút "Thêm người dùng" để tạo người dùng mới
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã ND</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Khoa/Chuyên ngành</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.user_id}</TableCell>
                  <TableCell>{user.user_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={
                        user.role === "admin"
                          ? "error"
                          : user.role === "teacher"
                            ? "warning"
                            : "primary"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.user_faculty}{" "}
                    {user.user_major ? `/ ${user.user_major}` : ""}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpen(user)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(user._id)}
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
            {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mã người dùng"
                  required
                  value={formData.user_id}
                  onChange={(e) =>
                    setFormData({ ...formData, user_id: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Họ tên"
                  required
                  value={formData.user_name}
                  onChange={(e) =>
                    setFormData({ ...formData, user_name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Vai trò"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <MenuItem value="student">Sinh viên</MenuItem>
                  <MenuItem value="teacher">Giảng viên</MenuItem>
                  <MenuItem value="admin">Quản trị viên</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Khoa"
                  value={formData.user_faculty}
                  onChange={(e) =>
                    setFormData({ ...formData, user_faculty: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Chuyên ngành"
                  value={formData.user_major}
                  onChange={(e) =>
                    setFormData({ ...formData, user_major: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="contained">
              {editingUser ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
