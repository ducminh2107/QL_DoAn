import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
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

  const headerGradientSx = {
    background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
    pt: 6,
    pb: 12,
    color: "white",
    borderRadius: { xs: 0, md: "0 0 32px 32px" },
    boxShadow: "0 10px 30px -10px rgba(37, 99, 235, 0.4)",
    mb: -8,
    position: "relative",
    zIndex: 0,
  };

  const glassCardSx = {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    border: "1px solid #f1f5f9",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
    position: "relative",
    zIndex: 1,
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: "#f8fafc",
      transition: "all 0.2s",
      "& fieldset": { borderColor: "#e2e8f0" },
      "&:hover fieldset": { borderColor: "#cbd5e1" },
      "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: "2px" },
      "&.Mui-focused": {
        bgcolor: "#fff",
        boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.1)",
      },
    },
  };

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [studentMajor, setStudentMajor] = useState(null);
  const [errors, setErrors] = useState({});
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
        console.log("[ProposeTopic] Starting to fetch data...");

        const [catRes, teacherRes, userRes] = await Promise.all([
          axios.get("/api/topic-categories").catch((err) => {
            console.error(
              "[ProposeTopic] Topic categories error:",
              err.response?.status,
              err.message,
            );
            throw err;
          }),
          axios.get("/api/users/teachers").catch((err) => {
            console.error(
              "[ProposeTopic] Teachers error:",
              err.response?.status,
              err.message,
            );
            throw err;
          }),
          axios.get("/api/auth/me").catch((err) => {
            console.error(
              "[ProposeTopic] Student profile error:",
              err.response?.status,
              err.message,
            );
            throw err;
          }),
        ]);

        const catData = catRes.data?.data || catRes.data || [];
        const teacherData = teacherRes.data?.data || teacherRes.data || [];
        // Fixed: auth/me returns data directly, not data.data
        const student = userRes.data?.data?.user || {};
        const major = student.user_major;

        console.log("[ProposeTopic] Student major:", major);

        setCategories(Array.isArray(catData) ? catData : []);
        setTeachers(Array.isArray(teacherData) ? teacherData : []);
        setStudentMajor(major || null);

        if (!major) {
          console.warn("[ProposeTopic] Student does not have major");
          toast.error(
            "Vui lòng cập nhật ngành học trong hồ sơ trước khi đề xuất đề tài",
          );
        } else {
          console.log("[ProposeTopic] Student major loaded:", major);
        }
      } catch (error) {
        console.error("[ProposeTopic] Full error object:", error);
        console.error("[ProposeTopic] Error details:", {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          data: error.response?.data,
        });
        toast.error(
          "Không thể tải dữ liệu. Vui lòng kiểm tra kết nối backend hoặc đăng nhập lại.",
        );
      }
    };

    fetchData();
  }, []);

  const handleChange = (field) => (event) => {
    const value = field === 'topic_max_members' ? parseInt(event.target.value, 10) || 1 : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.topic_title || form.topic_title.trim().length < 10) {
      newErrors.topic_title = "Tiêu đề ít nhất 10 ký tự";
    }

    if (form.topic_title && form.topic_title.length > 500) {
      newErrors.topic_title = "Tiêu đề không quá 500 ký tự";
    }

    if (!form.topic_description || form.topic_description.trim().length < 50) {
      newErrors.topic_description = "Mô tả ít nhất 50 ký tự";
    }

    if (!form.topic_category) {
      newErrors.topic_category = "Danh mục là bắt buộc";
    }

    if (
      !form.topic_max_members ||
      form.topic_max_members < 1 ||
      form.topic_max_members > 5
    ) {
      newErrors.topic_max_members = "Số thành viên từ 1 đến 5";
    }

    // Check if student has major
    if (
      !studentMajor ||
      (typeof studentMajor === "object" &&
        Object.keys(studentMajor).length === 0)
    ) {
      newErrors.form =
        "Vui lòng cập nhật ngành học trong hồ sơ trước khi đề xuất";
      console.error("[ProposeTopic] Validation failed - major:", studentMajor);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin đề xuất");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/student/topics/propose", form);
      toast.success("Đề xuất đề tài thành công. Chờ giảng viên duyệt.");
      navigate("/student/topics");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể đề xuất đề tài";
      toast.error(errorMessage);
      console.error("Proposal error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 10 }}>
      {/* Header */}
      <Box sx={headerGradientSx}>
        <Container maxWidth="xl">
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 1.5,
              letterSpacing: "-0.02em",
            }}
          >
            Đề xuất tư tưởng mới
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, fontWeight: 400, maxWidth: "600px" }}
          >
            Điền đầy đủ các thông tin chuyên sâu bên dưới để gửi đề tài nghiên
            cứu lên ban quản lý.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 0 }}>
        <Paper sx={{ ...glassCardSx, p: { xs: 3, md: 6 } }} elevation={0}>
          {loading && (
            <LinearProgress
              sx={{
                mb: 4,
                borderRadius: 4,
                height: 6,
                bgcolor: "#e2e8f0",
                "& .MuiLinearProgress-bar": { bgcolor: "#2563eb" },
              }}
            />
          )}

          {errors.form && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "12px",
                color: "#991b1b",
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                ⚠️ {errors.form}
              </Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={0}>
              <Box mb={4}>
                <Typography
                  variant="subtitle2"
                  color="#64748b"
                  fontWeight={700}
                  gutterBottom
                  textTransform="uppercase"
                  letterSpacing={1}
                >
                  Thông tin cơ bản
                </Typography>
                <TextField
                  label="Tiêu đề đề tài"
                  fullWidth
                  required
                  value={form.topic_title}
                  onChange={handleChange("topic_title")}
                  helperText={
                    errors.topic_title ||
                    `${form.topic_title.length}/500 ký tự (tối thiểu 10)`
                  }
                  error={!!errors.topic_title}
                  sx={{ ...inputSx, mb: 3 }}
                />

                <TextField
                  label="Mô tả chi tiết"
                  fullWidth
                  required
                  multiline
                  minRows={4}
                  value={form.topic_description}
                  onChange={handleChange("topic_description")}
                  helperText={
                    errors.topic_description ||
                    `${form.topic_description.length} ký tự (tối thiểu 50)`
                  }
                  error={!!errors.topic_description}
                  sx={{ ...inputSx }}
                />
              </Box>

              <Box mb={4}>
                <Typography
                  variant="subtitle2"
                  color="#64748b"
                  fontWeight={700}
                  gutterBottom
                  textTransform="uppercase"
                  letterSpacing={1}
                  mt={1}
                  mb={2}
                >
                  Phân loại & Cấu hình
                </Typography>

                {studentMajor &&
                typeof studentMajor === "object" &&
                Object.keys(studentMajor).length > 0 ? (
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      bgcolor: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "12px",
                      color: "#1e40af",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      📚 Ngành học:{" "}
                      <strong>
                        {studentMajor.major_title ||
                          studentMajor.name ||
                          "Đang tải..."}
                      </strong>
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Ngành học sẽ được lấy từ thông tin hồ sơ của bạn
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      bgcolor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "12px",
                      color: "#991b1b",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      ⚠️ Chưa cập nhật ngành học
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Vui lòng cập nhật thông tin hồ sơ để chọn ngành học
                    </Typography>
                  </Box>
                )}

                <Box
                  display="flex"
                  gap={3}
                  flexDirection={{ xs: "column", md: "row" }}
                >
                  <FormControl
                    sx={{ flex: 1, ...inputSx }}
                    required
                    error={!!errors.topic_category}
                  >
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
                    required
                    inputProps={{ min: 1, max: 5 }}
                    value={form.topic_max_members}
                    onChange={handleChange("topic_max_members")}
                    helperText={errors.topic_max_members || "1-5 thành viên"}
                    error={!!errors.topic_max_members}
                    sx={{ flex: 1, ...inputSx }}
                  />
                </Box>
              </Box>

              <Box>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel>
                    Giảng viên hướng dẫn mong muốn (Tuỳ chọn)
                  </InputLabel>
                  <Select
                    value={form.topic_advisor_request}
                    label="Giảng viên hướng dẫn mong muốn (Tuỳ chọn)"
                    onChange={handleChange("topic_advisor_request")}
                  >
                    <MenuItem value="">
                      <em style={{ color: "#94a3b8" }}>
                        -- Không yêu cầu cụ thể --
                      </em>
                    </MenuItem>
                    {teachers.map((teacher) => (
                      <MenuItem key={teacher._id} value={teacher.user_name}>
                        {teacher.user_name} ({teacher.user_id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box
              mt={5}
              pt={3}
              borderTop="1px dashed #e2e8f0"
              display="flex"
              justifyContent="flex-end"
              gap={2}
            >
              <Button
                variant="outlined"
                onClick={() => navigate("/student/topics")}
                disabled={loading}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 1.5,
                  color: "#64748b",
                  borderColor: "#cbd5e1",
                  "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" },
                }}
              >
                Hủy đề xuất
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  loading ||
                  !studentMajor ||
                  (typeof studentMajor === "object" &&
                    Object.keys(studentMajor).length === 0)
                }
                sx={{
                  bgcolor: "#2563eb",
                  color: "white",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 800,
                  px: 4,
                  py: 1.5,
                  boxShadow: "0 4px 6px rgba(37,99,235,0.2)",
                  "&:hover": {
                    bgcolor: "#1d4ed8",
                    boxShadow: "0 10px 15px rgba(37,99,235,0.3)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s",
                }}
              >
                Gửi đề cương
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProposeTopic;
