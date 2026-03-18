import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Avatar,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Build as MaintenanceIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Language as WebIcon,
  Phone as PhoneIcon,
  LocationOn as AddressIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const fontSx = { fontFamily: "'Inter', sans-serif" };

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

const SectionTitle = ({ icon, title, subtitle }) => (
  <Box display="flex" alignItems="flex-start" gap={1.5} mb={3}>
    <Avatar
      sx={{ bgcolor: "#eff6ff", color: "#2563eb", width: 40, height: 40 }}
    >
      {icon}
    </Avatar>
    <Box>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: "#1e293b", ...fontSx }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="textSecondary" sx={fontSx}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const SwitchRow = ({ label, desc, checked, onChange }) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    sx={{
      py: 1.5,
      px: 2,
      borderRadius: 2,
      border: "1px solid #f1f5f9",
      bgcolor: checked ? "#f0fdf4" : "#fafafa",
      transition: "all 0.2s",
    }}
  >
    <Box>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: "#1e293b", ...fontSx }}
      >
        {label}
      </Typography>
      {desc && (
        <Typography variant="caption" color="textSecondary" sx={fontSx}>
          {desc}
        </Typography>
      )}
    </Box>
    <Switch
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
      color="primary"
    />
  </Box>
);

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/system-settings");
      const data = res.data.data || {};
      setSettings(data);
      setEditing(data);
      setDirty(false);
    } catch {
      toast.error("Không thể tải cài đặt hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setEditing((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put("/api/admin/system-settings", editing);
      setSettings({ ...editing });
      setDirty(false);
      toast.success("Đã lưu cài đặt thành công!");
    } catch {
      toast.error("Lỗi lưu cài đặt. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setEditing({ ...settings });
    setDirty(false);
    toast("Đã hoàn nguyên về cài đặt đã lưu", { icon: "↩️" });
  };

  const field = (key, label, type = "text", extraProps = {}) => (
    <TextField
      key={key}
      fullWidth
      label={label}
      type={type}
      value={editing[key] ?? ""}
      onChange={(e) =>
        handleChange(
          key,
          type === "number" ? Number(e.target.value) : e.target.value,
        )
      }
      size="small"
      InputProps={{ style: fontSx }}
      InputLabelProps={{ style: fontSx }}
      {...extraProps}
    />
  );

  if (loading) return <LinearProgress />;

  const lastUpdated = settings.updatedAt || settings.updated_at;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
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
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
          boxShadow: "0 10px 30px rgba(37,99,235,0.25)",
        }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <SettingsIcon sx={{ fontSize: 32 }} />
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: "-0.5px", ...fontSx }}
            >
              Cài Đặt Hệ Thống
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.85, ...fontSx }}>
            Quản lý cấu hình toàn cục cho hệ thống quản lý đồ án tốt nghiệp
          </Typography>
          {lastUpdated && (
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, mt: 0.5, display: "block" }}
            >
              Cập nhật lần cuối: {new Date(lastUpdated).toLocaleString("vi-VN")}
            </Typography>
          )}
        </Box>
        <Box display="flex" gap={1}>
          {dirty && (
            <Chip
              label="Có thay đổi chưa lưu"
              icon={<WarningIcon />}
              sx={{ bgcolor: "#fbbf24", color: "#1c1917", fontWeight: 600 }}
            />
          )}
          <Tooltip title="Làm mới từ server">
            <IconButton
              onClick={fetchSettings}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.15)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box sx={{ borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ px: 2 }}
            TabIndicatorProps={{
              sx: { height: 3, borderRadius: "3px 3px 0 0" },
            }}
          >
            <Tab
              label="🏫 Thông tin trường"
              sx={{ fontWeight: 600, ...fontSx }}
            />
            <Tab
              label="📋 Cài đặt đề tài"
              sx={{ fontWeight: 600, ...fontSx }}
            />
            <Tab label="🔒 Bảo mật" sx={{ fontWeight: 600, ...fontSx }} />
            <Tab
              label="📧 Email & Thông báo"
              sx={{ fontWeight: 600, ...fontSx }}
            />
            <Tab label="🔧 Bảo trì" sx={{ fontWeight: 600, ...fontSx }} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* TAB 0 — School Info */}
          <TabPanel value={activeTab} index={0}>
            <SectionTitle
              icon={<SchoolIcon />}
              title="Thông tin trường & hệ thống"
              subtitle="Tên trường, logo, thông tin liên hệ hiển thị trong hệ thống"
            />
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                {field("system_name", "Tên hệ thống")}
              </Grid>
              <Grid item xs={12} md={6}>
                {field("school_name", "Tên trường")}
              </Grid>
              <Grid item xs={12} md={6}>
                {field("system_version", "Phiên bản hệ thống")}
              </Grid>
              <Grid item xs={12} md={6}>
                {field("school_website", "Website trường", "url", {
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <WebIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                    style: fontSx,
                  },
                })}
              </Grid>
              <Grid item xs={12}>
                {field(
                  "school_logo_url",
                  "URL Logo trường (đường dẫn ảnh)",
                  "url",
                )}
                {editing.school_logo_url && (
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <img
                      src={editing.school_logo_url}
                      alt="Logo preview"
                      style={{
                        height: 48,
                        objectFit: "contain",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      Xem trước logo
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="Thông tin liên hệ" size="small" />
                </Divider>
              </Grid>
              <Grid item xs={12} md={6}>
                {field("support_email", "Email hỗ trợ kỹ thuật", "email")}
              </Grid>
              <Grid item xs={12} md={6}>
                {field("contact_email", "Email liên hệ trường", "email")}
              </Grid>
              <Grid item xs={12} md={6}>
                {field("contact_phone", "Số điện thoại", "tel", {
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                    style: fontSx,
                  },
                })}
              </Grid>
              <Grid item xs={12} md={6}>
                {field("contact_address", "Địa chỉ trường", "text", {
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AddressIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                    style: fontSx,
                  },
                })}
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 1 — Thesis Settings */}
          <TabPanel value={activeTab} index={1}>
            <SectionTitle
              icon={<SettingsIcon />}
              title="Cài đặt đề tài"
              subtitle="Giới hạn đăng ký, cấu hình cho phép sinh viên đề xuất"
            />
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                {field(
                  "max_topics_per_student",
                  "Số đề tài tối đa / sinh viên",
                  "number",
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {field(
                  "max_students_per_topic",
                  "Số sinh viên tối đa / đề tài",
                  "number",
                )}
              </Grid>
              <Grid item xs={12}>
                <SwitchRow
                  label="Cho phép sinh viên tự đề xuất đề tài"
                  desc="Khi bật, sinh viên có thể điền form đề xuất ý tưởng đề tài mới chờ duyệt"
                  checked={editing.allow_topic_proposal}
                  onChange={(v) => handleChange("allow_topic_proposal", v)}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 2 — Security */}
          <TabPanel value={activeTab} index={2}>
            <SectionTitle
              icon={<SecurityIcon />}
              title="Bảo mật"
              subtitle="Mật khẩu, session, xác thực hai bước"
            />
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                {field(
                  "password_min_length",
                  "Độ dài mật khẩu tối thiểu",
                  "number",
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {field(
                  "session_timeout",
                  "Thời gian timeout phiên đăng nhập (phút)",
                  "number",
                )}
              </Grid>
              <Grid item xs={12}>
                <SwitchRow
                  label="Bật xác thực hai yếu tố (2FA)"
                  desc="Yêu cầu người dùng xác nhận qua email/OTP khi đăng nhập"
                  checked={editing.enable_2fa}
                  onChange={(v) => handleChange("enable_2fa", v)}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 3 — Email & Notifications */}
          <TabPanel value={activeTab} index={3}>
            <SectionTitle
              icon={<EmailIcon />}
              title="Cấu hình Email tự động"
              subtitle="SMTP server và các sự kiện kích hoạt gửi email thông báo"
            />

            {/* Main toggle */}
            <Box mb={3}>
              <SwitchRow
                label="Bật gửi email thông báo"
                desc="Tắt để tạm dừng tất cả email tự động kể cả SMTP đã cấu hình"
                checked={editing.enable_email_notification}
                onChange={(v) => handleChange("enable_email_notification", v)}
              />
            </Box>

            {editing.enable_email_notification && (
              <>
                <Divider sx={{ mb: 2.5 }}>
                  <Chip label="Cấu hình SMTP" size="small" />
                </Divider>
                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={8}>
                    {field("email_smtp_host", "SMTP Host (VD: smtp.gmail.com)")}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    {field(
                      "email_smtp_port",
                      "SMTP Port (587 / 465)",
                      "number",
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {field(
                      "email_smtp_user",
                      "SMTP Username (email đăng nhập)",
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Password (App Password)"
                      type={showSmtpPass ? "text" : "password"}
                      value={editing.email_smtp_password ?? ""}
                      onChange={(e) =>
                        handleChange("email_smtp_password", e.target.value)
                      }
                      size="small"
                      InputProps={{
                        style: fontSx,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setShowSmtpPass((v) => !v)}
                            >
                              {showSmtpPass ? (
                                <VisibilityOffIcon fontSize="small" />
                              ) : (
                                <VisibilityIcon fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{ style: fontSx }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {field("email_from_name", "Tên người gửi")}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {field("email_from_address", "Email người gửi", "email")}
                  </Grid>
                  <Grid item xs={12}>
                    <SwitchRow
                      label="Dùng SSL/TLS (port 465)"
                      desc="Bật nếu dùng port 465, tắt nếu dùng STARTTLS (port 587)"
                      checked={editing.email_smtp_secure}
                      onChange={(v) => handleChange("email_smtp_secure", v)}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2.5 }}>
                  <Chip label="Sự kiện kích hoạt email" size="small" />
                </Divider>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={4}>
                    <SwitchRow
                      label="SV đăng ký đề tài"
                      desc="Gửi email cho giảng viên khi có SV đăng ký mới"
                      checked={editing.notify_on_registration}
                      onChange={(v) =>
                        handleChange("notify_on_registration", v)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <SwitchRow
                      label="Admin duyệt / từ chối"
                      desc="Gửi email cho SV khi đề tài được duyệt hoặc từ chối"
                      checked={editing.notify_on_approval}
                      onChange={(v) => handleChange("notify_on_approval", v)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <SwitchRow
                      label="Chấm điểm hoàn thành"
                      desc="Gửi email kết quả điểm cho SV khi giảng viên lưu điểm"
                      checked={editing.notify_on_grading}
                      onChange={(v) => handleChange("notify_on_grading", v)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {field(
                      "notification_frequency",
                      "Tần suất tóm tắt định kỳ (giờ/lần, 0 = tắt)",
                      "number",
                    )}
                  </Grid>
                </Grid>
              </>
            )}

            {!editing.enable_email_notification && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Gửi email đang bị tắt. Người dùng sẽ không nhận được bất kỳ
                thông báo email tự động nào.
              </Alert>
            )}
          </TabPanel>

          {/* TAB 4 — Maintenance */}
          <TabPanel value={activeTab} index={4}>
            <SectionTitle
              icon={<MaintenanceIcon />}
              title="Chế độ bảo trì"
              subtitle="Tạm thời khóa hệ thống cho người dùng thông thường"
            />
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <SwitchRow
                  label="Bật chế độ bảo trì"
                  desc="Khi bật, chỉ Admin mới truy cập được. Sinh viên và giảng viên thấy thông báo bảo trì"
                  checked={editing.maintenance_mode}
                  onChange={(v) => handleChange("maintenance_mode", v)}
                />
              </Grid>
              {editing.maintenance_mode && (
                <>
                  <Grid item xs={12}>
                    <Alert severity="warning" icon={<WarningIcon />}>
                      ⚠️ Hệ thống đang ở chế độ bảo trì! Sinh viên và giảng viên
                      không thể truy cập.
                    </Alert>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Thông điệp bảo trì (hiển thị cho người dùng)"
                      value={editing.maintenance_message ?? ""}
                      onChange={(e) =>
                        handleChange("maintenance_message", e.target.value)
                      }
                      multiline
                      rows={3}
                      size="small"
                      placeholder="VD: Hệ thống đang được nâng cấp. Vui lòng quay lại sau 2 giờ."
                      InputProps={{ style: fontSx }}
                      InputLabelProps={{ style: fontSx }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </TabPanel>
        </Box>

        {/* Save bar */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #e2e8f0",
            bgcolor: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="textSecondary" sx={fontSx}>
            {dirty
              ? "⚠️ Có thay đổi chưa được lưu"
              : "✅ Đã đồng bộ với server"}
          </Typography>
          <Box display="flex" gap={1.5}>
            <Button
              onClick={handleReset}
              disabled={!dirty || saving}
              sx={{ fontWeight: 600, ...fontSx }}
            >
              Hoàn nguyên
            </Button>
            <Button
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              onClick={handleSave}
              disabled={!dirty || saving}
              sx={{
                bgcolor: "#1e3a8a",
                fontWeight: 700,
                ...fontSx,
                "&:hover": { bgcolor: "#1e40af" },
              }}
            >
              {saving ? "Đang lưu..." : "Lưu tất cả thay đổi"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SystemSettings;
