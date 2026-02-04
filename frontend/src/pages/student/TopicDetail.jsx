import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState(null);
  const [registerDialog, setRegisterDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);

  useEffect(() => {
    loadTopic();
  }, [id]);

  const loadTopic = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/student/topics/${id}`);
      setTopic(response.data.data);
    } catch (error) {
      console.error("Failed to load topic:", error);
      toast.error("Không thể tải thông tin đề tài");
      navigate("/student/topics");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`/api/student/topics/${id}/register`);
      toast.success("Đã gửi yêu cầu đăng ký. Chờ giảng viên duyệt.");
      setRegisterDialog(false);
      loadTopic();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  const handleCancelRegistration = async () => {
    try {
      await axios.delete(`/api/student/topics/${id}/register`);
      toast.success("Đã hủy đăng ký đề tài");
      setCancelDialog(false);
      loadTopic();
    } catch (error) {
      toast.error(error.response?.data?.message || "Hủy đăng ký thất bại");
    }
  };

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  if (!topic) {
    return (
      <Container>
        <Alert severity="error">Đề tài không tồn tại</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/student/topics")}
        sx={{ mb: 2 }}
      >
        Quay lại danh sách
      </Button>

      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Grid item>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {topic.topic_title}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label={
                  topic.topic_teacher_status === "approved"
                    ? "Đã duyệt"
                    : "Chờ duyệt"
                }
                color={
                  topic.topic_teacher_status === "approved"
                    ? "success"
                    : "warning"
                }
              />
              <Chip
                icon={<GroupIcon />}
                label={`${topic.topic_group_student?.length || 0}/${topic.topic_max_members} thành viên`}
                color={topic.has_available_slots ? "primary" : "error"}
                variant="outlined"
              />
              <Chip
                icon={<CategoryIcon />}
                label={
                  topic.topic_category?.topic_category_title || "Chưa phân loại"
                }
                variant="outlined"
              />
            </Box>
          </Grid>
          <Grid item>
            {topic.student_info?.can_register && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => setRegisterDialog(true)}
              >
                Đăng ký tham gia
              </Button>
            )}
            {topic.student_info?.has_pending_request && (
              <Button
                variant="outlined"
                color="warning"
                onClick={() => setCancelDialog(true)}
              >
                Hủy yêu cầu
              </Button>
            )}
            {topic.student_info?.is_member && (
              <Button
                variant="contained"
                color="success"
                onClick={() => navigate(`/student/topics/${id}/progress`)}
              >
                Xem tiến độ
              </Button>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Left Column - Topic Details */}
          <Grid item xs={12} md={8}>
            {/* Description */}
            <Box mb={4}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <DescriptionIcon sx={{ mr: 1 }} /> Mô tả đề tài
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography variant="body1" style={{ whiteSpace: "pre-line" }}>
                  {topic.topic_description}
                </Typography>
              </Paper>
            </Box>

            {/* Advisor Request (if any) */}
            {topic.topic_advisor_request && (
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                  Yêu cầu từ giảng viên
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, bgcolor: "warning.light" }}
                >
                  <Typography variant="body1">
                    {topic.topic_advisor_request}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Defense Info (if available) */}
            {(topic.topic_date || topic.topic_room) && (
              <Box mb={4}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <ScheduleIcon sx={{ mr: 1 }} /> Thông tin bảo vệ
                </Typography>
                <Grid container spacing={2}>
                  {topic.topic_date && (
                    <Grid item xs={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Ngày bảo vệ
                        </Typography>
                        <Typography variant="body1">
                          {new Date(topic.topic_date).toLocaleDateString(
                            "vi-VN",
                          )}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  {topic.topic_room && (
                    <Grid item xs={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Phòng
                        </Typography>
                        <Typography variant="body1">
                          {topic.topic_room}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </Grid>

          {/* Right Column - Side Info */}
          <Grid item xs={12} md={4}>
            {/* Instructor Info */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <PersonIcon sx={{ mr: 1 }} /> Giảng viên hướng dẫn
              </Typography>
              {topic.topic_instructor ? (
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ mr: 2 }}>
                    {topic.topic_instructor.user_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {topic.topic_instructor.user_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {topic.topic_instructor.email}
                    </Typography>
                    {topic.topic_instructor.user_phone && (
                      <Typography variant="body2" color="text.secondary">
                        {topic.topic_instructor.user_phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <Alert severity="info">Chưa phân công giảng viên</Alert>
              )}
            </Paper>

            {/* Creator Info */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <SchoolIcon sx={{ mr: 1 }} /> Người đề xuất
              </Typography>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ mr: 2 }}>
                  {topic.topic_creator?.user_name?.charAt(0) || "?"}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {topic.topic_creator?.user_name || "Ẩn danh"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mã SV: {topic.topic_creator?.user_id || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Members List */}
            <Paper sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <GroupIcon sx={{ mr: 1 }} /> Thành viên (
                {topic.topic_group_student?.length || 0})
              </Typography>
              {topic.topic_group_student &&
              topic.topic_group_student.length > 0 ? (
                <List dense>
                  {topic.topic_group_student.map((member, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar>
                          {member.student?.user_name?.charAt(0) || "?"}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.student?.user_name || "Ẩn danh"}
                        secondary={
                          <Box display="flex" alignItems="center">
                            <Chip
                              label={
                                member.status === "approved"
                                  ? "Đã duyệt"
                                  : "Chờ duyệt"
                              }
                              color={
                                member.status === "approved"
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                            />
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              {member.student?.user_id}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có thành viên nào
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Registration Dialog */}
      <Dialog open={registerDialog} onClose={() => setRegisterDialog(false)}>
        <DialogTitle>Xác nhận đăng ký đề tài</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Bạn sắp đăng ký tham gia đề tài:
          </Typography>
          <Typography variant="h6" color="primary" paragraph>
            "{topic.topic_title}"
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Yêu cầu của bạn sẽ được gửi đến giảng viên hướng dẫn để phê duyệt.
            Bạn có thể hủy yêu cầu trước khi được duyệt.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterDialog(false)}>Hủy</Button>
          <Button onClick={handleRegister} variant="contained" color="primary">
            Xác nhận đăng ký
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Registration Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
        <DialogTitle>Xác nhận hủy đăng ký</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Bạn có chắc chắn muốn hủy yêu cầu đăng ký đề tài này?
          </Typography>
          <Alert severity="warning">
            Hành động này không thể hoàn tác. Bạn sẽ cần đăng ký lại nếu muốn
            tham gia.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>Quay lại</Button>
          <Button
            onClick={handleCancelRegistration}
            variant="contained"
            color="error"
          >
            Hủy đăng ký
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TopicDetail;
