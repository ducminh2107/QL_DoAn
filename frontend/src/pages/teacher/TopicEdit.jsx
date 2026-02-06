import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const TopicEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [majors, setMajors] = useState([]);
  const [topic, setTopic] = useState({
    topic_title: "",
    topic_description: "",
    topic_category: "",
    topic_major: "",
    topic_max_members: 1,
    teacher_notes: "",
  });

  useEffect(() => {
    loadTopic();
    loadFilterData();
  }, [id]);

  const loadTopic = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teacher/topics`);
      const foundTopic = response.data.data?.find((t) => t._id === id);
      if (foundTopic) {
        setTopic({
          topic_title: foundTopic.topic_title || "",
          topic_description: foundTopic.topic_description || "",
          topic_category: foundTopic.topic_category?._id || "",
          topic_major: foundTopic.topic_major?._id || "",
          topic_max_members: foundTopic.topic_max_members || 1,
          teacher_notes: foundTopic.teacher_notes || "",
        });
      } else {
        toast.error("Không tìm thấy đề tài");
        navigate("/teacher/topics");
      }
    } catch (error) {
      console.error("Failed to load topic:", error);
      toast.error("Không thể tải chi tiết đề tài");
    } finally {
      setLoading(false);
    }
  };

  const loadFilterData = async () => {
    try {
      const [categoriesRes, majorsRes] = await Promise.all([
        axios.get("/api/topic-categories"),
        axios.get("/api/majors"),
      ]);
      setCategories(categoriesRes.data.data || []);
      setMajors(majorsRes.data.data || []);
    } catch (error) {
      console.error("Failed to load filter data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTopic((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await axios.put(`/api/teacher/topics/${id}`, topic);
      toast.success("Cập nhật đề tài thành công");
      navigate(`/teacher/topics/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/teacher/topics/${id}`)}
          variant="outlined"
        >
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Chỉnh sửa đề tài
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tiêu đề đề tài"
            name="topic_title"
            value={topic.topic_title}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Mô tả đề tài"
            name="topic_description"
            value={topic.topic_description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Danh mục</InputLabel>
            <Select
              name="topic_category"
              value={topic.topic_category}
              onChange={handleChange}
              label="Danh mục"
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.topic_category_title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Chuyên ngành</InputLabel>
            <Select
              name="topic_major"
              value={topic.topic_major}
              onChange={handleChange}
              label="Chuyên ngành"
            >
              {majors.map((major) => (
                <MenuItem key={major._id} value={major._id}>
                  {major.major_title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Số lượng sinh viên tối đa"
            name="topic_max_members"
            type="number"
            value={topic.topic_max_members}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 1, max: 5 }}
          />

          <TextField
            fullWidth
            label="Ghi chú từ giảng viên"
            name="teacher_notes"
            value={topic.teacher_notes}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />

          <Box display="flex" gap={2} mt={3}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={submitting}
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/teacher/topics/${id}`)}
            >
              Hủy
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default TopicEdit;
