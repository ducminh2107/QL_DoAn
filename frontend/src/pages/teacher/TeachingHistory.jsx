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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Divider,
  Avatar,
  Tooltip,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Assignment as AssignIcon,
  CheckCircle as DoneIcon,
  HourglassEmpty as OngoingIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  CalendarToday as CalIcon,
  Person as PersonIcon,
  Category as CatIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const getScoreColor = (score) => {
  if (score === null || score === undefined) return "#94a3b8";
  if (score >= 8) return "#10b981";
  if (score >= 6) return "#f59e0b";
  return "#ef4444";
};

const getScoreBg = (score) => {
  if (score === null || score === undefined) return "#f1f5f9";
  if (score >= 8) return "#f0fdf4";
  if (score >= 6) return "#fffbeb";
  return "#fef2f2";
};

const TeachingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchTeachingHistory();
  }, []);

  const fetchTeachingHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/teacher/teaching-history");
      setHistory(response.data.data || []);
    } catch (error) {
      console.error("Fetch teaching history error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải lịch sử giảng dạy",
      );
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecord(null);
  };

  const handleDownloadCertificate = async (recordId, topicTitle) => {
    try {
      setDownloading(recordId);
      const response = await axios.get(
        `/api/teacher/teaching-history/${recordId}/certificate`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `giaychungnhan_${topicTitle?.slice(0, 20) || recordId}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Đã tải giấy xác nhận thành công");
    } catch {
      toast.error("Lỗi tải giấy xác nhận hướng dẫn");
    } finally {
      setDownloading(null);
    }
  };

  const getStatusInfo = (status) => ({
    label:
      { ongoing: "Đang Diễn Ra", completed: "Hoàn Thành", archived: "Lưu Trữ" }[
        status
      ] || status,
    color:
      { ongoing: "info", completed: "success", archived: "default" }[status] ||
      "default",
    icon:
      status === "completed" ? (
        <DoneIcon sx={{ fontSize: 14 }} />
      ) : (
        <OngoingIcon sx={{ fontSize: 14 }} />
      ),
  });

  // Filter & search
  const filtered = history.filter((rec) => {
    const q = search.toLowerCase();
    const matchSearch =
      rec.topic_title?.toLowerCase().includes(q) ||
      rec.student_name?.toLowerCase().includes(q) ||
      rec.academic_year?.toLowerCase().includes(q) ||
      rec.category?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || rec.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalTopics = history.length;
  const completed = history.filter((h) => h.status === "completed").length;
  const ongoing = history.filter((h) => h.status === "ongoing").length;
  const totalStudents = history.reduce(
    (s, h) => s + (h.students_count || 0),
    0,
  );
  const scoredItems = history.filter(
    (h) => h.average_score !== null && h.average_score !== undefined,
  );
  const avgScore = scoredItems.length
    ? scoredItems.reduce((s, h) => s + (h.average_score || 0), 0) /
      scoredItems.length
    : null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
          borderRadius: 3,
          color: "white",
          boxShadow: "0 10px 30px rgba(37, 99, 235, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <HistoryIcon sx={{ fontSize: 32 }} />
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
            >
              Lịch Sử Giảng Dạy
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Hồ sơ toàn bộ đề tài đã và đang hướng dẫn sinh viên
          </Typography>
        </Box>
        <Tooltip title="Làm mới">
          <IconButton
            onClick={fetchTeachingHistory}
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

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Tổng Đề Tài",
            value: totalTopics,
            icon: <AssignIcon />,
            color: "#2563eb",
            bg: "#eff6ff",
          },
          {
            label: "Đang Hướng Dẫn",
            value: ongoing,
            icon: <OngoingIcon />,
            color: "#f59e0b",
            bg: "#fffbeb",
          },
          {
            label: "Đã Hoàn Thành",
            value: completed,
            icon: <DoneIcon />,
            color: "#10b981",
            bg: "#f0fdf4",
          },
          {
            label: "Tổng Sinh Viên",
            value: totalStudents,
            icon: <SchoolIcon />,
            color: "#8b5cf6",
            bg: "#f5f3ff",
          },
          {
            label: "Điểm TB",
            value: avgScore !== null ? `${avgScore.toFixed(1)}/10` : "—",
            icon: <GradeIcon />,
            color: getScoreColor(avgScore),
            bg: getScoreBg(avgScore),
          },
        ].map((stat) => (
          <Grid item xs={12} sm={6} md key={stat.label}>
            <Card
              elevation={0}
              sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5 }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  "&:last-child": { pb: 2 },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: stat.bg,
                    color: stat.color,
                    width: 44,
                    height: 44,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: stat.color, lineHeight: 1 }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stat.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter toolbar */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: "1px solid #e2e8f0", borderRadius: 2.5 }}
      >
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Tìm theo tên đề tài, sinh viên, học kỳ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
          <ToggleButtonGroup
            value={filterStatus}
            exclusive
            onChange={(_, v) => v && setFilterStatus(v)}
            size="small"
          >
            <ToggleButton value="all">Tất cả ({history.length})</ToggleButton>
            <ToggleButton value="ongoing">Đang dạy ({ongoing})</ToggleButton>
            <ToggleButton value="completed">
              Hoàn thành ({completed})
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Table */}
      {loading ? (
        <LinearProgress />
      ) : filtered.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
          }}
        >
          <HistoryIcon sx={{ fontSize: 72, color: "#cbd5e1", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#64748b" }}>
            {search || filterStatus !== "all"
              ? "Không tìm thấy kết quả phù hợp"
              : "Chưa có lịch sử giảng dạy"}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Dữ liệu sẽ xuất hiện khi bạn có đề tài được phân công
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Đề Tài
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Sinh Viên
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Năm Học / HK
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#1e293b" }}
                    align="center"
                  >
                    Điểm
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#1e293b" }}
                    align="center"
                  >
                    Trạng Thái
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#1e293b" }}
                    align="right"
                  >
                    Hành Động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((record) => {
                  const status = getStatusInfo(record.status);
                  return (
                    <TableRow key={record._id} hover>
                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#1e293b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {record.topic_title}
                        </Typography>
                        {record.category && (
                          <Chip
                            label={record.category}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5, fontSize: 11 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {record.student_name || "—"}
                        </Typography>
                        {record.student_id && (
                          <Typography variant="caption" color="textSecondary">
                            {record.student_id}
                          </Typography>
                        )}
                        {record.students_count > 0 && (
                          <Chip
                            label={`${record.students_count} SV`}
                            size="small"
                            sx={{ fontSize: 11, ml: 0.5, bgcolor: "#f1f5f9" }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.academic_year || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {record.average_score !== null &&
                        record.average_score !== undefined ? (
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              bgcolor: getScoreBg(record.average_score),
                              color: getScoreColor(record.average_score),
                              fontWeight: 800,
                              fontSize: 15,
                            }}
                          >
                            {record.average_score.toFixed(1)}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={status.icon}
                          label={status.label}
                          color={status.color}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" gap={0.5} justifyContent="flex-end">
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetail(record)}
                              sx={{ color: "#2563eb" }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {record.status === "completed" && (
                            <Tooltip title="Tải giấy xác nhận hướng dẫn">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDownloadCertificate(
                                    record._id,
                                    record.topic_title,
                                  )
                                }
                                disabled={downloading === record._id}
                                sx={{ color: "#10b981" }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <Typography variant="caption" color="textSecondary">
              Hiển thị {filtered.length} / {history.length} đề tài
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#1e3a8a",
            color: "white",
            py: 2.5,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AssignIcon />
          Chi Tiết Lịch Sử Giảng Dạy
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {selectedRecord && (
            <Box>
              {/* Score bar at top */}
              {selectedRecord.average_score !== null &&
                selectedRecord.average_score !== undefined && (
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: getScoreBg(selectedRecord.average_score),
                      borderBottom: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        bgcolor: "white",
                        border: `3px solid ${getScoreColor(selectedRecord.average_score)}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: getScoreColor(selectedRecord.average_score),
                          lineHeight: 1,
                        }}
                      >
                        {selectedRecord.average_score.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        /10
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: getScoreColor(selectedRecord.average_score),
                        }}
                      >
                        {selectedRecord.average_score >= 8
                          ? "Xuất sắc / Giỏi"
                          : selectedRecord.average_score >= 6
                            ? "Khá"
                            : "Trung bình"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Điểm số đề tài
                      </Typography>
                    </Box>
                  </Box>
                )}

              {/* Info rows */}
              {[
                {
                  icon: <AssignIcon sx={{ color: "#2563eb", fontSize: 20 }} />,
                  label: "Tên Đề Tài",
                  value: selectedRecord.topic_title,
                  bold: true,
                },
                {
                  icon: <PersonIcon sx={{ color: "#8b5cf6", fontSize: 20 }} />,
                  label: "Sinh Viên",
                  value: `${selectedRecord.student_name || "—"}${selectedRecord.student_id ? ` (${selectedRecord.student_id})` : ""}`,
                },
                {
                  icon: <CalIcon sx={{ color: "#10b981", fontSize: 20 }} />,
                  label: "Năm Học / HK",
                  value: selectedRecord.academic_year || "Chưa xác định",
                },
                selectedRecord.category
                  ? {
                      icon: <CatIcon sx={{ color: "#f59e0b", fontSize: 20 }} />,
                      label: "Danh Mục",
                      value: selectedRecord.category,
                    }
                  : null,
              ]
                .filter(Boolean)
                .map((row) => (
                  <Box
                    key={row.label}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      px: 3,
                      py: 1.8,
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <Box sx={{ mt: 0.2 }}>{row.icon}</Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {row.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: row.bold ? 700 : 500,
                          color: "#1e293b",
                        }}
                      >
                        {row.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}

              {/* Status */}
              <Box sx={{ px: 3, py: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Trạng Thái
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {(() => {
                    const s = getStatusInfo(selectedRecord.status);
                    return (
                      <Chip
                        icon={s.icon}
                        label={s.label}
                        color={s.color}
                        sx={{ fontWeight: 600 }}
                      />
                    );
                  })()}
                </Box>
              </Box>

              {/* Download button if completed */}
              {selectedRecord.status === "completed" && (
                <Box sx={{ px: 3, pb: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Button
                    fullWidth
                    variant="outlined"
                    color="success"
                    startIcon={<DownloadIcon />}
                    onClick={() =>
                      handleDownloadCertificate(
                        selectedRecord._id,
                        selectedRecord.topic_title,
                      )
                    }
                    disabled={downloading === selectedRecord._id}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  >
                    {downloading === selectedRecord._id
                      ? "Đang tải..."
                      : "Tải Giấy Xác Nhận Hướng Dẫn (PDF)"}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeachingHistory;
