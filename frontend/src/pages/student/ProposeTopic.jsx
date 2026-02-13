import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ProposeTopic = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    topic_title: "",
    topic_description: "",
    topic_category: "",
    topic_max_members: 1,
    topic_advisor_request: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, teacherRes] = await Promise.all([
          axios.get("/api/topic-categories"),
          axios.get("/api/users/teachers"),
        ]);
        setCategories(catRes.data.data || []);
        setTeachers(teacherRes.data.data || []);
      } catch (error) {
        console.error("Failed to load data", error);
        toast.error("Không thể tải danh sách giảng viên hoặc danh mục");
      }
    };

    fetchData();
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await axios.post("/api/student/topics/propose", form);
      toast.success("Đề xuất đề tài thành công");
      navigate("/student/topics");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể đề xuất đề tài");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Đề xuất đề tài mới
        </Typography>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Tiêu đề đề tài"
            fullWidth
            required
            margin="normal"
            value={form.topic_title}
            onChange={handleChange("topic_title")}
          />

          <TextField
            label="Mô tả chi tiết"
            fullWidth
            required
            margin="normal"
            multiline
            minRows={4}
            value={form.topic_description}
            onChange={handleChange("topic_description")}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={form.topic_category}
              label="Danh mục"
              onChange={handleChange("topic_category")}
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.topic_category_title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Số thành viên tối đa"
            type="number"
            fullWidth
            margin="normal"
            inputProps={{ min: 1, max: 5 }}
            value={form.topic_max_members}
            onChange={handleChange("topic_max_members")}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Giảng viên hướng dẫn mong muốn</InputLabel>
            <Select
              value={form.topic_advisor_request}
              label="Giảng viên hướng dẫn mong muốn"
              onChange={handleChange("topic_advisor_request")}
            >
              <MenuItem value="">
                <em>-- Chọn giảng viên (tuỳ chọn) --</em>
              </MenuItem>
              {teachers.map((teacher) => (
                <MenuItem key={teacher._id} value={teacher.user_name}>
                  {teacher.user_name} ({teacher.user_id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate("/student/topics")}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              Gửi đề xuất
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProposeTopic;
