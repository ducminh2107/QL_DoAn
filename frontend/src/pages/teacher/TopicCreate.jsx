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
  Grid,
  Stack,
  Chip,
  Fade,
  InputAdornment,
  Avatar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Event as EventIcon,
  Group as GroupIcon,
  Note as NoteIcon,
  Title as TitleIcon,
  Lightbulb as LightbulbIcon,
  School as SchoolIcon,
  RocketLaunch as RocketIcon,
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
      console.log("🚀 Starting data fetch...");
      const [categoriesRes, majorsRes, periodsRes] = await Promise.all([
        axios.get("/api/topic-categories"),
        axios.get("/api/majors"),
        axios.get("/api/registration-periods"),
      ]);

      // Robustly handle different API response structures
      const categoriesData =
        categoriesRes.data.data || categoriesRes.data || [];
      const majorsData = majorsRes.data.data || majorsRes.data || [];
      const periodsData = periodsRes.data.data || periodsRes.data || [];

      console.log(
        `✅ Loaded ${Array.isArray(categoriesData) ? categoriesData.length : 0} categories`,
      );
      console.log(
        `✅ Loaded ${Array.isArray(majorsData) ? majorsData.length : 0} majors`,
      );

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setMajors(Array.isArray(majorsData) ? majorsData : []);
      setRegistrationPeriods(Array.isArray(periodsData) ? periodsData : []);

      // Auto-select active registration period if available
      const activePeriod = (Array.isArray(periodsData) ? periodsData : []).find(
        (p) => p.registration_period_status === "active",
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
    if (
      !topic.topic_title ||
      !topic.topic_description ||
      !topic.topic_category ||
      !topic.topic_registration_period
    ) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...topic,
      };
      const response = await axios.post("/api/teacher/topics", payload);
      toast.success("Tạo đề tài thành công");
      navigate(`/teacher/topics/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo đề tài thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  // --- STYLES ---
  const pageContainerSx = {
    pb: 8,
    minHeight: "100vh",
    bgcolor: "#f8fafc", // Nền tổng thể sáng sủa
  };

  const headerGradientSx = {
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    pt: 6,
    pb: 8,
    color: "white",
    mb: -4, // Overlap effect
    borderRadius: { xs: 0, md: "0 0 32px 32px" },
    boxShadow: "0 10px 30px -10px rgba(30, 58, 138, 0.5)",
  };

  const cardSx = {
    p: { xs: 3, md: 4 },
    borderRadius: "24px",
    border: "none",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
    height: "100%",
    bgcolor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(20px)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
    },
  };

  const sectionHeaderSx = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    mb: 3,
  };

  const iconBoxSx = (color = "#eff6ff", iconColor = "#1e3a8a") => ({
    width: 48,
    height: 48,
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: color,
    color: iconColor,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  });

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
      bgcolor: "#f8fafc",
      transition: "all 0.2s",
      "& fieldset": { borderColor: "#e2e8f0" },
      "&:hover fieldset": { borderColor: "#cbd5e1" },
      "&.Mui-focused": {
        bgcolor: "#ffffff",
        boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.1)",
        "& fieldset": { borderColor: "#3b82f6", borderWidth: "1.5px" },
      },
    },
    "& .MuiInputLabel-root": { fontFamily: "'Inter', sans-serif" },
  };

  const selectSx = {
    borderRadius: "16px",
    bgcolor: "#f8fafc",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
    "&.Mui-focused": {
      bgcolor: "#ffffff",
      boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.1)",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#3b82f6",
        borderWidth: "1.5px",
      },
    },
  };

  const actionButtonSx = {
    borderRadius: "14px",
    px: 4,
    py: 1.5,
    fontWeight: 600,
    textTransform: "none",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.15)",
    },
  };

  if (loadingData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f8fafc"
      >
        <CircularProgress size={50} thickness={4} sx={{ color: "#3b82f6" }} />
      </Box>
    );
  }

  return (
    <Box sx={pageContainerSx}>
      {/* Premium Header */}
      <Box sx={headerGradientSx}>
        <Container maxWidth="xl">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/teacher/topics")}
            sx={{
              mb: 2,
              color: "rgba(255,255,255,0.9)",
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Quay lại danh sách
          </Button>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  letterSpacing: "-0.03em",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <RocketIcon sx={{ fontSize: "2.5rem", opacity: 0.9 }} />
                Xây dựng đề tài mới
              </Typography>
              <Typography
                variant="h6"
                sx={{ opacity: 0.8, fontWeight: 400, maxWidth: "600px" }}
              >
                Kiến tạo không gian nghiên cứu sáng tạo và chuyên nghiệp cho
                sinh viên của bạn.
              </Typography>
            </Box>

            {/* Desktop Actions */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/teacher/topics")}
                sx={{
                  borderRadius: "14px",
                  px: 3,
                  py: 1.2,
                  color: "white",
                  borderColor: "rgba(255,255,255,0.4)",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
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
                    <AddIcon />
                  )
                }
                sx={{
                  ...actionButtonSx,
                  bgcolor: "white",
                  color: "#1e3a8a",
                  "&:hover": {
                    bgcolor: "#f1f5f9",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {submitting ? "Đang xử lý..." : "Công bố đề tài"}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 0 }}>
        <Fade in timeout={600}>
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", lg: "row" },
                gap: 4,
              }}
            >
              {/* Left Column: Core Content - Flexible Width */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Paper elevation={0} sx={cardSx}>
                  <Box sx={sectionHeaderSx}>
                    <Box sx={iconBoxSx("#eff6ff", "#3b82f6")}>
                      <DescriptionIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="#1e293b">
                        Nội dung trọng tâm
                      </Typography>
                      <Typography variant="body2" color="#64748b">
                        Thông tin chính xác giúp sinh viên hiểu rõ đề tài
                      </Typography>
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    label="Tiêu đề đề tài"
                    name="topic_title"
                    value={topic.topic_title}
                    onChange={handleChange}
                    required
                    placeholder="Ví dụ: Xây dựng hệ thống quản lý bất động sản ứng dụng Blockchain..."
                    sx={{ ...textFieldSx, mb: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TitleIcon sx={{ color: "#94a3b8" }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Mô tả chi tiết"
                    name="topic_description"
                    value={topic.topic_description}
                    onChange={handleChange}
                    multiline
                    rows={8}
                    required
                    placeholder="Mô tả kỹ thuật, yêu cầu công nghệ và mục tiêu cần đạt được của đề tài..."
                    sx={{ ...textFieldSx, mb: 4 }}
                    helperText={
                      <Box
                        component="span"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        mt={1}
                      >
                        <LightbulbIcon
                          fontSize="small"
                          sx={{ color: "#ca8a04" }}
                        />
                        Mẹo: Mô tả càng chi tiết, bạn càng thu hút được sinh
                        viên chất lượng.
                      </Box>
                    }
                  />

                  <Box sx={{ mt: 4, pt: 4, borderTop: "1px dashed #e2e8f0" }}>
                    <Box sx={sectionHeaderSx}>
                      <Box sx={iconBoxSx("#fff7ed", "#f97316")}>
                        <NoteIcon />
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="#1e293b">
                        Lưu ý bổ sung
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      label="Ghi chú dành cho sinh viên"
                      name="teacher_notes"
                      value={topic.teacher_notes}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      placeholder="Các kỹ năng cần có, tài liệu tham khảo hoặc yêu cầu cụ thể..."
                      sx={textFieldSx}
                    />
                  </Box>
                </Paper>
              </Box>

              {/* Right Column: Configuration - Fixed Width */}
              <Box sx={{ width: { xs: "100%", lg: "380px" }, flexShrink: 0 }}>
                <Stack spacing={3}>
                  {/* Taxonomy Card */}
                  <Paper elevation={0} sx={cardSx}>
                    <Box sx={sectionHeaderSx}>
                      <Box sx={iconBoxSx("#f0fdf4", "#16a34a")}>
                        <CategoryIcon />
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="#1e293b">
                        Phân loại
                      </Typography>
                    </Box>

                    <FormControl fullWidth sx={{ mb: 3 }} required>
                      <InputLabel sx={{ fontFamily: "'Inter', sans-serif" }}>
                        Danh mục đề tài
                      </InputLabel>
                      <Select
                        name="topic_category"
                        value={topic.topic_category}
                        onChange={handleChange}
                        label="Danh mục đề tài"
                        sx={selectSx}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 400,
                              borderRadius: "16px",
                              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                              "& .MuiMenuItem-root": {
                                whiteSpace: "normal",
                                py: 1.5,
                                px: 2,
                                borderBottom: "1px solid #f1f5f9",
                                "&:last-child": { borderBottom: "none" },
                                "&:hover": { bgcolor: "#f8fafc" },
                              },
                            },
                          },
                        }}
                      >
                        {categories.map((cat) => (
                          <MenuItem
                            key={cat._id}
                            value={cat._id}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: 0.5,
                            }}
                          >
                            <Box sx={{ fontWeight: 600, color: "#1e3a8a" }}>
                              {cat.topic_category_title}
                            </Box>
                            {cat.topic_category_description && (
                              <Box
                                sx={{
                                  fontSize: "0.8rem",
                                  color: "#64748b",
                                  lineHeight: 1.4,
                                }}
                              >
                                {cat.topic_category_description}
                              </Box>
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel sx={{ fontFamily: "'Inter', sans-serif" }}>
                        Chuyên ngành phù hợp
                      </InputLabel>
                      <Select
                        name="topic_major"
                        value={topic.topic_major}
                        onChange={handleChange}
                        label="Chuyên ngành phù hợp"
                        sx={selectSx}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 400,
                              borderRadius: "16px",
                              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                              "& .MuiMenuItem-root": {
                                whiteSpace: "normal",
                                py: 1.5,
                                px: 2,
                                borderBottom: "1px solid #f1f5f9",
                                "&:hover": { bgcolor: "#f8fafc" },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em style={{ color: "#94a3b8" }}>
                            Mở cho tất cả chuyên ngành
                          </em>
                        </MenuItem>
                        {majors.map((major) => (
                          <MenuItem
                            key={major._id}
                            value={major._id}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <SchoolIcon
                                fontSize="small"
                                sx={{ color: "#3b82f6", opacity: 0.7 }}
                              />
                              <Box sx={{ fontWeight: 600, color: "#0f172a" }}>
                                {major.major_title}
                              </Box>
                              {major.major_code && (
                                <Chip
                                  label={major.major_code}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    bgcolor: "#eff6ff",
                                    color: "#3b82f6",
                                    fontWeight: 700,
                                    borderRadius: "6px",
                                  }}
                                />
                              )}
                            </Box>
                            {major.major_description && (
                              <Box
                                sx={{
                                  fontSize: "0.8rem",
                                  color: "#64748b",
                                  lineHeight: 1.4,
                                  pl: 3.5,
                                }}
                              >
                                {major.major_description}
                              </Box>
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Paper>

                  {/* Settings Card */}
                  <Paper elevation={0} sx={cardSx}>
                    <Box sx={sectionHeaderSx}>
                      <Box sx={iconBoxSx("#fef2f2", "#ef4444")}>
                        <EventIcon />
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="#1e293b">
                        Thiết lập
                      </Typography>
                    </Box>

                    <FormControl fullWidth sx={{ mb: 4 }} required>
                      <InputLabel sx={{ fontFamily: "'Inter', sans-serif" }}>
                        Đợt đăng ký
                      </InputLabel>
                      <Select
                        name="topic_registration_period"
                        value={topic.topic_registration_period}
                        onChange={handleChange}
                        label="Đợt đăng ký"
                        sx={selectSx}
                      >
                        {registrationPeriods.map((period) => (
                          <MenuItem
                            key={period._id}
                            value={period._id}
                            sx={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              width="100%"
                              alignItems="center"
                            >
                              <Box fontWeight={500}>
                                {period.registration_period_semester}
                              </Box>
                              <Chip
                                label={
                                  period.registration_period_status === "active"
                                    ? "Đang mở"
                                    : "Đã đóng"
                                }
                                size="small"
                                color={
                                  period.registration_period_status === "active"
                                    ? "success"
                                    : "default"
                                }
                                variant={
                                  period.registration_period_status === "active"
                                    ? "filled"
                                    : "outlined"
                                }
                                sx={{
                                  height: 24,
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="#475569"
                      mb={2}
                    >
                      Quy mô nhóm
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        bgcolor: "#f8fafc",
                        p: 2,
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Avatar sx={{ bgcolor: "#eff6ff", color: "#3b82f6" }}>
                        <GroupIcon />
                      </Avatar>
                      <TextField
                        fullWidth
                        variant="standard"
                        name="topic_max_members"
                        type="number"
                        value={topic.topic_max_members}
                        onChange={handleChange}
                        inputProps={{
                          min: 1,
                          max: 5,
                          style: {
                            fontSize: "1.2rem",
                            fontWeight: 600,
                            textAlign: "center",
                          },
                        }}
                        InputProps={{ disableUnderline: true }}
                      />
                      <Typography
                        variant="body2"
                        color="#64748b"
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        Sinh viên
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block", textAlign: "center" }}
                    >
                      (Tối đa 5 thành viên / nhóm)
                    </Typography>
                  </Paper>
                </Stack>
              </Box>
            </Box>

            {/* Mobile Actions */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                flexDirection: "column",
                gap: 2,
                mt: 6,
                position: "sticky",
                bottom: 0,
                bgcolor: "white",
                p: 2,
                boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.05)",
                mx: -2,
                zIndex: 10,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={submitting}
                sx={{
                  borderRadius: "12px",
                  py: 1.5,
                  bgcolor: "#1e3a8a",
                  fontSize: "1rem",
                }}
              >
                {submitting ? "Đang xử lý..." : "Công bố đề tài"}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate("/teacher/topics")}
                sx={{ borderRadius: "12px", py: 1.5, color: "#64748b" }}
              >
                Hủy bỏ quay lại
              </Button>
            </Box>
          </form>
        </Fade>
      </Container>
    </Box>
  );
};

export default TopicCreate;
