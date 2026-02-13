import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Grid,
  Button,
  TextField,
  MenuItem,
  Stack,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarMonth as DateIcon,
  School as CourseIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const InfoItem = ({
  label,
  value,
  name,
  isEditing,
  onChange,
  type = "text",
  select = false,
  options = [],
}) => {
  return (
    <Box sx={{ mb: 1.5, display: "flex", alignItems: "center" }}>
      <Typography
        sx={{
          color: "#475569",
          fontWeight: 400,
          fontSize: "0.95rem",
          width: "120px",
          flexShrink: 0,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {label}:
      </Typography>
      {isEditing && name !== "user_id" && name !== "email" ? (
        <TextField
          fullWidth
          size="small"
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          type={type}
          select={select}
          variant="standard"
          sx={{
            "& .MuiInput-root": {
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#000",
              fontFamily: "'Inter', sans-serif",
            },
          }}
        >
          {select &&
            options.map((option) => (
              <MenuItem
                key={option}
                value={option}
                sx={{ fontFamily: "'Inter', sans-serif" }}
              >
                {option}
              </MenuItem>
            ))}
        </TextField>
      ) : (
        <Typography
          sx={{
            color: "#000",
            fontWeight: 600,
            fontSize: "0.95rem",
            fontFamily: "'Inter', sans-serif",
            wordBreak: "break-all",
            flex: 1,
          }}
        >
          {value || "---"}
        </Typography>
      )}
    </Box>
  );
};

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        user_name: user.user_name || "",
        user_date_of_birth: user.user_date_of_birth
          ? user.user_date_of_birth.split("T")[0]
          : "",
        user_gender: user.user_gender || "Nam",
        user_phone: user.user_phone || "",
        user_CCCD: user.user_CCCD || "",
        user_ethnicity: user.user_ethnicity || "Kinh",
        user_religion: user.user_religion || "Không",
        user_birth_place: user.user_birth_place || "",
        user_nationality: user.user_nationality || "Việt Nam",
        user_permanent_address: user.user_permanent_address || "",
        user_class: user.user_class || "",
        user_major: user.user_major || "",
        user_faculty: user.user_faculty || "",
        user_training_system: user.user_training_system || "ĐH chính quy",
        user_academic_year: user.user_academic_year || "2021-2025",
        user_avatar: user.user_avatar || "",
      });
    }
  }, [user]);

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFieldChange("user_avatar", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Update profile error:", error);
    }
  };

  if (!user) return null;

  const currentDay = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const sectionPaperSx = {
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    overflow: "hidden",
    mb: 4,
  };

  const sectionHeaderSx = {
    bgcolor: "#f8fafc",
    p: 1.5,
    borderBottom: "1px solid #cbd5e1",
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  };

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        minHeight: "100vh",
        py: 4,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Container maxWidth="xl">
        {/* Welcome Text */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 800,
              color: "#1e3a8a",
              mb: 0.5,
              fontSize: "1.5rem",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Chào mừng {user.user_name}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <DateIcon sx={{ fontSize: 18, color: "#64748b" }} />
            <Typography
              sx={{
                color: "#64748b",
                fontWeight: 500,
                fontSize: "0.95rem",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {currentDay}
            </Typography>
          </Stack>
        </Box>

        {/* Global Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              sx={{
                borderRadius: "8px",
                fontWeight: 700,
                color: "#1e3a8a",
                borderColor: "#1e3a8a",
                textTransform: "none",
                fontSize: "0.95rem",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Chỉnh sửa thông tin
            </Button>
          ) : (
            <Stack direction="row" spacing={2}>
              <Button
                variant="text"
                startIcon={<CancelIcon />}
                onClick={() => setIsEditing(false)}
                sx={{
                  fontWeight: 700,
                  color: "#dc2626",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 700,
                  bgcolor: "#1e3a8a",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Lưu dữ liệu
              </Button>
            </Stack>
          )}
        </Box>

        {/* Section 1: Thông tin sinh viên */}
        <Paper elevation={0} sx={sectionPaperSx}>
          <Box sx={sectionHeaderSx}>
            <PersonIcon sx={{ color: "#1e3a8a" }} />
            <Typography
              sx={{
                fontWeight: 700,
                color: "#1e3a8a",
                fontSize: "1rem",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Thông tin {user.role === "student" ? "sinh viên" : "giảng viên"}
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: { xs: "wrap", md: "nowrap" },
                gap: { xs: 4, md: 0 },
                alignItems: "flex-start",
              }}
            >
              {/* Avatar Sub-Column */}
              <Box
                sx={{
                  width: { xs: "100%", md: "160px" },
                  textAlign: "center",
                  flexShrink: 0,
                  pr: { md: 2 },
                }}
              >
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Avatar
                    key={formData.user_avatar}
                    src={formData.user_avatar}
                    variant="rounded"
                    sx={{
                      width: 140,
                      height: 170,
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      bgcolor: "#f1f5f9",
                    }}
                  />
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <IconButton
                    size="small"
                    onClick={() => fileInputRef.current.click()}
                    sx={{
                      position: "absolute",
                      bottom: -10,
                      right: -10,
                      bgcolor: "#1e3a8a",
                      color: "#fff",
                      "&:hover": { bgcolor: "#1e3a8a" },
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  >
                    <CameraIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Data Column 1 */}
              <Box
                sx={{ flex: { xs: "1 1 100%", md: "1 1 25%" }, minWidth: 0 }}
              >
                <InfoItem
                  label="Mã SV/GV"
                  value={user.user_id}
                  name="user_id"
                  isEditing={false}
                />
                <InfoItem
                  label="Họ và tên"
                  value={formData.user_name}
                  name="user_name"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <InfoItem
                  label="Ngày sinh"
                  value={formData.user_date_of_birth}
                  name="user_date_of_birth"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  type="date"
                />
                <InfoItem
                  label="Giới tính"
                  value={formData.user_gender}
                  name="user_gender"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  select
                  options={["Nam", "Nữ", "Khác"]}
                />
                <InfoItem
                  label="Trạng thái"
                  value={user.role === "teacher" ? "Đang công tác" : "Đang học"}
                  name="status"
                  isEditing={false}
                />
              </Box>

              {/* Data Column 2 */}
              <Box
                sx={{
                  flex: { xs: "1 1 100%", md: "1 1 27%" },
                  borderLeft: { md: "1px solid #64748b" },
                  pl: { md: 3 },
                  ml: { md: 2 },
                  minWidth: 0,
                }}
              >
                <InfoItem
                  label="Số điện thoại"
                  value={formData.user_phone}
                  name="user_phone"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <InfoItem
                  label="Số CCCD"
                  value={formData.user_CCCD}
                  name="user_CCCD"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <InfoItem
                  label="Dân tộc"
                  value={formData.user_ethnicity}
                  name="user_ethnicity"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <InfoItem
                  label="Tôn giáo"
                  value={formData.user_religion}
                  name="user_religion"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <InfoItem
                  label="Nơi sinh"
                  value={formData.user_birth_place}
                  name="user_birth_place"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
              </Box>

              {/* Data Column 3 */}
              <Box
                sx={{
                  flex: { xs: "1 1 100%", md: "1 1 28%" },
                  borderLeft: { md: "1px solid #64748b" },
                  pl: { md: 3 },
                  ml: { md: 2 },
                  minWidth: 0,
                }}
              >
                <InfoItem
                  label="Quốc tịch"
                  value={formData.user_nationality}
                  name="user_nationality"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <InfoItem
                  label="Email"
                  value={user.email}
                  name="email"
                  isEditing={false}
                />
                <InfoItem
                  label="Địa chỉ"
                  value={formData.user_permanent_address}
                  name="user_permanent_address"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Section 2: Thông tin khóa học */}
        <Paper elevation={0} sx={sectionPaperSx}>
          <Box sx={sectionHeaderSx}>
            <CourseIcon sx={{ color: "#1e3a8a" }} />
            <Typography
              sx={{
                fontWeight: 700,
                color: "#1e3a8a",
                fontSize: "1rem",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Thông tin khóa học
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  label="Lớp"
                  value={formData.user_class}
                  name="user_class"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <InfoItem
                  label="Ngành"
                  value={formData.user_major}
                  name="user_major"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <InfoItem
                  label="Khoa"
                  value={formData.user_faculty}
                  name="user_faculty"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                sx={{ borderLeft: { sm: "1px solid #64748b" }, pl: { sm: 4 } }}
              >
                <InfoItem
                  label="Bậc hệ đào tạo"
                  value={formData.user_training_system}
                  name="user_training_system"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <InfoItem
                  label="Niên khóa"
                  value={formData.user_academic_year}
                  name="user_academic_year"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Typography
          sx={{
            color: "#94a3b8",
            display: "block",
            textAlign: "center",
            mt: 4,
            fontSize: "0.85rem",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Hệ thống Quản lý Đồ án - Phát triển bởi Đội ngũ Công nghệ
        </Typography>
      </Container>
    </Box>
  );
};

export default Profile;
