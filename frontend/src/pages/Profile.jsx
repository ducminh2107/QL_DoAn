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
  Chip,
  Divider,
  Alert,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarMonth as DateIcon,
  School as CourseIcon,
  CameraAlt as CameraIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

/* ──────────────── InfoItem component ──────────────── */
const InfoItem = ({
  label,
  value,
  name,
  isEditing,
  onChange,
  type = "text",
  select = false,
  options = [],
}) => (
  <Box sx={{ mb: 1.5, display: "flex", alignItems: "center" }}>
    <Typography
      sx={{
        color: "#475569",
        fontWeight: 400,
        fontSize: "0.92rem",
        width: "130px",
        flexShrink: 0,
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
        InputLabelProps={type === "date" ? { shrink: true } : {}}
        sx={{
          "& .MuiInput-root": {
            fontSize: "0.92rem",
            fontWeight: 600,
            color: "#000",
          },
        }}
      >
        {select &&
          options.map((option) => {
            const optVal = typeof option === "object" ? option.value : option;
            const optLabel = typeof option === "object" ? option.label : option;
            return (
              <MenuItem key={optVal} value={optVal}>
                {optLabel}
              </MenuItem>
            );
          })}
      </TextField>
    ) : (
      <Typography
        sx={{
          color: "#000",
          fontWeight: 600,
          fontSize: "0.92rem",
          wordBreak: "break-all",
          flex: 1,
        }}
      >
        {value || "---"}
      </Typography>
    )}
  </Box>
);

/* ──────────────── Role badge ──────────────── */
const roleBadge = (role) => {
  const map = {
    admin: { label: "Quản trị viên", color: "error" },
    teacher: { label: "Giảng viên", color: "primary" },
    student: { label: "Sinh viên", color: "success" },
  };
  return map[role] || { label: role, color: "default" };
};

