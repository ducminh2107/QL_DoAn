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
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Chip,
} from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const ReportsDashboard = () => {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/reports/dashboard");
      setReports(response.data.data || {});
    } catch (error) {
      console.error("Fetch reports error:", error);
      toast.error("Không thể tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportType) => {
    try {
      const response = await axios.get(
        `/api/admin/reports/download/${reportType}`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (error) {
      toast.error("Lỗi tải báo cáo");
    }
  };

  const reportCards = [
    {
      title: "Báo Cáo Sinh Viên",
      description: "Thống kê tổng hợp về sinh viên",
      key: "students",
      stats: [
        { label: "Tổng Sinh Viên", value: reports.total_students },
        { label: "Sinh Viên Đã Đăng Ký", value: reports.registered_students },
        { label: "Sinh Viên Hoàn Thành", value: reports.completed_students },
      ],
    },
    {
      title: "Báo Cáo Đề Tài",
      description: "Thống kê về các đề tài",
      key: "topics",
      stats: [
        { label: "Tổng Đề Tài", value: reports.total_topics },
        { label: "Đề Tài Đã Duyệt", value: reports.approved_topics },
        { label: "Đề Tài Đang Chờ", value: reports.pending_topics },
      ],
    },
    {
      title: "Báo Cáo Giảng Viên",
      description: "Thống kê về giảng viên hướng dẫn",
      key: "teachers",
      stats: [
        { label: "Tổng Giảng Viên", value: reports.total_teachers },
        { label: "Giảng Viên Đang Hướng Dẫn", value: reports.active_teachers },
        {
          label: "Giảng Viên Không Hoạt Động",
          value: reports.inactive_teachers,
        },
      ],
    },
    {
      title: "Báo Cáo Hội Đồng",
      description: "Thống kê về các hội đồng đánh giá",
      key: "councils",
      stats: [
        { label: "Tổng Hội Đồng", value: reports.total_councils },
        { label: "Hội Đồng Hoạt Động", value: reports.active_councils },
        { label: "Hội Đồng Hoàn Thành", value: reports.completed_councils },
      ],
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Bảng Điều Khiển Báo Cáo
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Xem các báo cáo tổng hợp về hệ thống
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          {reportCards.map((card) => (
            <Grid item xs={12} sm={6} md={6} key={card.key}>
              <Card
                sx={{ h: "100%", display: "flex", flexDirection: "column" }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2 }}
                  >
                    {card.description}
                  </Typography>

                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {card.stats.map((stat, idx) => (
                      <Grid item xs={12} key={idx}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            p: 1,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2">{stat.label}</Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "primary.main" }}
                          >
                            {stat.value || 0}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadReport(card.key)}
                  >
                    Tải Báo Cáo
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Summary Stats */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Tỷ Lệ Hoàn Thành
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {reports.completion_rate || 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Điểm Trung Bình
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {reports.average_score?.toFixed(1) || 0}/10
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Tổng Người Dùng
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {reports.total_users || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Hệ Thống
                    </Typography>
                    <Chip label="Hoạt Động" color="success" size="small" />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ReportsDashboard;
