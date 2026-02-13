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
  Chip,
  Stack,
  Avatar,
  Divider,
  useTheme,
  alpha,
  Tooltip,
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

  useEffect(() => {
    fetchTopicsProgress();
  }, []);

  const fetchTopicsProgress = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/student/topics-progress");
      const fetchedTopics = response.data.data || [];
      setTopics(fetchedTopics);

      // Select the first topic by default or keep current selection if valid
      if (fetchedTopics.length > 0) {
        if (
          !selectedTopic ||
          !fetchedTopics.find((t) => t._id === selectedTopic._id)
        ) {
          setSelectedTopic(fetchedTopics[0]);
        } else {
          const updated = fetchedTopics.find(
            (t) => t._id === selectedTopic._id,
          );
          setSelectedTopic(updated);
        }
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
  };

  const handleUpdateMilestone = async (milestoneIndex) => {
    try {
      if (!selectedTopic) return;

      const response = await axios.put(
        `/api/student/topics/${selectedTopic._id}/milestones/${milestoneIndex}`,
        {
          notes: "Cập nhật tiến độ hoàn thành mốc thời gian",
        },
      );

      if (response.data.success) {
        toast.success("Đã hoàn thành mốc thời gian này! 🎉");
        fetchTopicsProgress();
      }
    } catch (error) {
      console.error("Update milestone error:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật tiến độ",
      );
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return theme.palette.success.main;
    if (progress >= 50) return theme.palette.primary.main;
    return theme.palette.warning.main;
  };

  const getMilestoneStatus = (milestone) => {
    const now = new Date();
    const dueDate = new Date(milestone.due_date);

    if (milestone.status === "completed" || milestone.completed)
      return "completed";
    if (now > dueDate) return "overdue";
    return "in_progress";
  };

  const glassCardSx = {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: "28px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.04)",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
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
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ py: 6 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: theme.palette.primary.main,
                borderRadius: "16px",
                color: "#fff",
              }}
            >
              <FlagIcon />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "#1E293B",
                letterSpacing: "-0.04em",
              }}
            >
              Lộ trình dự án ✨
            </Typography>
          </Stack>
          <Typography
            variant="h6"
            sx={{ color: "#64748B", fontWeight: 400, ml: 8 }}
          >
            Theo dõi sát sao từng cột mốc để đảm bảo đồ án về đích đúng hạn.
          </Typography>
        </Box>

        {topics.length === 0 ? (
          <Paper
            sx={{
              p: 10,
              textAlign: "center",
              borderRadius: "40px",
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
              sx={{ mt: 4, borderRadius: "12px", px: 4 }}
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
                          ? theme.palette.primary.main
                          : "transparent",
                      bgcolor:
                        selectedTopic?._id === topic._id
                          ? "#fff"
                          : alpha("#fff", 0.6),
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
                              ? theme.palette.primary.main
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
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
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
                      bgcolor: theme.palette.primary.main,
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
                                      ? `0 8px 20px ${alpha(theme.palette.success.main, 0.4)}`
                                      : status === "overdue"
                                        ? `0 8px 20px ${alpha(theme.palette.error.main, 0.4)}`
                                        : `0 8px 20px ${alpha(theme.palette.info.main, 0.4)}`,
                                  bgcolor:
                                    status === "completed"
                                      ? theme.palette.success.main
                                      : status === "overdue"
                                        ? theme.palette.error.main
                                        : theme.palette.info.main,
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
                                        ? theme.palette.success.main
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
                                      ? theme.palette.success.main
                                      : status === "overdue"
                                        ? theme.palette.error.main
                                        : theme.palette.info.main
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
                                                ? theme.palette.error.main
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
                                            ? alpha(
                                                theme.palette.success.main,
                                                0.1,
                                              )
                                            : status === "overdue"
                                              ? alpha(
                                                  theme.palette.error.main,
                                                  0.1,
                                                )
                                              : alpha(
                                                  theme.palette.info.main,
                                                  0.1,
                                                ),
                                        color:
                                          status === "completed"
                                            ? theme.palette.success.main
                                            : status === "overdue"
                                              ? theme.palette.error.main
                                              : theme.palette.info.main,
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

                                  {status !== "completed" && (
                                    <Button
                                      size="large"
                                      variant="contained"
                                      fullWidth
                                      onClick={() =>
                                        handleUpdateMilestone(index)
                                      }
                                      startIcon={<CheckCircleIcon />}
                                      sx={{
                                        borderRadius: "14px",
                                        py: 1.5,
                                        fontWeight: 800,
                                        boxShadow:
                                          "0 8px 24px rgba(15, 98, 254, 0.2)",
                                        textTransform: "none",
                                      }}
                                    >
                                      Đã hoàn thành mốc này
                                    </Button>
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
    </Box>
  );
};

export default TopicProgress;
