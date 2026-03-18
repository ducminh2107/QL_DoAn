import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Button,
  Chip,
  Avatar,
} from "@mui/material";
import {
  PeopleAlt as PeopleIcon,
  MenuBook as TopicIcon,
  School as TeacherIcon,
  Gavel as CouncilIcon,
  TrendingUp as TrendingUpIcon,
  StarRate as StarIcon,
  FileDownload as DownloadIcon,
  CheckCircleOutline as CheckIcon,
  HourglassBottom as PendingIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import toast from "react-hot-toast";

/* ──────────────── palette ──────────────── */
const PALETTE = {
  blue: { main: "#3b82f6", light: "#eff6ff", dark: "#1d4ed8" },
  green: { main: "#10b981", light: "#ecfdf5", dark: "#059669" },
  amber: { main: "#f59e0b", light: "#fffbeb", dark: "#d97706" },
  purple: { main: "#8b5cf6", light: "#f5f3ff", dark: "#7c3aed" },
  rose: { main: "#f43f5e", light: "#fff1f2", dark: "#e11d48" },
  cyan: { main: "#06b6d4", light: "#ecfeff", dark: "#0891b2" },
};

const PIE_COLORS = [
  PALETTE.green.main,
  PALETTE.blue.main,
  PALETTE.amber.main,
  PALETTE.rose.main,
  PALETTE.purple.main,
];

/* ──────────────── KPI Card ──────────────── */
const KpiCard = ({ icon, label, value, color, trend }) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: 4,
      border: "1px solid",
      borderColor: "#f1f5f9",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.25s ease",
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: `0 12px 32px ${color.main}22`,
        borderColor: color.main,
      },
    }}
  >
    {/* Decorative blob */}
    <Box
      sx={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 110,
        height: 110,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color.main}22 0%, transparent 70%)`,
      }}
    />
    <CardContent sx={{ p: 3, position: "relative" }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 3,
          bgcolor: color.light,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        {React.cloneElement(icon, { sx: { color: color.main, fontSize: 22 } })}
      </Box>
      <Typography
        variant="h3"
        sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1, mb: 0.5 }}
      >
        {value ?? "—"}
      </Typography>
      <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
        {label}
      </Typography>
      {trend !== undefined && (
        <Chip
          label={trend}
          size="small"
          sx={{
            mt: 1.5,
            bgcolor: color.light,
            color: color.main,
            fontWeight: 700,
            fontSize: "0.7rem",
            height: 22,
          }}
        />
      )}
    </CardContent>
  </Card>
);

/* ──────────────── Section wrapper ──────────────── */
const Section = ({ title, icon, children, sx }) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: 4,
      border: "1px solid #f1f5f9",
      overflow: "hidden",
      ...sx,
    }}
  >
    <Box
      sx={{
        px: 3,
        py: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        borderBottom: "1px solid #f1f5f9",
        bgcolor: "#fafafa",
      }}
    >
      {icon && (
        <Avatar sx={{ width: 32, height: 32, bgcolor: "#e2e8f0" }}>
          {React.cloneElement(icon, { sx: { fontSize: 18, color: "#475569" } })}
        </Avatar>
      )}
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: "#1e293b" }}
      >
        {title}
      </Typography>
    </Box>
    <CardContent sx={{ p: 3 }}>{children}</CardContent>
  </Card>
);

/* ──────────────── Stat row ──────────────── */
const StatRow = ({ label, value, color, icon, max }) => (
  <Box sx={{ mb: 2 }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 0.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        {icon &&
          React.cloneElement(icon, { sx: { fontSize: 15, color: "#94a3b8" } })}
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color }}>
        {value ?? 0}
      </Typography>
    </Box>
    {max > 0 && (
      <LinearProgress
        variant="determinate"
        value={Math.min(100, ((value ?? 0) / max) * 100)}
        sx={{
          height: 5,
          borderRadius: 3,
          bgcolor: "#f1f5f9",
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 },
        }}
      />
    )}
  </Box>
);

/* ──────────────── Custom tooltip ──────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 2,
        p: 1.5,
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: "#1e293b", display: "block", mb: 0.5 }}
      >
        {label}
      </Typography>
      {payload.map((p, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: p.fill || p.color,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {p.name}: <strong>{p.value}</strong>
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

/* ──────────────── Page ──────────────── */
const ReportsDashboard = () => {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/reports/dashboard");
      setReports(res.data.data || {});
    } catch {
      toast.error("Không thể tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type) => {
    try {
      let dataToExport = [];
      let filename = `Bao_cao_${type}.csv`;

      if (type === "students") {
        dataToExport = [
          ["Thong ke Sinh Vien"],
          ["Tong sinh vien", reports.total_students || 0],
          ["Sinh vien da dang ky", reports.registered_students || 0],
          ["Sinh vien da hoan thanh", reports.completed_students || 0],
        ];
      } else if (type === "topics") {
        dataToExport = [
          ["Thong ke De Tai"],
          ["Tong de tai", reports.total_topics || 0],
          ["De tai da duyet", reports.approved_topics || 0],
          ["De tai dang cho", reports.pending_topics || 0],
        ];
      } else if (type === "teachers") {
        dataToExport = [
          ["Thong ke Giang Vien"],
          ["Tong giang vien", reports.total_teachers || 0],
          ["Giang vien dang huong dan", reports.active_teachers || 0],
          ["Giang vien chua co SV", reports.inactive_teachers || 0],
        ];
      } else if (type === "councils") {
        dataToExport = [
          ["Thong ke Hoi Dong"],
          ["Tong hoi dong", reports.total_councils || 0],
          ["Hoi dong dang hoat dong", reports.active_councils || 0],
          ["Hoi dong da hoan thanh", reports.completed_councils || 0],
        ];
      } else {
        return toast.error("Loại báo cáo không hợp lệ");
      }

      const csvContent = dataToExport.map((e) => e.join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Đã xuất báo cáo ${type}`);
    } catch {
      toast.error("Lỗi xuất file");
    }
  };

  /* bar chart – unified keys so every group shows all bars */
  const barData = [
    {
      name: "Sinh viên",
      Tổng: reports.total_students || 0,
      "Đã Đăng Ký": reports.registered_students || 0,
      "Hoàn Thành": reports.completed_students || 0,
    },
    {
      name: "Đề Tài",
      Tổng: reports.total_topics || 0,
      "Đã Duyệt": reports.approved_topics || 0,
      "Đang Chờ": reports.pending_topics || 0,
    },
    {
      name: "Giảng Viên",
      Tổng: reports.total_teachers || 0,
      "Đang Hướng Dẫn": reports.active_teachers || 0,
    },
    {
      name: "Hội Đồng",
      Tổng: reports.total_councils || 0,
      "Hoạt Động": reports.active_councils || 0,
      "Hoàn Thành": reports.completed_councils || 0,
    },
  ];

  const topicApproved = reports.approved_topics || 0;
  const topicPending = reports.pending_topics || 0;
  const topicOthers = Math.max(
    0,
    (reports.total_topics || 0) - topicApproved - topicPending,
  );
  const topicPieData = [
    { name: "Đã Duyệt", value: topicApproved },
    { name: "Đang Chờ", value: topicPending },
    ...(topicOthers > 0 ? [{ name: "Khác", value: topicOthers }] : []),
  ].filter((d) => d.value > 0);

  const svTotal = reports.total_students || 0;
  const svRegistered = reports.registered_students || 0;
  const svCompleted = reports.completed_students || 0;
  const studentPieData = [
    { name: "Chưa đăng ký", value: Math.max(0, svTotal - svRegistered) },
    { name: "Đang thực hiện", value: Math.max(0, svRegistered - svCompleted) },
    { name: "Hoàn thành", value: svCompleted },
  ].filter((d) => d.value > 0);

  const scoreDistributionData = (reports.score_distribution || []).filter(
    (d) => d.value > 0,
  );

  const completionRate = reports.completion_rate || 0;

  const categories = [
    {
      key: "students",
      title: "Sinh Viên",
      color: PALETTE.blue,
      total: reports.total_students,
      rows: [
        {
          label: "Đã đăng ký đề tài",
          value: reports.registered_students,
          icon: <CheckIcon />,
          color: PALETTE.blue.main,
        },
        {
          label: "Đã hoàn thành",
          value: reports.completed_students,
          icon: <StarIcon />,
          color: PALETTE.green.main,
        },
      ],
    },
    {
      key: "topics",
      title: "Đề Tài",
      color: PALETTE.green,
      total: reports.total_topics,
      rows: [
        {
          label: "Đã được duyệt",
          value: reports.approved_topics,
          icon: <CheckIcon />,
          color: PALETTE.green.main,
        },
        {
          label: "Đang chờ duyệt",
          value: reports.pending_topics,
          icon: <PendingIcon />,
          color: PALETTE.amber.main,
        },
      ],
    },
    {
      key: "teachers",
      title: "Giảng Viên",
      color: PALETTE.amber,
      total: reports.total_teachers,
      rows: [
        {
          label: "Đang hướng dẫn",
          value: reports.active_teachers,
          icon: <CheckIcon />,
          color: PALETTE.amber.main,
        },
        {
          label: "Chưa có SV",
          value: reports.inactive_teachers,
          icon: <TeacherIcon />,
          color: "#94a3b8",
        },
      ],
    },
    {
      key: "councils",
      title: "Hội Đồng",
      color: PALETTE.purple,
      total: reports.total_councils,
      rows: [
        {
          label: "Hoạt động",
          value: reports.active_councils,
          icon: <CheckIcon />,
          color: PALETTE.purple.main,
        },
        {
          label: "Hoàn thành",
          value: reports.completed_councils,
          icon: <StarIcon />,
          color: PALETTE.green.main,
        },
      ],
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box textAlign="center">
          <LinearProgress sx={{ width: 200, borderRadius: 2, mb: 2 }} />
          <Typography color="text.secondary">Đang tải dữ liệu...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* ── Gradient Header ── */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",
          pt: 5,
          pb: 8,
          px: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative circles */}
        {[
          { top: -60, right: 80, size: 200 },
          { top: 20, right: -40, size: 140 },
          { bottom: -30, left: 100, size: 120 },
        ].map((c, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              top: c.top,
              bottom: c.bottom,
              left: c.left,
              right: c.right,
              width: c.size,
              height: c.size,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
        ))}

        <Container maxWidth="xl" sx={{ position: "relative" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Box
              sx={{
                p: 1.2,
                bgcolor: "rgba(255,255,255,0.12)",
                borderRadius: 2,
                display: "flex",
              }}
            >
              <BarChartIcon sx={{ color: "white", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "white", lineHeight: 1.2 }}
              >
                Bảng Báo Cáo Tổng Hợp
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.6)", mt: 0.3 }}
              >
                Thống kê và phân tích tổng quan toàn hệ thống
              </Typography>
            </Box>
          </Box>

          {/* quick chips + status */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 2,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {[
                { label: `${reports.total_users || 0} Người dùng` },
                { label: `${reports.total_topics || 0} Đề tài` },
                { label: `${completionRate}% Hoàn thành` },
                { label: `Điểm TB: ${reports.average_score || 0}/10` },
              ].map((c) => (
                <Chip
                  key={c.label}
                  label={c.label}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.12)",
                    color: "white",
                    fontWeight: 600,
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                />
              ))}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#10b981",
                  boxShadow: "0 0 0 2px rgba(16,185,129,0.3)",
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Hệ thống hoạt động bình thường
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Main content pulled up ── */}
      <Container
        maxWidth="xl"
        sx={{ mt: -4, pb: 6, position: "relative", zIndex: 1 }}
      >
        <Grid container spacing={3}>
          {/* KPI row */}
          <Grid item xs={6} sm={3}>
            <KpiCard
              icon={<PeopleIcon />}
              label="Tổng Người Dùng"
              value={reports.total_users}
              color={PALETTE.blue}
              trend={`${reports.total_students || 0} SV`}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard
              icon={<TopicIcon />}
              label="Tổng Đề Tài"
              value={reports.total_topics}
              color={PALETTE.green}
              trend={`${topicApproved} Đã duyệt`}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard
              icon={<TrendingUpIcon />}
              label="Tỷ Lệ Hoàn Thành"
              value={`${completionRate}%`}
              color={PALETTE.amber}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard
              icon={<StarIcon />}
              label="Điểm Trung Bình"
              value={`${reports.average_score || 0}/10`}
              color={PALETTE.purple}
            />
          </Grid>

          {/* Category cards */}
          {categories.map((cat) => (
            <Grid item xs={12} sm={6} md={3} key={cat.key}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  border: "1px solid #f1f5f9",
                  overflow: "hidden",
                  transition: "all 0.2s",
                  "&:hover": { boxShadow: `0 8px 28px ${cat.color.main}18` },
                }}
              >
                {/* Coloured top strip */}
                <Box
                  sx={{
                    height: 4,
                    background: `linear-gradient(90deg, ${cat.color.main}, ${cat.color.dark})`,
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2.5,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: "#1e293b" }}
                    >
                      {cat.title}
                    </Typography>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: cat.color.main,
                          lineHeight: 1,
                        }}
                      >
                        {cat.total ?? 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tổng số
                      </Typography>
                    </Box>
                  </Box>
                  {cat.rows.map((row, i) => (
                    <StatRow
                      key={i}
                      label={row.label}
                      value={row.value}
                      color={row.color}
                      icon={row.icon}
                      max={cat.total}
                    />
                  ))}
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(cat.key)}
                    disableElevation
                    sx={{
                      mt: 1,
                      borderRadius: 2,
                      bgcolor: cat.color.light,
                      color: cat.color.main,
                      fontWeight: 600,
                      "&:hover": { bgcolor: cat.color.main, color: "white" },
                      transition: "all 0.2s",
                    }}
                  >
                    Xuất Báo Cáo
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Bar chart – full width */}
          <Grid item xs={12}>
            <Section title="Biểu Đồ So Sánh Tổng Quan" icon={<BarChartIcon />}>
              <Box sx={{ height: 340 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    barGap={6}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 13, fill: "#64748b", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 13 }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar
                      dataKey="Tổng"
                      fill="#e2e8f0"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="Đã Đăng Ký"
                      fill={PALETTE.blue.main}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="Hoàn Thành"
                      fill={PALETTE.green.main}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="Đã Duyệt"
                      fill={PALETTE.amber.main}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="Đang Chờ"
                      fill={PALETTE.rose.main}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="Đang Hướng Dẫn"
                      fill={PALETTE.purple.main}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="Hoạt Động"
                      fill={PALETTE.cyan.main}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Section>
          </Grid>

          {/* Three pie charts – balanced 4+4+4 */}
          <Grid item xs={12} md={4}>
            <Section
              title="Trạng Thái Đề Tài"
              icon={<TopicIcon />}
              sx={{ height: "100%" }}
            >
              {topicPieData.length > 0 ? (
                <Box
                  sx={{
                    height: 320,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topicPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {topicPieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: "none",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 13, paddingTop: 10 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 280,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    Chưa có dữ liệu đề tài
                  </Typography>
                </Box>
              )}
            </Section>
          </Grid>

          <Grid item xs={12} md={4}>
            <Section
              title="Phân Bổ Sinh Viên"
              icon={<PeopleIcon />}
              sx={{ height: "100%" }}
            >
              {studentPieData.length > 0 ? (
                <Box
                  sx={{
                    height: 320,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={studentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {studentPieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[(i + 1) % PIE_COLORS.length]}
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: "none",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 13, paddingTop: 10 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 320,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    Chưa có dữ liệu sinh viên
                  </Typography>
                </Box>
              )}
            </Section>
          </Grid>
          <Grid item xs={12} md={4}>
            <Section
              title="Phân Phối Điểm"
              icon={<StarIcon />}
              sx={{ height: "100%" }}
            >
              {scoreDistributionData.length > 0 ? (
                <Box
                  sx={{
                    height: 320,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scoreDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {scoreDistributionData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]}
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: "none",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 13, paddingTop: 10 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 320,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    Chưa có bảng điểm
                  </Typography>
                </Box>
              )}
            </Section>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ReportsDashboard;
