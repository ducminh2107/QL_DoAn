import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const GuidedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);

  useEffect(() => {
    loadGuidedStudents();
  }, []);

  const loadGuidedStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/teacher/students/guided", {
        headers: { "Cache-Control": "no-cache" },
      });
      console.log("Guided students:", response.data.data);
      setStudents(response.data.data || []);
    } catch (error) {
      console.error("Failed to load guided students:", error);
      toast.error("Không thể tải danh sách sinh viên");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setDetailDialog(true);
  };

  const handleCloseDialog = () => {
    setDetailDialog(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          👨‍🎓 Sinh Viên Hướng Dẫn
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên, email hoặc mã sinh viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Empty State */}
      {filteredStudents.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <SchoolIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchTerm
              ? "Không tìm thấy sinh viên phù hợp"
              : "Chưa có sinh viên nào được giao"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sinh viên sẽ hiển thị ở đây khi được giao từ các đề tài của bạn
          </Typography>
        </Box>
      )}

      {/* Students Grid */}
      <Grid container spacing={3}>
        {filteredStudents.map((student) => (
          <Grid item xs={12} sm={6} md={4} key={student._id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Student Avatar and Basic Info */}
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 56,
                      height: 56,
                      fontSize: "1.5rem",
                    }}
                  >
                    {student.user_name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {student.user_name || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {student.user_id || "N/A"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Contact Info */}
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                      {student.email || "N/A"}
                    </Typography>
                  </Box>

                  {student.user_phone && (
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {student.user_phone}
                      </Typography>
                    </Box>
                  )}

                  {student.user_department && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {student.user_department}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Status */}
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={student.user_status ? "Hoạt động" : "Vô hiệu"}
                    size="small"
                    color={student.user_status ? "success" : "error"}
                  />
                </Box>
              </CardContent>

              {/* Actions */}
              <CardActions>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleViewDetails(student)}
                >
                  Chi tiết
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi Tiết Sinh Viên</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ pt: 2 }}>
              <Box display="flex" justifyContent="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 80,
                    height: 80,
                    fontSize: "2rem",
                  }}
                >
                  {selectedStudent.user_name?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Box>

              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                {selectedStudent.user_name}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mã Sinh Viên
                </Typography>
                <Typography variant="body2">
                  {selectedStudent.user_id}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body2">{selectedStudent.email}</Typography>
              </Box>

              {selectedStudent.user_phone && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Điện Thoại
                  </Typography>
                  <Typography variant="body2">
                    {selectedStudent.user_phone}
                  </Typography>
                </Box>
              )}

              {selectedStudent.user_department && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Khoa
                  </Typography>
                  <Typography variant="body2">
                    {selectedStudent.user_department}
                  </Typography>
                </Box>
              )}

              {selectedStudent.user_faculty && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Khối
                  </Typography>
                  <Typography variant="body2">
                    {selectedStudent.user_faculty}
                  </Typography>
                </Box>
              )}

              {selectedStudent.user_major && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Chuyên Ngành
                  </Typography>
                  <Typography variant="body2">
                    {selectedStudent.user_major}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trạng Thái
                </Typography>
                <Chip
                  label={selectedStudent.user_status ? "Hoạt động" : "Vô hiệu"}
                  color={selectedStudent.user_status ? "success" : "error"}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GuidedStudents;
