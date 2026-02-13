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
  Stack,
  useTheme,
  alpha,
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
  const theme = useTheme();
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
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

        {/* Details Section */}
        <Box sx={{ mb: 4 }}>
          {/* Description */}
          <Box mb={4}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                display: "flex",
                alignItems: "center",
                fontWeight: 800,
                color: "#1E293B",
              }}
            >
              <DescriptionIcon sx={{ mr: 1, color: "primary.main" }} /> Mô tả đề
              tài
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#F8FAFC",
                borderRadius: "20px",
                border: "1px solid #E2E8F0",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-line",
                  color: "#475569",
                  lineHeight: 1.7,
                }}
              >
                {topic.topic_description}
              </Typography>
            </Paper>
          </Box>

          {/* Advisor Request (if any) */}
          {topic.topic_advisor_request && (
            <Box mb={4}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 800, color: "#1E293B" }}
              >
                Yêu cầu từ giảng viên
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  borderRadius: "20px",
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  color: theme.palette.warning.dark,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 800,
                }}
              >
                <ScheduleIcon sx={{ mr: 1, color: "primary.main" }} /> Thông tin
                bảo vệ
              </Typography>
              <Grid container spacing={2}>
                {topic.topic_date && (
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Ngày bảo vệ
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {new Date(topic.topic_date).toLocaleDateString("vi-VN")}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {topic.topic_room && (
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Phòng
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {topic.topic_room}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Info Cards Row */}
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Instructor Info */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "20px",
                border: "1px solid #E2E8F0",
                bgcolor: "#F8FAFC",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  color: "#1E293B",
                }}
              >
                <PersonIcon sx={{ mr: 1, color: "primary.main" }} /> Giảng viên
                hướng dẫn
              </Typography>
              {topic.topic_instructor ? (
                <Box display="flex" alignItems="center">
                  <Avatar
                    sx={{
                      mr: 2,
                      width: 50,
                      height: 50,
                      bgcolor: "primary.main",
                      fontSize: "1.2rem",
                    }}
                  >
                    {topic.topic_instructor.user_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {topic.topic_instructor.user_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {topic.topic_instructor.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {topic.topic_instructor.user_phone || "Mã: GV001"}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Alert severity="info" sx={{ borderRadius: "12px" }}>
                  Chưa phân công giảng viên
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Creator Info */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "20px",
                border: "1px solid #E2E8F0",
                bgcolor: "#F8FAFC",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  color: "#1E293B",
                }}
              >
                <SchoolIcon sx={{ mr: 1, color: "secondary.main" }} /> Người đề
                xuất
              </Typography>
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    mr: 2,
                    width: 50,
                    height: 50,
                    bgcolor: "secondary.main",
                  }}
                >
                  {topic.topic_creator?.user_name?.charAt(0) || "?"}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {topic.topic_creator?.user_name || "Ẩn danh"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mã SV: {topic.topic_creator?.user_id || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Members List */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "20px",
                border: "1px solid #E2E8F0",
                bgcolor: "#F8FAFC",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  color: "#1E293B",
                }}
              >
                <GroupIcon sx={{ mr: 1, color: "success.main" }} /> Thành viên (
                {topic.topic_group_student?.length || 0})
              </Typography>
              {topic.topic_group_student &&
              topic.topic_group_student.length > 0 ? (
                <Stack spacing={1}>
                  {topic.topic_group_student.map((member, index) => (
                    <Box
                      key={index}
                      display="flex"
                      alignItems="center"
                      sx={{
                        p: 1,
                        bgcolor: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #F1F5F9",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 1.5,
                          fontSize: "0.8rem",
                        }}
                      >
                        {member.student?.user_name?.charAt(0) || "?"}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {member.student?.user_name || "Ẩn danh"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.student?.user_id}
                        </Typography>
                      </Box>
                      <Chip
                        label={
                          member.status === "approved" ? "Đã duyệt" : "Chờ"
                        }
                        size="small"
                        color={
                          member.status === "approved" ? "success" : "warning"
                        }
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
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
