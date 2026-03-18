import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  LinearProgress,
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Groups as GroupsIcon,
  Info as InfoIcon,
  MenuBook as TopicIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const STATUS_LABEL = {
  planning: "Đang lập kế hoạch",
  active: "Đang hoạt động",
  completed: "Đã kết thúc",
};

const STATUS_COLOR = {
  planning: "primary",
  active: "success",
  completed: "default",
};

/** A styled section header with icon badge */
const FormSection = ({ icon, color, bgcolor, title }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      mt: 3.5,
      mb: 2,
      pb: 1.5,
      borderBottom: "1px solid #f1f5f9",
    }}
  >
    <Avatar
      sx={{
        bgcolor,
        width: 32,
        height: 32,
        color,
      }}
    >
      {icon}
    </Avatar>
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: "0.9rem",
        color: "#1e293b",
        letterSpacing: "0.01em",
      }}
    >
      {title}
    </Typography>
  </Box>
);

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#93c5fd",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#3b82f6",
      borderWidth: "1.5px",
    },
  },
};

const CouncilManagement = () => {
  const [councils, setCouncils] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [topicsList, setTopicsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    council_name: "",
    council_description: "",
    defense_date: "",
    defense_location: "",
    council_status: "planning",
    chairman: "",
    secretary: "",
    members: [],
    topics: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [councilsRes, teachersRes, topicsRes] = await Promise.all([
        axios.get("/api/councils"),
        axios.get("/api/users/teachers"),
        axios.get("/api/admin/topics/approved"),
      ]);
      setCouncils(councilsRes.data.data || []);
      setTeachers(teachersRes.data.data || []);
      setTopicsList(topicsRes.data.data || []);
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      const assignedTopics = item.topics
        ? item.topics.map((t) => (t._id ? t._id : t))
        : [];
      const memberIds = item.members
        ? item.members
            .map((m) => m.member_id?._id || m.member_id)
            .filter(Boolean)
        : [];
      setFormData({
        council_name: item.council_name || "",
        council_description: item.council_description || "",
        defense_date: item.defense_date ? item.defense_date.split("T")[0] : "",
        defense_location: item.defense_location || "",
        council_status: item.council_status || "planning",
        chairman: item.chairman?._id || item.chairman || "",
        secretary: item.secretary?._id || item.secretary || "",
        members: memberIds,
        topics: assignedTopics,
      });
    } else {
      setEditingItem(null);
      setFormData({
        council_name: "",
        council_description: "",
        defense_date: "",
        defense_location: "",
        council_status: "planning",
        chairman: "",
        secretary: "",
        members: [],
        topics: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        members: formData.members.map((id) => ({
          member_id: id,
          role: "member",
        })),
      };
      if (editingItem) {
        await axios.put(`/api/councils/${editingItem._id}`, payload);
        toast.success("Cập nhật thành công");
      } else {
        await axios.post("/api/councils", payload);
        toast.success("Tạo hội đồng thành công");
      }
      handleClose();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hội đồng này?")) {
      try {
        await axios.delete(`/api/councils/${id}`);
        toast.success("Xóa thành công");
        fetchData();
      } catch {
        toast.error("Xóa thất bại");
      }
    }
  };

  const setField = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Container maxWidth="lg" sx={{ mt: 2, fontFamily: "'Inter', sans-serif" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Quản lý Hội đồng bảo vệ
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Tạo hội đồng, phân công giảng viên và phân bổ đề tài
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
            py: 1.2,
            boxShadow: "0 4px 15px rgba(59,130,246,0.4)",
          }}
        >
          Thêm hội đồng
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid #e2e8f0", borderRadius: "12px" }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                {[
                  "Tên hội đồng",
                  "Ngày bảo vệ",
                  "Địa điểm",
                  "Trạng thái",
                  "",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: "0.8rem",
                    }}
                    align={h === "" ? "right" : "left"}
                  >
                    {h.toUpperCase()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {councils.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 6, color: "#94a3b8" }}
                  >
                    Chưa có hội đồng nào. Nhấn &quot;Thêm hội đồng&quot; để bắt
                    đầu.
                  </TableCell>
                </TableRow>
              ) : (
                councils.map((item) => (
                  <TableRow
                    key={item._id}
                    hover
                    sx={{ "&:last-child td": { border: 0 } }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                      {item.council_name}
                    </TableCell>
                    <TableCell>
                      {item.defense_date
                        ? new Date(item.defense_date).toLocaleDateString(
                            "vi-VN",
                          )
                        : "Chưa xếp lịch"}
                    </TableCell>
                    <TableCell>{item.defense_location || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          STATUS_LABEL[item.council_status] ||
                          item.council_status
                        }
                        color={STATUS_COLOR[item.council_status] || "default"}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(item)}
                        sx={{ color: "#3b82f6", mr: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(item._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ===== DIALOG ===== */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Gradient Header */}
          <Box
            sx={{
              background:
                "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
              px: 3,
              py: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  width: 38,
                  height: 38,
                }}
              >
                <GroupsIcon sx={{ color: "white", fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1rem",
                    lineHeight: 1.2,
                  }}
                >
                  {editingItem ? "Chỉnh sửa hội đồng" : "Thêm hội đồng mới"}
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}
                >
                  {editingItem
                    ? "Cập nhật thông tin hội đồng bảo vệ"
                    : "Tạo mới hội đồng bảo vệ"}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <DialogContent
            sx={{
              px: 3,
              pt: 1,
              pb: 2,
              maxHeight: "70vh",
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#cbd5e1",
                borderRadius: "3px",
              },
            }}
          >
            {/* SECTION 1 */}
            <FormSection
              icon={<InfoIcon sx={{ fontSize: 16 }} />}
              color="#1d4ed8"
              bgcolor="#dbeafe"
              title="Thông tin cơ bản"
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Tên hội đồng"
                required
                size="small"
                value={formData.council_name}
                onChange={setField("council_name")}
                sx={inputSx}
              />
              <TextField
                fullWidth
                select
                label="Trạng thái"
                size="small"
                value={formData.council_status}
                onChange={setField("council_status")}
                sx={inputSx}
              >
                <MenuItem value="planning">📋 Đang lập kế hoạch</MenuItem>
                <MenuItem value="active">✅ Đang hoạt động</MenuItem>
                <MenuItem value="completed">🏁 Đã kết thúc</MenuItem>
              </TextField>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Ngày bảo vệ"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={formData.defense_date}
                  onChange={setField("defense_date")}
                  sx={inputSx}
                />
                <TextField
                  fullWidth
                  label="Địa điểm / Phòng"
                  size="small"
                  value={formData.defense_location}
                  onChange={setField("defense_location")}
                  sx={inputSx}
                />
              </Box>
              <TextField
                fullWidth
                label="Mô tả / Ghi chú (tùy chọn)"
                multiline
                rows={2}
                size="small"
                value={formData.council_description}
                onChange={setField("council_description")}
                sx={inputSx}
              />
            </Box>

            {/* SECTION 2 */}
            <FormSection
              icon={<PersonIcon sx={{ fontSize: 16 }} />}
              color="#059669"
              bgcolor="#d1fae5"
              title="Thành viên hội đồng"
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                select
                label="Chủ tịch hội đồng"
                size="small"
                value={formData.chairman}
                onChange={setField("chairman")}
                sx={inputSx}
              >
                <MenuItem value="">
                  <em>-- Chọn giảng viên --</em>
                </MenuItem>
                {teachers.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.full_name} — {t.email}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Thư ký hội đồng"
                size="small"
                value={formData.secretary}
                onChange={setField("secretary")}
                sx={inputSx}
              >
                <MenuItem value="">
                  <em>-- Chọn giảng viên --</em>
                </MenuItem>
                {teachers.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.full_name} — {t.email}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                SelectProps={{ multiple: true }}
                label="Ủy viên hội đồng (chọn nhiều)"
                size="small"
                value={formData.members}
                onChange={setField("members")}
                sx={inputSx}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((val) => {
                      const t = teachers.find((x) => x._id === val);
                      return (
                        <Chip
                          key={val}
                          label={t ? t.full_name : val}
                          size="small"
                          sx={{
                            bgcolor: "#e0e7ff",
                            color: "#3730a3",
                            fontWeight: 600,
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {teachers.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.full_name} — {t.email}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* SECTION 3 */}
            <FormSection
              icon={<TopicIcon sx={{ fontSize: 16 }} />}
              color="#d97706"
              bgcolor="#fef3c7"
              title="Phân công Đồ án / Đề tài"
            />
            <TextField
              fullWidth
              select
              SelectProps={{ multiple: true }}
              label="Chọn các đồ án sẽ bảo vệ tại hội đồng này"
              size="small"
              value={formData.topics}
              onChange={setField("topics")}
              sx={inputSx}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((val) => {
                    const t = topicsList.find((x) => x._id === val);
                    return (
                      <Chip
                        key={val}
                        label={t ? t.topic_title : val}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: "#f59e0b",
                          color: "#92400e",
                          fontWeight: 600,
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {topicsList.map((t) => (
                <MenuItem key={t._id} value={t._id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {t.topic_title}
                    </Typography>
                    {t.topic_assembly &&
                      t.topic_assembly !== editingItem?._id && (
                        <Typography variant="caption" color="warning.main">
                          ⚠ Đang thuộc hội đồng khác
                        </Typography>
                      )}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>

          {/* Footer */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: "1px solid #f1f5f9",
              bgcolor: "#f8fafc",
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
            }}
          >
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                borderRadius: "10px",
                borderColor: "#cbd5e1",
                color: "#64748b",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                px: 3.5,
                boxShadow: "0 4px 15px rgba(59,130,246,0.35)",
              }}
            >
              {editingItem ? "💾 Lưu thay đổi" : "🚀 Tạo hội đồng"}
            </Button>
          </Box>
        </form>
      </Dialog>
    </Container>
  );
};

export default CouncilManagement;