/* ──────────────── Main Component ──────────────── */
const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Change password state
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    const fetchSelections = async () => {
      try {
        const [facRes, majRes] = await Promise.all([
          axios.get("/api/faculties"),
          axios.get("/api/majors"),
        ]);
        setFaculties(facRes.data.data || []);
        setMajors(majRes.data.data || []);
      } catch (error) {
        console.error("Fetch selections error:", error);
      }
    };
    fetchSelections();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        user_name: user.user_name || "",
        user_date_of_birth: user.user_date_of_birth
          ? String(user.user_date_of_birth).split("T")[0]
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
        user_title: user.user_title || "",
        user_major: user.user_major?._id || user.user_major || "",
        user_faculty: user.user_faculty?._id || user.user_faculty || "",
        user_training_system: user.user_training_system || "ĐH chính quy",
        user_academic_year: user.user_academic_year || "",
        user_avatar: user.user_avatar || "",
      });
    }
  }, [user]);

  const handleFieldChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh không được lớn hơn 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => handleFieldChange("user_avatar", reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile(formData);
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lưu thông tin thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (
      !pwForm.currentPassword ||
      !pwForm.newPassword ||
      !pwForm.confirmPassword
    ) {
      setPwError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      setPwLoading(true);
      await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Đổi mật khẩu thành công!");
    } catch (error) {
      setPwError(error.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setPwLoading(false);
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
    borderRadius: 2.5,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    mb: 3,
  };
  const sectionHeaderSx = {
    bgcolor: "#f8fafc",
    px: 2.5,
    py: 1.5,
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  };
  const badge = roleBadge(user.role);

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* ── Header ── */}
        <Box
          sx={{
            mb: 4,
            p: 4,
            background:
              "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
            borderRadius: 3,
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            boxShadow: "0 10px 30px rgba(37,99,235,0.25)",
          }}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
              <PersonIcon sx={{ fontSize: 32 }} />
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
              >
                Hồ Sơ Cá Nhân
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <DateIcon sx={{ fontSize: 16, opacity: 0.8 }} />
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {currentDay}
              </Typography>
              <Chip
                label={badge.label}
                color={badge.color}
                size="small"
                icon={<AdminIcon sx={{ fontSize: 14 }} />}
                sx={{ fontWeight: 700, ml: 1 }}
              />
            </Stack>
          </Box>
          <Box display="flex" gap={1}>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
              >
                Chỉnh sửa
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setIsEditing(false);
                  }}
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,0.5)",
                    fontWeight: 700,
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    bgcolor: "#16a34a",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#15803d" },
                  }}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* ── Section 1: Thông tin cá nhân ── */}
        <Paper elevation={0} sx={sectionPaperSx}>
          <Box sx={sectionHeaderSx}>
            <PersonIcon sx={{ color: "#1e3a8a" }} />
            <Typography
              sx={{ fontWeight: 700, color: "#1e3a8a", fontSize: "1rem" }}
            >
              Thông tin{" "}
              {user.role === "student"
                ? "sinh viên"
                : user.role === "teacher"
                  ? "giảng viên"
                  : "quản trị viên"}
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
              {/* Avatar */}
              <Box
                sx={{
                  width: { xs: "100%", md: "160px" },
                  textAlign: "center",
                  flexShrink: 0,
                  pr: { md: 3 },
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
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                      bgcolor: "#f1f5f9",
                      fontSize: 48,
                    }}
                  >
                    {!formData.user_avatar &&
                      user.user_name?.charAt(0).toUpperCase()}
                  </Avatar>
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
                      "&:hover": { bgcolor: "#1d4ed8" },
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  >
                    <CameraIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: "block", mt: 2 }}
                >
                  Tối đa 2MB
                </Typography>
              </Box>

              {/* Cột 1 */}
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

              {/* Cột 2 */}
              <Box
                sx={{
                  flex: { xs: "1 1 100%", md: "1 1 27%" },
                  borderLeft: { md: "1px solid #e2e8f0" },
                  pl: { md: 3 },
                  ml: { md: 2 },
                  minWidth: 0,
                }}
              >
                <InfoItem
                  label="Email"
                  value={user.email}
                  name="email"
                  isEditing={false}
                />
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
              </Box>

              {/* Cột 3 */}
              <Box
                sx={{
                  flex: { xs: "1 1 100%", md: "1 1 28%" },
                  borderLeft: { md: "1px solid #e2e8f0" },
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
                  label="Nơi sinh"
                  value={formData.user_birth_place}
                  name="user_birth_place"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
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

        {/* ── Section 2: Thông tin đào tạo ── */}
        <Paper elevation={0} sx={sectionPaperSx}>
          <Box sx={sectionHeaderSx}>
            <CourseIcon sx={{ color: "#1e3a8a" }} />
            <Typography
              sx={{ fontWeight: 700, color: "#1e3a8a", fontSize: "1rem" }}
            >
              {user?.role === "teacher"
                ? "Thông tin công tác"
                : "Thông tin khóa học"}
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={user?.role === "teacher" ? 12 : 6}>
                {user?.role === "teacher" ? (
                  <InfoItem
                    label="Học hàm / Học vị"
                    value={formData.user_title}
                    name="user_title"
                    isEditing={isEditing}
                    onChange={handleFieldChange}
                  />
                ) : (
                  <InfoItem
                    label="Lớp"
                    value={formData.user_class}
                    name="user_class"
                    isEditing={isEditing}
                    onChange={handleFieldChange}
                  />
                )}
                <InfoItem
                  label="Ngành"
                  value={
                    isEditing
                      ? formData.user_major
                      : majors.find((m) => m._id === formData.user_major)
                          ?.major_title || "--"
                  }
                  name="user_major"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  select
                  options={majors
                    .filter(
                      (m) =>
                        !formData.user_faculty ||
                        m.faculty === formData.user_faculty ||
                        m.faculty?._id === formData.user_faculty,
                    )
                    .map((m) => ({ label: m.major_title, value: m._id }))}
                />
                <InfoItem
                  label="Khoa"
                  value={
                    isEditing
                      ? formData.user_faculty
                      : faculties.find((f) => f._id === formData.user_faculty)
                          ?.faculty_title || "--"
                  }
                  name="user_faculty"
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  select
                  options={faculties.map((f) => ({
                    label: f.faculty_title,
                    value: f._id,
                  }))}
                />
              </Grid>
              {user?.role !== "teacher" && (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  sx={{
                    borderLeft: { sm: "1px solid #e2e8f0" },
                    pl: { sm: 4 },
                  }}
                >
                  <InfoItem
                    label="Hệ đào tạo"
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
              )}
            </Grid>
          </Box>
        </Paper>

        {/* ── Section 3: Đổi mật khẩu ── */}
        <Paper elevation={0} sx={sectionPaperSx}>
          <Box sx={sectionHeaderSx}>
            <LockIcon sx={{ color: "#1e3a8a" }} />
            <Typography
              sx={{ fontWeight: 700, color: "#1e3a8a", fontSize: "1rem" }}
            >
              Đổi mật khẩu
            </Typography>
          </Box>
          <Box sx={{ p: 3, maxWidth: 480 }}>
            {pwError && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setPwError("")}
              >
                {pwError}
              </Alert>
            )}
            {[
              {
                key: "currentPassword",
                label: "Mật khẩu hiện tại",
                show: showPw.current,
                toggle: () => setShowPw((p) => ({ ...p, current: !p.current })),
              },
              {
                key: "newPassword",
                label: "Mật khẩu mới (tối thiểu 6 ký tự)",
                show: showPw.new,
                toggle: () => setShowPw((p) => ({ ...p, new: !p.new })),
              },
              {
                key: "confirmPassword",
                label: "Xác nhận mật khẩu mới",
                show: showPw.confirm,
                toggle: () => setShowPw((p) => ({ ...p, confirm: !p.confirm })),
              },
            ].map((field) => (
              <TextField
                key={field.key}
                fullWidth
                label={field.label}
                type={field.show ? "text" : "password"}
                value={pwForm[field.key]}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, [field.key]: e.target.value }))
                }
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={field.toggle} size="small">
                        {field.show ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ))}
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={pwLoading}
              startIcon={<LockIcon />}
              sx={{
                fontWeight: 700,
                bgcolor: "#1e3a8a",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              {pwLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </Button>
          </Box>
        </Paper>

        <Typography
          sx={{
            color: "#94a3b8",
            display: "block",
            textAlign: "center",
            mt: 2,
            fontSize: "0.82rem",
          }}
        >
          Hệ thống Quản lý Đề tài — © {new Date().getFullYear()}
        </Typography>
      </Container>
    </Box>
  );
};

export default Profile;
