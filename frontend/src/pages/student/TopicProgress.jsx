import React, { useState, useEffect, useCallback } from "react";
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
  Chip,
  Stack,
  Avatar,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  EmojiEvents as TrophyIcon,
  ArrowBack as ArrowBackIcon,
  Flag as FlagIcon,
  Assignment as TopicIcon,
  SpeakerNotes as NoteIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const TopicProgress = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Milestone Update States
  const [openMilestoneDialog, setOpenMilestoneDialog] = useState(false);
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(null);
  const [milestoneNotes, setMilestoneNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchTopicsProgress = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/student/topics-progress");
      const fetchedTopics = response.data.data || [];
      setTopics(fetchedTopics);

      // Select the first topic by default or keep current selection if valid
      if (fetchedTopics.length > 0) {
        setSelectedTopic((prev) => {
          if (!prev) return fetchedTopics[0];
          const updated = fetchedTopics.find((t) => t._id === prev._id);
          return updated || fetchedTopics[0];
        });
      }
    } catch (error) {
      console.error("Fetch topics progress error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải tiến độ đề tài",
      );
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopicsProgress();
  }, [fetchTopicsProgress]);

  const handleOpenMilestoneDialog = (index) => {
    setCurrentMilestoneIndex(index);
    setMilestoneNotes(selectedTopic.milestones[index]?.notes || "");
    setSelectedFile(null);
    setOpenMilestoneDialog(true);
  };

  const handleCloseMilestoneDialog = () => {
    setOpenMilestoneDialog(false);
    setCurrentMilestoneIndex(null);
    setMilestoneNotes("");
    setSelectedFile(null);
  };

  const handleConfirmMilestoneUpdate = async () => {
    try {
      if (!selectedTopic || currentMilestoneIndex === null) return;

      const formData = new FormData();
      formData.append(
        "notes",
        milestoneNotes || "Cập nhật tiến độ hoàn thành mốc thời gian",
      );

      if (selectedFile) {
        formData.append("report", selectedFile);
      }

      setUploading(true);
      let endpointURL = `/api/student/topics/${selectedTopic._id}/milestones/${currentMilestoneIndex}`;
      let axiosMethod = axios.put;

      // Ensure the endpoint logic matches Backend expectation for uploading attachments.
      // Based on previous search, the regular PUT endpoint for milestones handles files if uploaded via multipart/form-data.

      const response = await axiosMethod(endpointURL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Đã nộp bài cho mốc thời gian này! 🎉");
        handleCloseMilestoneDialog();
        fetchTopicsProgress();
      }
    } catch (error) {
      console.error("Update milestone error:", error);
      toast.error(error.response?.data?.message || "Không thể nộp bài");
    } finally {
      setUploading(false);
    }
  };

  const getMilestoneStatus = (milestone) => {
    if (!milestone) return "pending";
    const now = new Date();
    const dueDate = milestone.due_date ? new Date(milestone.due_date) : null;

    if (milestone.status === "completed" || milestone.completed)
      return "completed";
    if (dueDate && now > dueDate) return "overdue";
    return "in_progress";
  };

  // Safe color access
  const primaryMain = theme.palette?.primary?.main || "#1976d2";
  const successMain = theme.palette?.success?.main || "#2e7d32";
  const errorMain = theme.palette?.error?.main || "#d32f2f";
  const infoMain = theme.palette?.info?.main || "#0288d1";
  const warningMain = theme.palette?.warning?.main || "#ed6c02";

  const getProgressColor = (progress) => {
    if (progress >= 100) return successMain;
    if (progress >= 50) return primaryMain;
    return warningMain;
  };

  const glassCardSx = {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.04)",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  };

  const headerGradientSx = {
    background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
    pt: 6,
    pb: 12,
    color: "white",
    borderRadius: { xs: 0, md: "0 0 32px 32px" },
    boxShadow: "0 10px 30px -10px rgba(37, 99, 235, 0.4)",
    mb: -6,
    position: "relative",
    zIndex: 0,
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4, px: 4 }}>
        <LinearProgress sx={{ borderRadius: 8, height: 8 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 10 }}>
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
            Lộ trình dự án 🚀
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, fontWeight: 400, maxWidth: "600px" }}
          >
            Theo dõi sát sao từng cột mốc để đảm bảo đồ án về đích đúng hạn.
          </Typography>
        </Container>
      </Box>

      <Container
        maxWidth="xl"
        sx={{ position: "relative", zIndex: 1, px: { xs: 2, md: 4 } }}
      >
        {topics.length === 0 ? (
          <Paper
            sx={{
              p: 10,
              textAlign: "center",
              borderRadius: "24px",
              bgcolor: "#fff",
              border: "2px dashed #E2E8F0",
            }}
            elevation={0}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#94A3B8" }}>
              Bạn chưa tham gia đề tài nào để theo dõi tiến độ
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/student/topics")}
              sx={{
                mt: 4,
                borderRadius: "12px",
                px: 4,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Tìm đề tài ngay
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {/* Left Sidebar: Topic Selector */}
            <Grid item xs={12} lg={4}>
              <Typography
                variant="h6"
                sx={{ mb: 3, fontWeight: 800, color: "#475569", px: 1 }}
              >
                Danh sách đề tài ({topics.length})
              </Typography>
              <Stack spacing={2}>
                {topics.map((topic) => (
                  <Card
                    key={topic._id}
                    onClick={() => setSelectedTopic(topic)}
                    sx={{
                      ...glassCardSx,
                      cursor: "pointer",
                      borderWidth: "2px",
                      borderColor:
                        selectedTopic?._id === topic._id
                          ? primaryMain
                          : "transparent",
                      bgcolor:
                        selectedTopic?._id === topic._id
                          ? "#fff"
                          : alpha("#ffffff", 0.6),
                      "&:hover": {
                        transform: "translateX(8px)",
                        bgcolor: "#fff",
                      },
                    }}
                    elevation={0}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 800,
                          mb: 2,
                          color:
                            selectedTopic?._id === topic._id
                              ? primaryMain
                              : "#1E293B",
                        }}
                      >
                        {topic.topic_title}
                      </Typography>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={topic.progress || 0}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(primaryMain, 0.1),
                            }}
                          />
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 900,
                            color: getProgressColor(topic.progress || 0),
                          }}
                        >
                          {topic.progress || 0}%
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Grid>

            {/* Right Side: Detailed Timeline */}
            <Grid item xs={12} lg={8}>
              {selectedTopic && (
                <Box>
                  {/* Topic Title Summary Card */}
                  <Card
                    sx={{
                      ...glassCardSx,
                      mb: 4,
                      bgcolor: primaryMain,
                      color: "#fff",
                    }}
                    elevation={10}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <TrophyIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 900, mb: 1 }}
                          >
                            {selectedTopic.topic_title}
                          </Typography>
                          <Stack direction="row" spacing={3}>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.8, display: "block" }}
                              >
                                Tiến độ tổng
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                                {selectedTopic.progress || 0}%
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.8, display: "block" }}
                              >
                                Dự kiến hoàn thành
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {selectedTopic.expected_completion_date
                                  ? new Date(
                                      selectedTopic.expected_completion_date,
                                    ).toLocaleDateString("vi-VN")
                                  : "Đang cập nhật"}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Timeline Title */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 4,
                      px: 2,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 900, color: "#1E293B" }}
                    >
                      Các mốc quan trọng ⏳
                    </Typography>
                    <Chip
                      label={`${selectedTopic.milestones?.length || 0} Giai đoạn`}
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  {/* Vertical Timeline */}
                  {selectedTopic.milestones &&
                  selectedTopic.milestones.length > 0 ? (
                    <Box sx={{ px: { xs: 0, sm: 4 } }}>
                      {selectedTopic.milestones.map((milestone, index) => {
                        const status = getMilestoneStatus(milestone);
                        const isLast =
                          index === selectedTopic.milestones.length - 1;

                        return (
                          <Box
                            key={index}
                            sx={{ display: "flex", position: "relative" }}
                          >
                            {/* Left Line & Icon */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                mr: 4,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: "18px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow:
                                    status === "completed"
                                      ? `0 8px 20px ${alpha(successMain, 0.4)}`
                                      : status === "overdue"
                                        ? `0 8px 20px ${alpha(errorMain, 0.4)}`
                                        : `0 8px 20px ${alpha(infoMain, 0.4)}`,
                                  bgcolor:
                                    status === "completed"
                                      ? successMain
                                      : status === "overdue"
                                        ? errorMain
                                        : infoMain,
                                  color: "#fff",
                                  zIndex: 2,
                                  transition: "0.3s",
                                }}
                              >
                                {status === "completed" ? (
                                  <CheckCircleIcon />
                                ) : status === "overdue" ? (
                                  <WarningIcon />
                                ) : (
                                  <ScheduleIcon />
                                )}
                              </Box>
                              {!isLast && (
                                <Box
                                  sx={{
                                    width: 4,
                                    flexGrow: 1,
                                    bgcolor:
                                      status === "completed"
                                        ? successMain
                                        : "#E2E8F0",
                                    opacity: status === "completed" ? 0.6 : 1,
                                    my: 1,
                                    borderRadius: "4px",
                                  }}
                                />
                              )}
                            </Box>

                            {/* Content Card */}
                            <Box sx={{ flexGrow: 1, pb: isLast ? 0 : 6 }}>
                              <Card
                                sx={{
                                  ...glassCardSx,
                                  p: 1,
                                  borderLeft: `6px solid ${
                                    status === "completed"
                                      ? successMain
                                      : status === "overdue"
                                        ? errorMain
                                        : infoMain
                                  }`,
                                  "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
                                  },
                                }}
                                elevation={0}
                              >
                                <CardContent sx={{ p: 3 }}>
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                    sx={{ mb: 2 }}
                                  >
                                    <Box>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          fontWeight: 900,
                                          color: "#1E293B",
                                        }}
                                      >
                                        {milestone.name}
                                      </Typography>
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        sx={{ mt: 0.5 }}
                                      >
                                        <ScheduleIcon
                                          sx={{
                                            fontSize: 14,
                                            color: "#94A3B8",
                                          }}
                                        />
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontWeight: 700,
                                            color:
                                              status === "overdue"
                                                ? errorMain
                                                : "#94A3B8",
                                          }}
                                        >
                                          Hạn chót:{" "}
                                          {new Date(
                                            milestone.due_date,
                                          ).toLocaleDateString("vi-VN")}
                                        </Typography>
                                      </Stack>
                                    </Box>
                                    <Chip
                                      label={
                                        status === "completed"
                                          ? "Đã xong"
                                          : status === "overdue"
                                            ? "Quá hạn"
                                            : "Đang làm"
                                      }
                                      size="small"
                                      sx={{
                                        fontWeight: 800,
                                        bgcolor:
                                          status === "completed"
                                            ? alpha(successMain, 0.1)
                                            : status === "overdue"
                                              ? alpha(errorMain, 0.1)
                                              : alpha(infoMain, 0.1),
                                        color:
                                          status === "completed"
                                            ? successMain
                                            : status === "overdue"
                                              ? errorMain
                                              : infoMain,
                                      }}
                                    />
                                  </Stack>

                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#64748B",
                                      mb: 3,
                                      lineHeight: 1.6,
                                    }}
                                  >
                                    {milestone.description}
                                  </Typography>
                                  {milestone.notes && (
                                    <Paper
                                      elevation={0}
                                      sx={{
                                        p: 1.5,
                                        mt: 1.5,
                                        bgcolor: alpha(
                                          theme.palette.info.light,
                                          0.1,
                                        ),
                                        borderRadius: "8px",
                                        borderLeft: `3px solid ${theme.palette.info.main}`,
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 700,
                                          display: "block",
                                          color: theme.palette.info.main,
                                          mb: 0.5,
                                        }}
                                      >
                                        Ghi chú đã nộp:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        {milestone.notes}
                                      </Typography>
                                    </Paper>
                                  )}

                                  {/* Update Status Actions (All Milestones) */}
                                  {status !== "completed" && (
                                    <Stack spacing={2} sx={{ mb: 2 }}>
                                      <Button
                                        size="large"
                                        variant="contained"
                                        fullWidth
                                        onClick={() =>
                                          handleOpenMilestoneDialog(index)
                                        }
                                        startIcon={<UploadIcon />}
                                        sx={{
                                          borderRadius: "14px",
                                          py: 1.5,
                                          fontWeight: 800,
                                          boxShadow:
                                            "0 8px 24px rgba(15, 98, 254, 0.2)",
                                          textTransform: "none",
                                        }}
                                      >
                                        Nộp bài & Xác nhận hoàn thành
                                      </Button>
                                    </Stack>
                                  )}

                                  {/* Re-Submit (If completed and no explicit report button needed) */}
                                  {status === "completed" &&
                                    !(
                                      isLast ||
                                      (milestone.name || "")
                                        .toLowerCase()
                                        .includes("báo cáo")
                                    ) && (
                                      <Stack spacing={2} sx={{ mb: 2 }}>
                                        <Button
                                          size="medium"
                                          variant="outlined"
                                          fullWidth
                                          onClick={() =>
                                            handleOpenMilestoneDialog(index)
                                          }
                                          startIcon={<UploadIcon />}
                                          sx={{
                                            borderRadius: "14px",
                                            py: 1,
                                            fontWeight: 700,
                                            textTransform: "none",
                                          }}
                                        >
                                          Nộp lại tệp / Cập nhật ghi chú
                                        </Button>
                                      </Stack>
                                    )}

                                  {/* Update Final Report Button - Keeping explicit for clarity on final step */}
                                  {((milestone.name || "")
                                    .toLowerCase()
                                    .includes("báo cáo") ||
                                    isLast) && (
                                    <Stack spacing={2} sx={{ mt: 2 }}>
                                      <Button
                                        size="large"
                                        variant={
                                          status === "completed"
                                            ? "outlined"
                                            : "contained"
                                        }
                                        fullWidth
                                        disabled={uploading}
                                        onClick={() =>
                                          handleOpenMilestoneDialog(index)
                                        }
                                        startIcon={<UploadIcon />}
                                        sx={{
                                          borderRadius: "14px",
                                          py: 1.5,
                                          fontWeight: 800,
                                          boxShadow:
                                            status !== "completed"
                                              ? "0 8px 16px rgba(15, 98, 254, 0.15)"
                                              : "none",
                                          textTransform: "none",
                                        }}
                                      >
                                        {status === "completed"
                                          ? "Nộp lại báo cáo cuối kỳ"
                                          : "Nộp báo cáo cuối kỳ"}
                                      </Button>
                                    </Stack>
                                  )}

                                  {/* Download Link if attachments exist (either milestone attachments or topic_final_report) */}
                                  {(milestone.attachments?.length > 0 ||
                                    (((milestone.name || "")
                                      .toLowerCase()
                                      .includes("báo cáo") ||
                                      isLast) &&
                                      selectedTopic.topic_final_report)) && (
                                    <Box sx={{ mt: 3 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 700,
                                          color: "#94A3B8",
                                          display: "block",
                                          mb: 1,
                                        }}
                                      >
                                        Tệp đính kèm:
                                      </Typography>
                                      {milestone.attachments?.length > 0 ? (
                                        milestone.attachments.map(
                                          (att, idx) => (
                                            <Button
                                              key={idx}
                                              size="small"
                                              variant="outlined"
                                              href={`http://localhost:5000${att}`}
                                              target="_blank"
                                              startIcon={<UploadIcon />}
                                              sx={{
                                                borderRadius: "10px",
                                                textTransform: "none",
                                                mb: 1,
                                                mr: 1,
                                              }}
                                            >
                                              Xem báo cáo đã nộp
                                            </Button>
                                          ),
                                        )
                                      ) : (
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          href={`http://localhost:5000${selectedTopic.topic_final_report}`}
                                          target="_blank"
                                          startIcon={<UploadIcon />}
                                          sx={{
                                            borderRadius: "10px",
                                            textTransform: "none",
                                            mb: 1,
                                          }}
                                        >
                                          Xem báo cáo đã nộp
                                        </Button>
                                      )}
                                    </Box>
                                  )}
                                </CardContent>
                              </Card>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Paper
                      sx={{
                        p: 6,
                        textAlign: "center",
                        borderRadius: "32px",
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        border: "1px dashed #E2E8F0",
                      }}
                    >
                      <TopicIcon
                        sx={{ fontSize: 60, color: "#CBD5E1", mb: 2 }}
                      />
                      <Typography
                        variant="body1"
                        sx={{ color: "#64748B", fontWeight: 500 }}
                      >
                        Đề tài này hiện chưa có mốc thời gian nào được cập nhật.
                      </Typography>
                    </Paper>
                  )}

                  {/* Notes from Teacher */}
                  {selectedTopic.notes && (
                    <Box sx={{ mt: 6 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 3 }}
                      >
                        <NoteIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                          Lời nhắn từ Giảng viên
                        </Typography>
                      </Stack>
                      <Paper
                        sx={{
                          p: 4,
                          borderRadius: "24px",
                          bgcolor: "#fff",
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#475569",
                            fontStyle: "italic",
                            lineHeight: 1.8,
                          }}
                        >
                          "{selectedTopic.notes}"
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Update Milestone Dialog */}
      <Dialog
        open={openMilestoneDialog}
        onClose={handleCloseMilestoneDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: { borderRadius: "16px" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Tóm Tắt Công Việc Giai Đoạn
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Vui lòng đính kèm tệp tài liệu (Zip, PDF, Word...) và viết ngắn
              gọn những công việc bạn hoặc nhóm đã hoàn thành trong giai đoạn
              này để báo cáo với Giảng viên.
            </Typography>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Tệp đính kèm (Tuỳ chọn)
              </Typography>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<UploadIcon />}
                sx={{ p: 2, borderStyle: "dashed", borderRadius: "12px" }}
              >
                {selectedFile
                  ? selectedFile.name
                  : "Nhấp để chọn tệp tải lên (Tối đa 20MB)"}
                <input
                  type="file"
                  hidden
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </Button>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Ghi chú hoàn thành"
              placeholder="VD: Nhóm đã làm xong chức năng đăng nhập, đăng ký và đính kèm source code..."
              value={milestoneNotes}
              onChange={(e) => setMilestoneNotes(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseMilestoneDialog} disabled={uploading}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirmMilestoneUpdate}
            variant="contained"
            disabled={uploading}
            sx={{ borderRadius: "8px", px: 3, fontWeight: "bold" }}
          >
            {uploading ? "Đang xử lý..." : "Nộp Tiến Độ"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TopicProgress;
