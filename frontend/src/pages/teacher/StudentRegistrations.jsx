import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  LinearProgress,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Alert,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PersonRemove as PersonRemoveIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const StudentRegistrations = () => {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [actionDialog, setActionDialog] = useState({
    open: false,
    registration: null,
    action: "approve",
    feedback: "",
  });

  useEffect(() => {
    loadRegistrations();
  }, [selectedTopic]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      console.log("📌 Loading student registrations...");
      const response = await axios.get("/api/teacher/students/registrations");
      console.log("📌 Response received:", response.data);
      setRegistrations(response.data.data || []);
      setTopics(response.data.topics || []);
    } catch (error) {
      console.error("Failed to load registrations:", error);
      toast.error("Không thể tải danh sách đăng ký");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationAction = async () => {
    try {
      const { registration, action, feedback } = actionDialog;

      await axios.put(
        `/api/teacher/students/${registration.student_id}/registrations/${registration.topic_id}`,
        {
          action,
          feedback,
        }
      );

      toast.success(
        `Đã ${action === "approve" ? "chấp nhận" : "từ chối"} đăng ký`
      );
      setActionDialog({
        open: false,
        registration: null,
        action: "approve",
        feedback: "",
      });
      loadRegistrations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xử lý thất bại");
    }
  };

  const handleRemoveStudent = async (registration) => {
    if (
      !window.confirm(
        `Xác nhận xóa sinh viên ${registration.student_name} khỏi đề tài?`
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `/api/teacher/students/${registration.student_id}/topics/${registration.topic_id}`,
        {
          data: { reason: "Giảng viên xóa khỏi nhóm" },
        }
      );

      toast.success("Đã xóa sinh viên khỏi đề tài");
      loadRegistrations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa thất bại");
    }
  };

  const filteredRegistrations =
    selectedTopic === "all"
      ? registrations
      : registrations.filter((reg) => reg.topic_id === selectedTopic);

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          👥 Quản lý đăng ký sinh viên
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="text.secondary">
            {registrations.length} đăng ký chờ xử lý
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Lọc theo đề tài</InputLabel>
            <Select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              label="Lọc theo đề tài"
              startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">Tất cả đề tài</MenuItem>
              {topics.map((topic) => (
                <MenuItem key={topic._id} value={topic._id}>
                  {topic.topic_title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Registrations Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {filteredRegistrations.length === 0 ? (
          <Box p={4} textAlign="center">
            <CheckCircleIcon
              sx={{ fontSize: 60, color: "success.main", mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              Không có đăng ký nào chờ xử lý
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tất cả đăng ký đã được xử lý
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Sinh viên</TableCell>
                  <TableCell>Đề tài</TableCell>
                  <TableCell>Thông tin học tập</TableCell>
                  <TableCell>Ngày đăng ký</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRegistrations.map((reg) => (
                  <TableRow key={`${reg.student_id}-${reg.topic_id}`} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                          {reg.student_name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {reg.student_name}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {reg.student_code} • {reg.student_email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {reg.topic_title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption" display="block">
                          Chuyên ngành: {reg.student_major || "Chưa cập nhật"}
                        </Typography>
                        <Typography variant="caption" display="block">
                          GPA:{" "}
                          {reg.student_gpa
                            ? reg.student_gpa.toFixed(2)
                            : "Chưa có"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(reg.registration_date).toLocaleDateString(
                        "vi-VN"
                      )}
                      <Typography variant="caption" display="block">
                        {new Date(reg.registration_date).toLocaleTimeString(
                          "vi-VN"
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<PersonIcon />}
                        label={
                          reg.status === "pending" ? "Chờ duyệt" : reg.status
                        }
                        color={reg.status === "pending" ? "warning" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" justifyContent="flex-end" gap={1}>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() =>
                            setActionDialog({
                              open: true,
                              registration: reg,
                              action: "approve",
                              feedback: "",
                            })
                          }
                        >
                          Duyệt
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() =>
                            setActionDialog({
                              open: true,
                              registration: reg,
                              action: "reject",
                              feedback: "",
                            })
                          }
                        >
                          Từ chối
                        </Button>
                        {reg.status === "approved" && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveStudent(reg)}
                            title="Xóa khỏi nhóm"
                          >
                            <PersonRemoveIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ ...actionDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.action === "approve"
            ? "Duyệt đăng ký"
            : "Từ chối đăng ký"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body1">
                Sinh viên:{" "}
                <strong>{actionDialog.registration?.student_name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mã SV: {actionDialog.registration?.student_code}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                Đề tài:{" "}
                <strong>{actionDialog.registration?.topic_title}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Nhận xét / Lý do"
                value={actionDialog.feedback}
                onChange={(e) =>
                  setActionDialog((prev) => ({
                    ...prev,
                    feedback: e.target.value,
                  }))
                }
                placeholder={
                  actionDialog.action === "approve"
                    ? "Nhận xét cho sinh viên (tùy chọn)..."
                    : "Lý do từ chối đăng ký..."
                }
              />
            </Grid>
            {actionDialog.action === "approve" && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Sinh viên sẽ được thêm vào nhóm và có thể bắt đầu làm đề
                    tài.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setActionDialog({ ...actionDialog, open: false })}
          >
            Hủy
          </Button>
          <Button
            onClick={handleRegistrationAction}
            variant="contained"
            color={actionDialog.action === "approve" ? "success" : "error"}
          >
            {actionDialog.action === "approve" ? "Duyệt đăng ký" : "Từ chối"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentRegistrations;
