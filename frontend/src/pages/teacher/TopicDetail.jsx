import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const TopicDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    loadTopic();
  }, [id]);

  const loadTopic = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teacher/topics`);
      const foundTopic = response.data.data?.find((t) => t._id === id);
      if (foundTopic) {
        setTopic(foundTopic);
      } else {
        toast.error("Không tìm thấy đề tài");
        navigate("/teacher/topics");
      }
    } catch (error) {
      console.error("Failed to load topic:", error);
      toast.error("Không thể tải chi tiết đề tài");
      navigate("/teacher/topics");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn chắc chắn muốn xóa đề tài này?")) return;
    try {
      await axios.delete(`/api/teacher/topics/${id}`);
      toast.success("Đã xóa đề tài");
      navigate("/teacher/topics");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa thất bại");
    }
  };

  if (loading) return <LinearProgress />;

  if (!topic) return <Typography>Đề tài không tồn tại</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/teacher/topics")}
            variant="outlined"
          >
            Quay lại
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Chi tiết đề tài
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/teacher/topics/${id}/edit`)}
          >
            Chỉnh sửa
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Xóa
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Topic Info */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {topic.topic_title}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Mô tả
              </Typography>
              <Typography variant="body2">{topic.topic_description}</Typography>
            </Box>

            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
              <Chip
                label={
                  topic.is_completed
                    ? "Hoàn thành"
                    : topic.topic_teacher_status === "approved"
                      ? "Đã duyệt"
                      : "Chờ duyệt"
                }
                color={
                  topic.is_completed ||
                  topic.topic_teacher_status === "approved"
                    ? "success"
                    : "warning"
                }
              />
              {topic.topic_max_members && (
                <Chip
                  icon={<GroupIcon />}
                  label={`Tối đa ${topic.topic_max_members} sinh viên`}
                />
              )}
            </Box>

            {topic.teacher_notes && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ghi chú từ giảng viên
                </Typography>
                <Typography variant="body2">{topic.teacher_notes}</Typography>
              </Box>
            )}
          </Paper>

          {/* Students */}
          {topic.topic_group_student &&
            topic.topic_group_student.length > 0 && (
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Sinh viên trong nhóm
                </Typography>
                {topic.topic_group_student.map((member, idx) => (
                  <Box
                    key={idx}
                    display="flex"
                    justifyContent="space-between"
                    py={1}
                  >
                    <Typography variant="body2">
                      {member.student?.user_name || "N/A"}
                    </Typography>
                    <Chip
                      size="small"
                      label={member.status}
                      color={
                        member.status === "approved" ? "success" : "default"
                      }
                    />
                  </Box>
                ))}
              </Paper>
            )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Danh mục
              </Typography>
              <Typography variant="body2" gutterBottom>
                {topic.topic_category?.topic_category_title || "N/A"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary">
                Chuyên ngành
              </Typography>
              <Typography variant="body2" gutterBottom>
                {topic.topic_major?.major_title || "N/A"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary">
                Người tạo
              </Typography>
              <Typography variant="body2">
                {topic.topic_creator?.user_name || "N/A"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary">
                Ngày tạo
              </Typography>
              <Typography variant="body2">
                {new Date(topic.created_at).toLocaleDateString("vi-VN")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TopicDetail;
