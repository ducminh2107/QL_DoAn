import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  LinearProgress,
  Alert,
  Divider,
  Tab,
  Tabs,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const TopicApprovals = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [approvalDialog, setApprovalDialog] = useState({
    open: false,
    topic: null,
    action: "approve",
    feedback: "",
  });

  useEffect(() => {
    loadPendingTopics();
  }, []);

  const loadPendingTopics = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/teacher/topics/pending-approval");
      setTopics(response.data.data || []);
    } catch (error) {
      console.error("Failed to load pending topics:", error);
      toast.error("Không thể tải danh sách đề tài chờ duyệt");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTopic = async () => {
    try {
      const { topic, action, feedback } = approvalDialog;

      await axios.put(`/api/teacher/topics/${topic._id}/approve`, {
        status:
          action === "approve"
            ? "approved"
            : action === "reject"
              ? "rejected"
              : "need_revision",
        feedback,
      });

      toast.success(
        `Đã ${action === "approve" ? "duyệt" : action === "reject" ? "từ chối" : "yêu cầu sửa"} đề tài`
      );
      setApprovalDialog({
        open: false,
        topic: null,
        action: "approve",
        feedback: "",
      });
      loadPendingTopics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xử lý thất bại");
    }
  };

  const getStatusDisplay = (topic) => {
    if (topic.topic_teacher_status === "approved") {
      return (
        <Chip icon={<CheckCircleIcon />} label="Đã duyệt" color="success" />
      );
    }
    if (topic.topic_teacher_status === "rejected") {
      return <Chip icon={<CancelIcon />} label="Từ chối" color="error" />;
    }
    if (topic.topic_teacher_status === "need_revision") {
      return <Chip icon={<EditIcon />} label="Cần sửa" color="warning" />;
    }
    return <Chip icon={<PendingIcon />} label="Chờ duyệt" color="default" />;
  };

  const filteredTopics = topics.filter((topic) => {
    if (tabValue === 0) return topic.topic_teacher_status === "pending";
    if (tabValue === 1) return topic.topic_teacher_status === "need_revision";
    return true;
  });

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          ⏳ Duyệt đề tài sinh viên
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {topics.length} đề tài chờ xử lý
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          centered
        >
          <Tab label="Chờ duyệt" />
          <Tab label="Cần chỉnh sửa" />
          <Tab label="Tất cả" />
        </Tabs>
      </Paper>

      {/* Topics List */}
      {filteredTopics.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CheckCircleIcon
            sx={{ fontSize: 60, color: "success.main", mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            Không có đề tài nào{" "}
            {tabValue === 0
              ? "chờ duyệt"
              : tabValue === 1
                ? "cần chỉnh sửa"
                : ""}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tất cả đề tài đã được xử lý
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredTopics.map((topic) => (
            <Grid item xs={12} key={topic._id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {topic.topic_title}
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                            <Chip
                              label={topic.topic_category?.topic_category_title}
                              size="small"
                            />
                            <Chip
                              icon={<GroupIcon />}
                              label={`${topic.topic_group_student?.length || 0}/${topic.topic_max_members}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        {getStatusDisplay(topic)}
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {topic.topic_description.length > 300
                          ? `${topic.topic_description.substring(0, 300)}...`
                          : topic.topic_description}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Thông tin sinh viên:
                      </Typography>
                      <Typography variant="body2">
                        <strong>Họ tên:</strong>{" "}
                        {topic.topic_creator?.user_name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Mã SV:</strong> {topic.topic_creator?.user_id}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {topic.topic_creator?.email}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Thông tin đề tài:
                      </Typography>
                      <Typography variant="body2">
                        <strong>Ngày đề xuất:</strong>{" "}
                        {new Date(topic.created_at).toLocaleDateString("vi-VN")}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Số lượng đề xuất:</strong>{" "}
                        {topic.topic_max_members} sinh viên
                      </Typography>
                      {topic.topic_advisor_request && (
                        <Typography variant="body2">
                          <strong>Yêu cầu từ sinh viên:</strong>{" "}
                          {topic.topic_advisor_request}
                        </Typography>
                      )}
                    </Grid>

                    {topic.teacher_notes && (
                      <Grid item xs={12}>
                        <Alert severity="info">
                          <Typography variant="subtitle2">
                            Phản hồi trước đó:
                          </Typography>
                          <Typography variant="body2">
                            {topic.teacher_notes}
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>

                <Divider />

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/teacher/topics/${topic._id}`)}
                  >
                    Xem chi tiết
                  </Button>

                  {topic.topic_teacher_status === "pending" && (
                    <>
                      <Button
                        size="small"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() =>
                          setApprovalDialog({
                            open: true,
                            topic,
                            action: "approve",
                            feedback: "",
                          })
                        }
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="small"
                        color="warning"
                        startIcon={<EditIcon />}
                        onClick={() =>
                          setApprovalDialog({
                            open: true,
                            topic,
                            action: "need_revision",
                            feedback: "",
                          })
                        }
                      >
                        Yêu cầu sửa
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() =>
                          setApprovalDialog({
                            open: true,
                            topic,
                            action: "reject",
                            feedback: "",
                          })
                        }
                      >
                        Từ chối
                      </Button>
                    </>
                  )}

                  {topic.topic_teacher_status === "need_revision" && (
                    <Button
                      size="small"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() =>
                        setApprovalDialog({
                          open: true,
                          topic,
                          action: "approve",
                          feedback: "",
                        })
                      }
                    >
                      Duyệt sau khi sửa
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialog.open}
        onClose={() => setApprovalDialog({ ...approvalDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approvalDialog.action === "approve"
            ? "Duyệt đề tài"
            : approvalDialog.action === "reject"
              ? "Từ chối đề tài"
              : "Yêu cầu chỉnh sửa"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Đề tài: <strong>{approvalDialog.topic?.topic_title}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Sinh viên: {approvalDialog.topic?.topic_creator?.user_name}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Nhận xét / Hướng dẫn sửa"
            value={approvalDialog.feedback}
            onChange={(e) =>
              setApprovalDialog((prev) => ({
                ...prev,
                feedback: e.target.value,
              }))
            }
            placeholder={
              approvalDialog.action === "approve"
                ? "Nhận xét cho sinh viên (tùy chọn)..."
                : approvalDialog.action === "reject"
                  ? "Lý do từ chối..."
                  : "Yêu cầu chỉnh sửa cụ thể..."
            }
            sx={{ mt: 2 }}
          />

          {approvalDialog.action === "reject" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Lưu ý: Từ chối đề tài sẽ xóa đề tài khỏi hệ thống. Sinh viên cần
                đề xuất lại từ đầu.
              </Typography>
            </Alert>
          )}

          {approvalDialog.action === "need_revision" && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Sinh viên sẽ nhận được yêu cầu chỉnh sửa và có thể cập nhật lại
                đề tài.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setApprovalDialog({ ...approvalDialog, open: false })
            }
          >
            Hủy
          </Button>
          <Button
            onClick={handleApproveTopic}
            variant="contained"
            color={
              approvalDialog.action === "approve"
                ? "success"
                : approvalDialog.action === "reject"
                  ? "error"
                  : "warning"
            }
          >
            {approvalDialog.action === "approve"
              ? "Duyệt"
              : approvalDialog.action === "reject"
                ? "Từ chối"
                : "Gửi yêu cầu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TopicApprovals;
