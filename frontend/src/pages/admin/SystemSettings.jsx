import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingSettings, setEditingSettings] = useState({});
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/system-settings");
      const settingsData = response.data.data || {};
      setSettings(settingsData);
      setEditingSettings(settingsData);
    } catch (error) {
      console.error("Fetch settings error:", error);
      toast.error("Không thể tải cài đặt hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setEditingSettings({ ...editingSettings, [key]: value });
  };

  const handleSave = async () => {
    try {
      await axios.put("/api/admin/system-settings", editingSettings);
      toast.success("Lưu cài đặt thành công");
      setSettings(editingSettings);
    } catch (error) {
      toast.error("Lỗi lưu cài đặt");
    }
  };

  const handleReset = () => {
    setEditingSettings(settings);
  };

  const settingsGroups = [
    {
      title: "Cài Đặt Chung",
      items: [
        {
          key: "system_name",
          label: "Tên Hệ Thống",
          type: "text",
        },
        {
          key: "system_version",
          label: "Phiên Bản",
          type: "text",
        },
        {
          key: "support_email",
          label: "Email Hỗ Trợ",
          type: "email",
        },
      ],
    },
    {
      title: "Cài Đặt Thesisregist",
      items: [
        {
          key: "max_topics_per_student",
          label: "Số Đề Tài Tối Đa/Sinh Viên",
          type: "number",
        },
        {
          key: "max_students_per_topic",
          label: "Số Sinh Viên Tối Đa/Đề Tài",
          type: "number",
        },
        {
          key: "allow_topic_proposal",
          label: "Cho Phép Đề Xuất Đề Tài",
          type: "switch",
        },
      ],
    },
    {
      title: "Cài Đặt Bảo Mật",
      items: [
        {
          key: "password_min_length",
          label: "Độ Dài Mật Khẩu Tối Thiểu",
          type: "number",
        },
        {
          key: "session_timeout",
          label: "Thời Gian Timeout (phút)",
          type: "number",
        },
        {
          key: "enable_2fa",
          label: "Bật Xác Thực Hai Yếu Tố",
          type: "switch",
        },
      ],
    },
    {
      title: "Cài Đặt Thông Báo",
      items: [
        {
          key: "enable_email_notification",
          label: "Bật Thông Báo Email",
          type: "switch",
        },
        {
          key: "notification_frequency",
          label: "Tần Suất Thông Báo (giờ)",
          type: "number",
        },
      ],
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Cài Đặt Hệ Thống
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Quản lý các cài đặt toàn cục của hệ thống
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {settingsGroups.map((group, idx) => (
            <Grid item xs={12} key={idx}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {group.title}
                </Typography>

                <Grid container spacing={2}>
                  {group.items.map((item) => (
                    <Grid item xs={12} sm={6} key={item.key}>
                      {item.type === "switch" ? (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={editingSettings[item.key] || false}
                              onChange={(e) =>
                                handleChange(item.key, e.target.checked)
                              }
                            />
                          }
                          label={item.label}
                        />
                      ) : (
                        <TextField
                          fullWidth
                          label={item.label}
                          type={item.type}
                          value={editingSettings[item.key] || ""}
                          onChange={(e) =>
                            handleChange(item.key, e.target.value)
                          }
                          size="small"
                        />
                      )}
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Lưu Thay Đổi
              </Button>
              <Button variant="outlined" onClick={handleReset}>
                Hủy
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default SystemSettings;
