import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/reports/stats");
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LinearProgress />;

  const chartData = [
    { name: "Tổng số đề tài", count: stats?.topics?.total || 0 },
    { name: "Đề tài đã duyệt", count: stats?.topics?.approved || 0 },
  ];

  const userChartData = [
    { name: "Sinh viên", count: stats?.users?.students || 0 },
    { name: "Giảng viên", count: stats?.users?.teachers || 0 },
    { name: "Tổng số", count: stats?.users?.total || 0 },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Thống kê hệ thống
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "primary.main", color: "white" }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Người dùng</Typography>
                  <Typography variant="h4">{stats?.users?.total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "success.main", color: "white" }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SchoolIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Sinh viên</Typography>
                  <Typography variant="h4">{stats?.users?.students}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "info.main", color: "white" }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Đề tài</Typography>
                  <Typography variant="h4">{stats?.topics?.total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "warning.main", color: "white" }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Đã duyệt</Typography>
                  <Typography variant="h4">
                    {stats?.topics?.approved}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê đề tài
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Số lượng" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê người dùng
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={userChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Số lượng" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
