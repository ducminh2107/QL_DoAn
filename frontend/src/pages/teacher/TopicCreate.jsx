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
  Add as AddIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const TopicCreate = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [majors, setMajors] = useState([]);
  const [registrationPeriods, setRegistrationPeriods] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [topic, setTopic] = useState({
    topic_title: "",
    topic_description: "",
    topic_category: "",
    topic_major: "",
    topic_registration_period: "",
    topic_max_members: 1,
    teacher_notes: "",
  });

  useEffect(() => {
    loadFilterData();
  }, []);

  const loadFilterData = async () => {
    try {
      setLoadingData(true);
      const [categoriesRes, majorsRes, periodsRes] = await Promise.all([
        axios.get("/api/topic-categories"),
        axios.get("/api/majors"),
        axios.get("/api/registration-periods"),
      ]);
      setCategories(categoriesRes.data.data || []);
      setMajors(majorsRes.data.data || []);
      const periods = periodsRes.data.data || [];
      setRegistrationPeriods(periods);
      // Auto-select active registration period if available
      const activePeriod = periods.find(
        (p) => p.registration_period_status === "active"
      );
      if (activePeriod) {
        setTopic((prev) => ({
          ...prev,
          topic_registration_period: activePeriod._id,
        }));
      }
    } catch (error) {
      console.error("Failed to load filter data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoadingData(false);
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
      const payload = {
        ...topic,
        topic_category: topic.topic_category,
        topic_major: topic.topic_major,
        topic_registration_period: topic.topic_registration_period,
      };
      const response = await axios.post("/api/teacher/topics", payload);
      toast.success("Tạo đề tài thành công");
      // Redirect to the newly created topic's detail page
      navigate(`/teacher/topics/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo đề tài thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <Container sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/teacher/topics")}
          variant="outlined"
        >
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Tạo đề tài mới
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
            placeholder="Nhập tiêu đề đề tài"
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
            placeholder="Mô tả chi tiết đề tài (tối thiểu 50 ký tự)"
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Danh mục</InputLabel>
            <Select
              name="topic_category"
              value={topic.topic_category}
              onChange={handleChange}
              label="Danh mục"
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
              <MenuItem value="">
                <em>Không chọn</em>
              </MenuItem>
              {majors.map((major) => (
                <MenuItem key={major._id} value={major._id}>
                  {major.major_title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Kỳ đăng ký</InputLabel>
            <Select
              name="topic_registration_period"
              value={topic.topic_registration_period}
              onChange={handleChange}
              label="Kỳ đăng ký"
            >
              {registrationPeriods.map((period) => (
                <MenuItem key={period._id} value={period._id}>
                  {period.registration_period_semester} (
                  {period.registration_period_status})
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
            placeholder="Ghi chú bổ sung (tùy chọn)"
          />

          <Box display="flex" gap={2} mt={3}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={submitting}
            >
              {submitting ? "Đang tạo..." : "Tạo đề tài"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/teacher/topics")}
            >
              Hủy
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default TopicCreate;
