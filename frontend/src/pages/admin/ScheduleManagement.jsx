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
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    schedule_name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "scheduled",
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/schedules");
      setSchedules(response.data.data || []);
    } catch (error) {
      console.error("Fetch schedules error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách lịch",
      );
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData(schedule);
    } else {
      setEditingSchedule(null);
      setFormData({
        schedule_name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "scheduled",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editingSchedule) {
        await axios.put(
          `/api/admin/schedules/${editingSchedule._id}`,
          formData,
        );
        toast.success("Cập nhật lịch thành công");
      } else {
        await axios.post("/api/admin/schedules", formData);
        toast.success("Tạo lịch thành công");
      }
      handleCloseDialog();
      fetchSchedules();
    } catch (error) {
      toast.error("Lỗi lưu lịch");
    }
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm("Bạn có chắc muốn xóa lịch này?")) {
      try {
        await axios.delete(`/api/admin/schedules/${scheduleId}`);
        toast.success("Xóa lịch thành công");
        fetchSchedules();
      } catch (error) {
        toast.error("Lỗi xóa lịch");
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "info",
      in_progress: "warning",
      completed: "success",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: "Lên Lịch",
      in_progress: "Đang Thực Hiện",
      completed: "Hoàn Thành",
      cancelled: "Đã Hủy",
    };
    return labels[status] || status;
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
            Quản Lý Lịch
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Lên lịch cho các sự kiện và hoạt động hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm Lịch
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : schedules.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="textSecondary">Không có lịch nào</Typography>
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
                      Tổng Lịch
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {schedules.length}
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
                      Đang Thực Hiện
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {
                        schedules.filter((s) => s.status === "in_progress")
                          .length
                      }
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
                      <TableCell sx={{ fontWeight: 600 }}>Tên Lịch</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Ngày Bắt Đầu
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Ngày Kết Thúc
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Hành Động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule._id}>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {schedule.schedule_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {schedule.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(schedule.start_date).toLocaleDateString(
                            "vi-VN",
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(schedule.end_date).toLocaleDateString(
                            "vi-VN",
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(schedule.status)}
                            color={getStatusColor(schedule.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(schedule)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(schedule._id)}
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
          {editingSchedule ? "Cập Nhật Lịch" : "Thêm Lịch Mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Tên Lịch"
              name="schedule_name"
              value={formData.schedule_name}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Mô Tả"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Ngày Bắt Đầu"
              name="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Ngày Kết Thúc"
              name="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Trạng Thái"
              name="status"
              value={formData.status}
              onChange={handleChange}
              select
              SelectProps={{ native: true }}
            >
              <option value="scheduled">Lên Lịch</option>
              <option value="in_progress">Đang Thực Hiện</option>
              <option value="completed">Hoàn Thành</option>
              <option value="cancelled">Đã Hủy</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingSchedule ? "Cập Nhật" : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScheduleManagement;
