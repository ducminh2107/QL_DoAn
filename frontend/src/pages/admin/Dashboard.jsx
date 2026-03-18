import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Skeleton,
  Avatar,
  Chip,
  Button,
  Tab,
  Tabs,
} from "@mui/material";
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  Gavel as CouncilIcon,
  AutoStories as AutoStoriesIcon,
  AccountCircle as AccountCircleIcon,
  FileDownload as DownloadIcon,
  BarChart as BarChartIcon,
  TableChart as TableIcon,
  PieChart as PieChartIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
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

/* ─── palette ─── */
const P = {
  indigo: {
    m: "#6366f1",
    l: "#eef2ff",
    g: "linear-gradient(135deg,#6366f1,#818cf8)",
  },
  blue: {
    m: "#3b82f6",
    l: "#eff6ff",
    g: "linear-gradient(135deg,#3b82f6,#60a5fa)",
  },
  green: {
    m: "#10b981",
    l: "#d1fae5",
    g: "linear-gradient(135deg,#10b981,#34d399)",
  },
  amber: {
    m: "#f59e0b",
    l: "#fef3c7",
    g: "linear-gradient(135deg,#f59e0b,#fbbf24)",
  },
  purple: {
    m: "#8b5cf6",
    l: "#ede9fe",
    g: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
  },
  rose: {
    m: "#f43f5e",
    l: "#fce7f3",
    g: "linear-gradient(135deg,#f43f5e,#fb7185)",
  },
};
const PIE_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#0ea5e9",
  "#8b5cf6",
];

const KPI_DEFS = [
  {
    key: "total_users",
    label: "Tổng người dùng",
    sub: "Toàn hệ thống",
    icon: <PeopleIcon sx={{ fontSize: 22 }} />,
    p: P.indigo,
  },
  {
    key: "total_students",
    label: "Sinh viên",
    sub: "Đang học",
    icon: <SchoolIcon sx={{ fontSize: 22 }} />,
    p: P.blue,
  },
  {
    key: "total_teachers",
    label: "Giảng viên",
    sub: "Trong hệ thống",
    icon: <AccountCircleIcon sx={{ fontSize: 22 }} />,
    p: P.green,
  },
  {
    key: "total_topics",
    label: "Đề tài",
    sub: "Hoạt động",
    icon: <AutoStoriesIcon sx={{ fontSize: 22 }} />,
    p: P.amber,
  },
  {
    key: "approved_topics",
    label: "Đề tài đã duyệt",
    sub: "Đã phê duyệt",
    icon: <CheckCircleIcon sx={{ fontSize: 22 }} />,
    p: P.purple,
  },
  {
    key: "total_councils",
    label: "Hội đồng",
    sub: "Tổng số",
    icon: <CouncilIcon sx={{ fontSize: 22 }} />,
    p: P.rose,
  },
];

/* ─── KpiCard (outside page component!) ─── */
const KpiCard = ({ kpi, val, loading }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: "1px solid #f1f5f9",
      background: `linear-gradient(135deg,${kpi.p.l} 0%,#fff 100%)`,
      overflow: "hidden",
      transition: "transform .2s,box-shadow .2s",
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: `0 10px 28px ${kpi.p.m}28`,
      },
    }}
  >
    <Box sx={{ height: 3, background: kpi.p.g }} />
    <CardContent sx={{ p: 2 }}>
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
      >
        <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
          <Typography
            noWrap
            variant="caption"
            sx={{ color: "#94a3b8", fontWeight: 600 }}
          >
            {kpi.label}
          </Typography>
          {loading ? (
            <Skeleton width={50} height={34} />
          ) : (
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                lineHeight: 1.1,
                mt: 0.3,
                background: kpi.p.g,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {val ?? 0}
            </Typography>
          )}
          <Typography
            noWrap
            variant="caption"
            sx={{ color: "#cbd5e1", fontSize: "0.68rem" }}
          >
            {kpi.sub}
          </Typography>
        </Box>
        <Avatar
          sx={{
            width: 42,
            height: 42,
            flexShrink: 0,
            bgcolor: kpi.p.l,
            color: kpi.p.m,
            boxShadow: `0 4px 12px ${kpi.p.m}33`,
          }}
        >
          {kpi.icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

/* ─── ChartTooltip ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: 2,
        p: 1.5,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        border: "1px solid #f1f5f9",
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((p) => (
        <Box key={p.name} display="flex" alignItems="center" gap={1} mt={0.3}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: p.color,
              flexShrink: 0,
            }}
          />
          <Typography sx={{ fontSize: 12, color: "#64748b" }}>
            {p.name}: <strong>{p.value}</strong>
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

/* ─── PieSection (outside page component!) ─── */
const PieSection = ({ title, data: pd, offset }) => (
  <Box>
    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
      <Box sx={{ color: "#6366f1" }}>
        <PieChartIcon fontSize="small" />
      </Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, color: "#1e293b" }}
      >
        {title}
      </Typography>
    </Box>
    <Box sx={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pd}
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="76%"
            paddingAngle={3}
            dataKey="value"
          >
            {pd.map((_, i) => (
              <Cell
                key={i}
                fill={PIE_COLORS[(i + offset) % PIE_COLORS.length]}
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
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  </Box>
);

/* ─── StatRow (outside page component!) ─── */
const StatRow = ({ label, value, color, max }) => (
  <Box mb={1.5}>
    <Box display="flex" justifyContent="space-between" mb={0.4}>
      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color, fontWeight: 700 }}>
        {value ?? 0}
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={max > 0 ? Math.round(((value || 0) / max) * 100) : 0}
      sx={{
        height: 5,
        borderRadius: 3,
        bgcolor: "#f1f5f9",
        "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 },
      }}
    />
  </Box>
);

