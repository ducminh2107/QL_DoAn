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
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Group as GroupIcon,
  Note as NoteIcon,
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

  const sectionLabelSx = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 2,
    fontWeight: 700,
    color: "#1e3a8a",
    fontFamily: "'Inter', sans-serif",
    fontSize: "1.1rem",
  };

  const cardSx = {
    p: 3,
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    height: "100%",
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={40} thickness={4} />
      </Box>
    );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Navigation & Title */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/teacher/topics/${id}`)}
            sx={{
              mb: 1,
              color: "#64748b",
              textTransform: "none",
              "&:hover": { bgcolor: "transparent", color: "#1e3a8a" },
            }}
          >
            Quay lại chi tiết
          </Button>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#1e3a8a",
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Cập nhật đề tài
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Điều chỉnh các thông tin và yêu cầu của đề tài nghiên cứu.
          </Typography>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/teacher/topics/${id}`)}
            sx={{ borderRadius: "10px", px: 3 }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{
              borderRadius: "10px",
              px: 4,
              bgcolor: "#1e3a8a",
              "&:hover": { bgcolor: "#1e293b" },
            }}
          >
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={cardSx}>
              <Typography sx={sectionLabelSx}>
                <DescriptionIcon fontSize="small" /> Chỉnh sửa nội dung
              </Typography>

              <TextField
                fullWidth
                label="Tiêu đề đề tài"
                name="topic_title"
                value={topic.topic_title}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  sx: {
                    borderRadius: "12px",
                    fontFamily: "'Inter', sans-serif",
                  },
                }}
              />

              <TextField
                fullWidth
                label="Mô tả đề tài"
                name="topic_description"
                value={topic.topic_description}
                onChange={handleChange}
                multiline
                rows={8}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  sx: {
                    borderRadius: "12px",
                    fontFamily: "'Inter', sans-serif",
                  },
                }}
              />

              <Typography sx={sectionLabelSx}>
                <NoteIcon fontSize="small" /> Ghi chú giảng viên
              </Typography>
              <TextField
                fullWidth
                label="Ghi chú dành cho sinh viên"
                name="teacher_notes"
                value={topic.teacher_notes}
                onChange={handleChange}
                multiline
                rows={3}
                InputProps={{
                  sx: {
                    borderRadius: "12px",
                    fontFamily: "'Inter', sans-serif",
                  },
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              <Paper elevation={0} sx={cardSx}>
                <Typography sx={sectionLabelSx}>
                  <CategoryIcon fontSize="small" /> Phân loại
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }} required>
                  <InputLabel>Danh mục đề tài</InputLabel>
                  <Select
                    name="topic_category"
                    value={topic.topic_category}
                    onChange={handleChange}
                    label="Danh mục đề tài"
                    sx={{ borderRadius: "12px" }}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.topic_category_title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Chuyên ngành</InputLabel>
                  <Select
                    name="topic_major"
                    value={topic.topic_major}
                    onChange={handleChange}
                    label="Chuyên ngành"
                    sx={{ borderRadius: "12px" }}
                  >
                    <MenuItem value="">
                      <em>Tất cả chuyên ngành</em>
                    </MenuItem>
                    {majors.map((major) => (
                      <MenuItem key={major._id} value={major._id}>
                        {major.major_title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>

              <Paper elevation={0} sx={cardSx}>
                <Typography sx={sectionLabelSx}>
                  <GroupIcon fontSize="small" /> Quy mô nhóm
                </Typography>

                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ bgcolor: "#eff6ff", p: 1, borderRadius: "8px" }}>
                    <GroupIcon sx={{ color: "#1e3a8a" }} />
                  </Box>
                  <TextField
                    fullWidth
                    label="Số sinh viên tối đa"
                    name="topic_max_members"
                    type="number"
                    value={topic.topic_max_members}
                    onChange={handleChange}
                    inputProps={{ min: 1, max: 5 }}
                    InputProps={{
                      sx: {
                        borderRadius: "12px",
                        fontFamily: "'Inter', sans-serif",
                      },
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block", pl: 6 }}
                >
                  Thay đổi số lượng thành viên tối đa cho đề tài này.
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            flexDirection: "column",
            gap: 2,
            mt: 4,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={submitting}
            sx={{ borderRadius: "12px", py: 1.5, bgcolor: "#1e3a8a" }}
          >
            Lưu thay đổi
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate(`/teacher/topics/${id}`)}
            sx={{ borderRadius: "12px", py: 1.5 }}
          >
            Hủy
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default TopicEdit;