/* ─── CSS grid shorthand styles ─── */
const grid6 = {
  display: "grid",
  gridTemplateColumns: "repeat(6,1fr)",
  gap: "12px",
  "@media (max-width:1100px)": { gridTemplateColumns: "repeat(3,1fr)" },
  "@media (max-width:700px)": { gridTemplateColumns: "repeat(2,1fr)" },
};
const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  "@media (max-width:700px)": { gridTemplateColumns: "1fr" },
};
const grid4 = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: "20px",
  "@media (max-width:900px)": { gridTemplateColumns: "repeat(2,1fr)" },
  "@media (max-width:500px)": { gridTemplateColumns: "1fr" },
};

/* ─── Page ─── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [tab, setTab] = useState(0);

  useEffect(() => {
    axios
      .get("/api/reports/dashboard")
      .then((r) => setData(r.data.data || {}))
      .catch(() => toast.error("Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  const d = data;

  const barData = [
    {
      name: "Sinh viên",
      Tổng: d.total_students || 0,
      "Đã đăng ký": d.registered_students || 0,
      "Hoàn thành": d.completed_students || 0,
    },
    {
      name: "Đề Tài",
      Tổng: d.total_topics || 0,
      "Đã duyệt": d.approved_topics || 0,
      "Chờ duyệt": d.pending_topics || 0,
    },
    {
      name: "Giảng Viên",
      Tổng: d.total_teachers || 0,
      "Đang HD": d.active_teachers || 0,
    },
    {
      name: "Hội Đồng",
      Tổng: d.total_councils || 0,
      "Hoạt động": d.active_councils || 0,
      "Hoàn thành": d.completed_councils || 0,
    },
  ];

  const userPie = [
    { name: "Sinh viên", value: d.total_students || 0 },
    { name: "Giảng viên", value: d.total_teachers || 0 },
    {
      name: "Quản trị",
      value: Math.max(
        0,
        (d.total_users || 0) -
          (d.total_students || 0) -
          (d.total_teachers || 0),
      ),
    },
  ].filter((x) => x.value > 0);

  const topicPie = [
    { name: "Đã duyệt", value: d.approved_topics || 0 },
    { name: "Chờ duyệt", value: d.pending_topics || 0 },
    {
      name: "Khác",
      value: Math.max(
        0,
        (d.total_topics || 0) -
          (d.approved_topics || 0) -
          (d.pending_topics || 0),
      ),
    },
  ].filter((x) => x.value > 0);

  const cats = [
    {
      key: "students",
      title: "Sinh Viên",
      pal: P.blue,
      total: d.total_students,
      rows: [
        {
          label: "Đã đăng ký đề tài",
          value: d.registered_students,
          color: P.blue.m,
        },
        {
          label: "Đã hoàn thành",
          value: d.completed_students,
          color: P.green.m,
        },
      ],
    },
    {
      key: "topics",
      title: "Đề Tài",
      pal: P.green,
      total: d.total_topics,
      rows: [
        { label: "Đã được duyệt", value: d.approved_topics, color: P.green.m },
        { label: "Đang chờ duyệt", value: d.pending_topics, color: P.amber.m },
      ],
    },
    {
      key: "teachers",
      title: "Giảng Viên",
      pal: P.amber,
      total: d.total_teachers,
      rows: [
        { label: "Đang hướng dẫn", value: d.active_teachers, color: P.amber.m },
        { label: "Chưa có SV", value: d.inactive_teachers, color: "#94a3b8" },
      ],
    },
    {
      key: "councils",
      title: "Hội Đồng",
      pal: P.purple,
      total: d.total_councils,
      rows: [
        { label: "Hoạt động", value: d.active_councils, color: P.purple.m },
        { label: "Hoàn thành", value: d.completed_councils, color: P.green.m },
      ],
    },
  ];

  const ratios = [
    {
      label: "Tỷ lệ duyệt đề tài",
      val:
        d.total_topics > 0
          ? Math.round((d.approved_topics / d.total_topics) * 100)
          : 0,
      unit: "%",
      p: P.green,
      max: 100,
    },
    {
      label: "SV đã đăng ký ĐT",
      val: d.registered_students || 0,
      unit: " SV",
      p: P.blue,
      max: d.total_students || 1,
    },
    {
      label: "GV đang hướng dẫn",
      val: d.active_teachers || 0,
      unit: " GV",
      p: P.amber,
      max: d.total_teachers || 1,
    },
    {
      label: "Hội đồng hoạt động",
      val: d.active_councils || 0,
      unit: " HĐ",
      p: P.purple,
      max: d.total_councils || 1,
    },
  ];

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg,#1e3a8a 0%,#312e81 50%,#4c1d95 100%)",
          px: { xs: 3, md: 4 },
          pt: 5,
          pb: "76px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[
          { t: -60, r: -60, s: 200, o: 0.08 },
          { t: 30, r: 160, s: 110, o: 0.06 },
          { b: -40, l: -40, s: 160, o: 0.06 },
        ].map((b, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              top: b.t,
              bottom: b.b,
              right: b.r,
              left: b.l,
              width: b.s,
              height: b.s,
              borderRadius: "50%",
              bgcolor: "white",
              opacity: b.o,
            }}
          />
        ))}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            label="Admin Dashboard"
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              mb: 1.5,
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h4"
            sx={{ color: "white", fontWeight: 800, mb: 0.5 }}
          >
            Tổng Quan Hệ Thống
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.88rem" }}
          >
            Cập nhật lúc {new Date().toLocaleString("vi-VN")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              mt: 3,
            }}
          >
            {[
              { label: "Người dùng", path: "/admin/users" },
              { label: "Đề tài", path: "/admin/system-topics" },
              { label: "Hội đồng", path: "/admin/councils" },
              { label: "Nhật ký", path: "/admin/logs" },
              { label: "Xuất dữ liệu", path: "/admin/import-export" },
            ].map((item) => (
              <Button
                key={item.path}
                size="small"
                variant="outlined"
                onClick={() => navigate(item.path)}
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  borderColor: "rgba(255,255,255,0.3)",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  fontSize: "0.8rem",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(255,255,255,0.7)",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          mt: "-56px",
          pb: 5,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* KPI – 6 equal cols */}
        <Box sx={{ ...grid6, mb: 3 }}>
          {KPI_DEFS.map((k) => (
            <KpiCard key={k.key} kpi={k} val={d[k.key]} loading={loading} />
          ))}
        </Box>

        {/* Tab container */}
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid #f1f5f9", bgcolor: "#fff" }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              px: 2,
              borderBottom: "1px solid #f1f5f9",
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "none",
                minHeight: 48,
              },
              "& .Mui-selected": { color: "#6366f1" },
              "& .MuiTabs-indicator": { bgcolor: "#6366f1" },
            }}
          >
            <Tab
              icon={<BarChartIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label="Biểu đồ tổng quan"
            />
            <Tab
              icon={<TableIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label="Thống kê chi tiết"
            />
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* ══ TAB 0 ══ */}
            {tab === 0 && (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {/* Row 1 – full-width bar chart */}
                <Card
                  elevation={0}
                  sx={{ borderRadius: 2, border: "1px solid #f1f5f9", p: 2.5 }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Box sx={{ color: "#6366f1" }}>
                      <BarChartIcon fontSize="small" />
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "#1e293b" }}
                    >
                      Biểu Đồ So Sánh Tổng Quan
                    </Typography>
                  </Box>
                  {loading ? (
                    <Skeleton
                      variant="rectangular"
                      height={280}
                      sx={{ borderRadius: 2 }}
                    />
                  ) : (
                    <Box sx={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={barData}
                          barGap={6}
                          barCategoryGap="32%"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{
                              fontSize: 13,
                              fill: "#64748b",
                              fontWeight: 600,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            content={<ChartTooltip />}
                            cursor={{ fill: "#f8fafc" }}
                          />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                          />
                          <Bar
                            dataKey="Tổng"
                            fill="#e2e8f0"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                          <Bar
                            dataKey="Đã đăng ký"
                            fill={P.blue.m}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                          <Bar
                            dataKey="Đã duyệt"
                            fill={P.green.m}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                          <Bar
                            dataKey="Chờ duyệt"
                            fill={P.amber.m}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                          <Bar
                            dataKey="Đang HD"
                            fill={P.purple.m}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                          <Bar
                            dataKey="Hoạt động"
                            fill="#6366f1"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                          <Bar
                            dataKey="Hoàn thành"
                            fill={P.rose.m}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Card>

                {/* Row 2 – 2 equal pie charts */}
                <Box sx={grid2}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #f1f5f9",
                      p: 2.5,
                    }}
                  >
                    {loading ? (
                      <Skeleton
                        variant="rectangular"
                        height={230}
                        sx={{ borderRadius: 2 }}
                      />
                    ) : (
                      <PieSection
                        title="Phân Bổ Người Dùng"
                        data={userPie}
                        offset={0}
                      />
                    )}
                  </Card>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #f1f5f9",
                      p: 2.5,
                    }}
                  >
                    {loading ? (
                      <Skeleton
                        variant="rectangular"
                        height={230}
                        sx={{ borderRadius: 2 }}
                      />
                    ) : (
                      <PieSection
                        title="Trạng Thái Đề Tài"
                        data={topicPie}
                        offset={2}
                      />
                    )}
                  </Card>
                </Box>

                {/* Row 3 – 4 equal ratio cards */}
                <Box sx={grid4}>
                  {ratios.map((s, i) => (
                    <Card
                      key={i}
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid #f1f5f9",
                        p: 2.5,
                        transition: "box-shadow .2s",
                        "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.07)" },
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#64748b",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          mb: 1.5,
                        }}
                      >
                        {s.label}
                      </Typography>
                      {loading ? (
                        <Skeleton width={80} height={36} />
                      ) : (
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: "2rem",
                            color: s.p.m,
                            lineHeight: 1,
                          }}
                        >
                          {s.val}
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              color: "#94a3b8",
                            }}
                          >
                            {s.unit}
                          </span>
                        </Typography>
                      )}
                      <Box
                        sx={{
                          mt: 1.5,
                          height: 7,
                          borderRadius: 4,
                          bgcolor: s.p.l,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${Math.min(Math.round(((s.val || 0) / (s.max || 1)) * 100), 100)}%`,
                            height: "100%",
                            bgcolor: s.p.m,
                            borderRadius: 4,
                            transition: "width 1.2s ease",
                          }}
                        />
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* ══ TAB 1 ══ */}
            {tab === 1 && (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {/* 4 equal category cards */}
                <Box sx={grid4}>
                  {cats.map((cat) => (
                    <Card
                      key={cat.key}
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid #f1f5f9",
                        overflow: "hidden",
                        transition: "transform .2s,box-shadow .2s",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: `0 10px 28px ${cat.pal.m}22`,
                        },
                      }}
                    >
                      <Box sx={{ height: 4, background: cat.pal.g }} />
                      <CardContent sx={{ p: 2.5 }}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 2 }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                color: "#1e293b",
                                fontSize: "0.95rem",
                              }}
                            >
                              {cat.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#94a3b8" }}
                            >
                              Thống kê chi tiết
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "1.9rem",
                                color: cat.pal.m,
                                lineHeight: 1,
                              }}
                            >
                              {cat.total ?? 0}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#94a3b8" }}
                            >
                              Tổng số
                            </Typography>
                          </Box>
                        </Box>

                        {loading
                          ? [1, 2].map((k) => (
                              <Skeleton
                                key={k}
                                height={36}
                                sx={{ mb: 1, borderRadius: 2 }}
                              />
                            ))
                          : cat.rows.map((row, i) => (
                              <StatRow
                                key={i}
                                label={row.label}
                                value={row.value}
                                color={row.color}
                                max={cat.total}
                              />
                            ))}

                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => navigate("/admin/import-export")}
                          disableElevation
                          sx={{
                            mt: 2,
                            borderRadius: 2,
                            bgcolor: cat.pal.l,
                            color: cat.pal.m,
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": { bgcolor: cat.pal.m, color: "white" },
                            transition: "all .2s",
                          }}
                        >
                          Xuất Báo Cáo
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* Completion rate – full width */}
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #f1f5f9",
                    p: 3,
                    background: "linear-gradient(135deg,#f0fdf4 0%,#fff 100%)",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 3fr",
                      gap: "24px",
                      alignItems: "center",
                      "@media (max-width:700px)": {
                        gridTemplateColumns: "1fr",
                      },
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}
                      >
                        📊 Tỷ Lệ Hoàn Thành Tổng Thể
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Tỷ lệ sinh viên hoàn thành đề tài trong toàn hệ thống
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: "2.8rem",
                          color: P.green.m,
                          lineHeight: 1,
                        }}
                      >
                        {d.completion_rate ?? 0}
                        <span
                          style={{
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            color: "#94a3b8",
                          }}
                        >
                          %
                        </span>
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        Hoàn thành
                      </Typography>
                    </Box>
                    <Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(d.completion_rate ?? 0, 100)}
                        sx={{
                          height: 14,
                          borderRadius: 7,
                          bgcolor: "#d1fae5",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: P.green.m,
                            borderRadius: 7,
                            transition: "width 1.5s ease",
                          },
                        }}
                      />
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mt={0.5}
                      >
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          0%
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          100%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Box>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
