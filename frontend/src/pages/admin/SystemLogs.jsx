import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  TablePagination,
  TextField,
  MenuItem,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  DeleteSweep as ClearIcon,
  Visibility as ViewIcon,
  Article as LogIcon,
  Person as PersonIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  AdminPanelSettings as AdminIcon,
  School as TeacherIcon,
  AccountCircle as StudentIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

/* ────────────────────────────── helpers ─────────────────────────────── */

// Ánh xạ action code → tiếng Việt
const ACTION_LABELS = {
  // Auth
  LOGIN: "Đăng nhập",
  LOGOUT: "Đăng xuất",
  REGISTER: "Đăng ký tài khoản",
  CHANGE_PASSWORD: "Đổi mật khẩu",
  RESET_PASSWORD: "Đặt lại mật khẩu",

  // Users
  CREATE_USER: "Tạo người dùng mới",
  UPDATE_USER: "Cập nhật người dùng",
  DELETE_USER: "Xóa người dùng",
  IMPORT_USERS: "Import danh sách người dùng",

  // Topics
  CREATE_TOPIC: "Tạo đề tài mới",
  UPDATE_TOPIC: "Cập nhật đề tài",
  DELETE_TOPIC: "Xóa đề tài",
  APPROVE_TOPIC: "Duyệt đề tài",
  REJECT_TOPIC: "Từ chối đề tài",
  ASSIGN_TOPIC: "Phân công đề tài",

  // Student registration
  REGISTER_TOPIC: "Sinh viên đăng ký đề tài",
  CANCEL_REGISTRATION: "Hủy đăng ký đề tài",
  APPROVE_REGISTRATION: "Duyệt đăng ký",
  REJECT_REGISTRATION: "Từ chối đăng ký",

  // Grading
  SUBMIT_SCORE: "Nộp điểm",
  UPDATE_SCORE: "Cập nhật điểm",
  SUBMIT_RUBRIC: "Chấm rubric",

  // Admin actions
  UPDATE_SYSTEM_SETTINGS: "Cập nhật cài đặt hệ thống",
  UPDATE_SETTING: "Cập nhật cài đặt",
  CLEAR_OLD_LOGS: "Xóa nhật ký cũ",
  IMPORT_DATA: "Import dữ liệu",
  EXPORT_DATA: "Xuất dữ liệu",
  CREATE_SEMESTER: "Tạo học kỳ",
  UPDATE_SEMESTER: "Cập nhật học kỳ",
  DELETE_SEMESTER: "Xóa học kỳ",
  CREATE_COUNCIL: "Tạo hội đồng",
  UPDATE_COUNCIL: "Cập nhật hội đồng",
  DELETE_COUNCIL: "Xóa hội đồng",
  CREATE_RUBRIC: "Tạo rubric",
  UPDATE_RUBRIC: "Cập nhật rubric",
  DELETE_RUBRIC: "Xóa rubric",
  CREATE_SCHEDULE: "Tạo lịch bảo vệ",
  UPDATE_SCHEDULE: "Cập nhật lịch",
  DELETE_SCHEDULE: "Xóa lịch",
};

const labelOf = (action = "") =>
  ACTION_LABELS[action] || action.replace(/_/g, " ");

// Màu chip theo loại action
const getChipStyle = (action = "") => {
  const a = action.toUpperCase();
  if (a.includes("LOGIN") || a.includes("REGISTER"))
    return { bgcolor: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" };
  if (a.includes("CREATE") || a.includes("IMPORT") || a.includes("APPROVE"))
    return { bgcolor: "#f0fdf4", color: "#15803d", border: "#86efac" };
  if (a.includes("UPDATE") || a.includes("ASSIGN") || a.includes("SUBMIT"))
    return { bgcolor: "#fffbeb", color: "#b45309", border: "#fcd34d" };
  if (
    a.includes("DELETE") ||
    a.includes("CLEAR") ||
    a.includes("REJECT") ||
    a.includes("CANCEL")
  )
    return { bgcolor: "#fef2f2", color: "#b91c1c", border: "#fca5a5" };
  if (a.includes("EXPORT"))
    return { bgcolor: "#f5f3ff", color: "#7c3aed", border: "#c4b5fd" };
  return { bgcolor: "#f8fafc", color: "#475569", border: "#cbd5e1" };
};

// Màu role badge
const roleInfo = (role) => {
  const map = {
    admin: {
      label: "Admin",
      color: "#7c3aed",
      bg: "#f5f3ff",
      icon: <AdminIcon sx={{ fontSize: 13 }} />,
    },
    teacher: {
      label: "Giảng viên",
      color: "#0369a1",
      bg: "#eff6ff",
      icon: <TeacherIcon sx={{ fontSize: 13 }} />,
    },
    student: {
      label: "Sinh viên",
      color: "#15803d",
      bg: "#f0fdf4",
      icon: <StudentIcon sx={{ fontSize: 13 }} />,
    },
  };
  return (
    map[role] || {
      label: role || "—",
      color: "#475569",
      bg: "#f8fafc",
      icon: null,
    }
  );
};

// Collection → tên thân thiện
const COLLECTION_LABELS = {
  users: "Người dùng",
  topics: "Đề tài",
  registrations: "Đăng ký",
  scoreboards: "Bảng điểm",
  semesters: "Học kỳ",
  councils: "Hội đồng",
  rubrics: "Rubric",
  schedules: "Lịch bảo vệ",
  systemsettings: "Cài đặt hệ thống",
  systemlogs: "Nhật ký",
  systemtopics: "Đề tài hệ thống",
  notifications: "Thông báo",
};

const collectionLabel = (name = "") =>
  COLLECTION_LABELS[name.toLowerCase()] || name;

const timeAgo = (dateStr) => {
  if (!dateStr) return "—";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

/* ─────────────────────────── Component ─────────────────────────────── */
const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, byAction: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterCollection, setFilterCollection] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [includeReads, setIncludeReads] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [clearDialog, setClearDialog] = useState(false);
  const [daysOld, setDaysOld] = useState(30);
  const [clearing, setClearing] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        includeReads: includeReads ? "true" : "false",
      };
      if (filterAction) params.action = filterAction;
      if (filterCollection) params.collection = filterCollection;
      if (search) params.searchMessage = search;
      if (dateFrom) params.fromDate = dateFrom;
      if (dateTo) params.toDate = dateTo;

      const res = await axios.get("/api/admin/system-logs", { params });
      setLogs(res.data.data || []);
      setTotalCount(res.data.pagination?.total || 0);
    } catch {
      toast.error("Không thể tải nhật ký hệ thống");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    filterAction,
    filterCollection,
    search,
    dateFrom,
    dateTo,
    includeReads,
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get("/api/admin/system-logs/stats");
      setStats(res.data.data || { total: 0, byAction: [] });
    } catch {
      /* silent */
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get("/api/topic-categories");
      setCategories(res.data.data || []);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, [fetchStats, fetchCategories]);

  // Translate IDs inside changes object
  const formatChanges = useCallback(
    (changesObj, compact = false) => {
      if (!changesObj) return compact ? "" : "Không có dữ liệu";
      let formatted = changesObj;
      try {
        if (typeof changesObj === "object") {
          formatted = JSON.parse(JSON.stringify(changesObj));
          // Replace category IDs with category names
          const replaceCategory = (obj) => {
            for (let key in obj) {
              if (typeof obj[key] === "object" && obj[key] !== null) {
                replaceCategory(obj[key]);
              } else if (key === "topic_category" || key === "category") {
                const cat = categories.find((c) => c._id === String(obj[key]));
                if (cat) {
                  // TopicCategory uses topic_category_title in backend DB
                  obj[key] = cat.topic_category_title || cat.name || obj[key];
                }
              }
            }
          };
          replaceCategory(formatted);
        }
        return compact
          ? JSON.stringify(formatted)
          : JSON.stringify(formatted, null, 2);
      } catch {
        return compact
          ? String(changesObj)
          : JSON.stringify(changesObj, null, 2);
      }
    },
    [categories],
  );

  const handleExport = async () => {
    try {
      const params = {};
      if (filterAction) params.action = filterAction;
      if (filterCollection) params.collection = filterCollection;
      if (dateFrom) params.fromDate = dateFrom;
      if (dateTo) params.toDate = dateTo;
      const res = await axios.get("/api/admin/system-logs/export", {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `system-logs-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Đã xuất CSV thành công");
    } catch {
      toast.error("Lỗi xuất CSV");
    }
  };

  const handleClearOld = async () => {
    try {
      setClearing(true);
      const res = await axios.post("/api/admin/system-logs/clear-old", {
        daysOld,
      });
      toast.success(res.data.message || "Đã xóa nhật ký cũ");
      setClearDialog(false);
      fetchLogs();
      fetchStats();
    } catch {
      toast.error("Lỗi xóa nhật ký");
    } finally {
      setClearing(false);
    }
  };

  const uniqueActions = useMemo(
    () => Array.from(new Set(logs.map((l) => l.action).filter(Boolean))),
    [logs],
  );
  const uniqueCollections = useMemo(
    () =>
      Array.from(new Set(logs.map((l) => l.collection_name).filter(Boolean))),
    [logs],
  );
  const topAction = useMemo(
    () => [...stats.byAction].sort((a, b) => b.count - a.count)[0],
    [stats],
  );

  const hasFilters =
    filterAction || filterCollection || dateFrom || dateTo || search;

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
          boxShadow: "0 10px 30px rgba(37,99,235,0.25)",
        }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <LogIcon sx={{ fontSize: 32 }} />
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
            >
              Nhật Ký Hoạt Động
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Theo dõi ai làm gì, lúc nào — chỉ hiển thị các thao tác quan trọng
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              fontWeight: 600,
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
          >
            Xuất CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={() => setClearDialog(true)}
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.5)",
              fontWeight: 600,
            }}
          >
            Xóa log cũ
          </Button>
          <Tooltip title="Làm mới">
            <IconButton
              onClick={() => {
                fetchLogs();
                fetchStats();
              }}
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
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Tổng nhật ký",
            value: stats.total?.toLocaleString?.() || "—",
            icon: "📋",
            color: "#1d4ed8",
            bg: "#eff6ff",
          },
          {
            label: "Trong bộ lọc hiện tại",
            value: totalCount.toLocaleString(),
            icon: "🔍",
            color: "#15803d",
            bg: "#f0fdf4",
          },
          {
            label: "Loại hành động",
            value: stats.byAction?.length || 0,
            icon: "⚡",
            color: "#7c3aed",
            bg: "#f5f3ff",
          },
          {
            label: "Thao tác nhiều nhất",
            value: topAction ? labelOf(topAction._id) : "—",
            icon: "🏆",
            color: "#b45309",
            bg: "#fffbeb",
          },
        ].map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
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
                  sx={{ bgcolor: s.bg, fontSize: 22, width: 44, height: 44 }}
                >
                  {s.icon}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: s.color, lineHeight: 1 }}
                  >
                    {s.value}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {s.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter Panel */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, mb: 3 }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
            cursor: "pointer",
          }}
          onClick={() => setShowFilters((v) => !v)}
        >
          <FilterIcon sx={{ color: "#2563eb" }} />
          <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>
            Bộ lọc
            {hasFilters && (
              <Chip
                label="Đang lọc"
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={includeReads}
                size="small"
                onChange={(e) => {
                  e.stopPropagation();
                  setIncludeReads(e.target.checked);
                  setPage(0);
                }}
              />
            }
            label={
              <Typography variant="caption">Bao gồm thao tác đọc</Typography>
            }
            onClick={(e) => e.stopPropagation()}
          />
          {showFilters ? <CollapseIcon /> : <ExpandIcon />}
        </Box>
        <Collapse in={showFilters}>
          <Divider />
          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tìm kiếm"
                  size="small"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Tên hành động, collection..."
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Loại hành động"
                  size="small"
                  value={filterAction}
                  onChange={(e) => {
                    setFilterAction(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Tất cả hành động</MenuItem>
                  {uniqueActions.map((a) => (
                    <MenuItem key={a} value={a}>
                      {labelOf(a)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Loại dữ liệu"
                  size="small"
                  value={filterCollection}
                  onChange={(e) => {
                    setFilterCollection(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {uniqueCollections.map((c) => (
                    <MenuItem key={c} value={c}>
                      {collectionLabel(c)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={1.5}>
                <TextField
                  fullWidth
                  label="Từ ngày"
                  size="small"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={1.5}>
                <TextField
                  fullWidth
                  label="Đến ngày"
                  size="small"
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            {hasFilters && (
              <Box
                sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  size="small"
                  onClick={() => {
                    setSearch("");
                    setFilterAction("");
                    setFilterCollection("");
                    setDateFrom("");
                    setDateTo("");
                    setPage(0);
                  }}
                >
                  Xoá bộ lọc
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>

      {/* Table */}
      {loading ? (
        <LinearProgress />
      ) : logs.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
          }}
        >
          <LogIcon sx={{ fontSize: 72, color: "#cbd5e1", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#64748b" }}>
            Không có nhật ký nào
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {hasFilters
              ? "Thử thay đổi bộ lọc"
              : "Chưa có thao tác nào được ghi nhận"}
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
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                    Thời gian
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                    Thao tác
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                    Loại dữ liệu
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                    Người thực hiện
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#475569", width: 180 }}
                  >
                    Thay đổi
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "#475569" }}
                    align="center"
                  >
                    Chi tiết
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log, idx) => {
                  const chip = getChipStyle(log.action);
                  const role = roleInfo(log.user_role);
                  const changesStr = formatChanges(log.changes, true);
                  return (
                    <TableRow
                      key={log._id || idx}
                      hover
                      sx={{ "&:hover": { bgcolor: "#f8fafc" } }}
                    >
                      {/* Thời gian */}
                      <TableCell
                        sx={{
                          fontSize: "0.78rem",
                          color: "#475569",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Tooltip
                          title={
                            log.timestamp
                              ? new Date(log.timestamp).toLocaleString("vi-VN")
                              : ""
                          }
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "#1e293b",
                                fontSize: "0.78rem",
                              }}
                            >
                              {timeAgo(log.timestamp)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {log.timestamp
                                ? new Date(log.timestamp).toLocaleDateString(
                                    "vi-VN",
                                  )
                                : ""}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>

                      {/* Thao tác */}
                      <TableCell>
                        <Chip
                          label={labelOf(log.action)}
                          size="small"
                          sx={{
                            bgcolor: chip.bgcolor,
                            color: chip.color,
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            border: `1px solid ${chip.border}`,
                          }}
                        />
                      </TableCell>

                      {/* Loại dữ liệu */}
                      <TableCell sx={{ fontSize: "0.83rem" }}>
                        {log.collection_name ? (
                          <Chip
                            label={collectionLabel(log.collection_name)}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: 11 }}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      {/* Người thực hiện */}
                      <TableCell>
                        {log.user_name ? (
                          <Box display="flex" alignItems="center" gap={0.8}>
                            <Avatar
                              sx={{
                                width: 26,
                                height: 26,
                                bgcolor: role.bg,
                                color: role.color,
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              {log.user_name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: "#1e293b",
                                  fontSize: "0.82rem",
                                }}
                              >
                                {log.user_name}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                {role.icon}
                                <Typography
                                  variant="caption"
                                  sx={{ color: role.color, fontSize: 10 }}
                                >
                                  {role.label}
                                  {log.user_code ? ` · ${log.user_code}` : ""}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#94a3b8",
                              fontStyle: "italic",
                              fontSize: "0.8rem",
                            }}
                          >
                            Hệ thống
                          </Typography>
                        )}
                      </TableCell>

                      {/* Thay đổi (truncated) */}
                      <TableCell sx={{ maxWidth: 180 }}>
                        <Tooltip title={changesStr || "Không có"}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#475569",
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {changesStr || "—"}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      {/* Detail button */}
                      <TableCell align="center">
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedLog(log)}
                            sx={{ color: "#2563eb" }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[20, 50, 100]}
            labelRowsPerPage="Dòng/trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} / ${count} bản ghi`
            }
            sx={{ borderTop: "1px solid #e2e8f0" }}
          />
        </Paper>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#1e3a8a",
            color: "white",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ViewIcon /> Chi tiết Nhật Ký
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedLog && (
            <Box>
              {[
                {
                  label: "Thời gian",
                  value: selectedLog.timestamp
                    ? new Date(selectedLog.timestamp).toLocaleString("vi-VN")
                    : "—",
                },
                {
                  label: "Thao tác",
                  value: labelOf(selectedLog.action),
                  chip: true,
                  action: selectedLog.action,
                },
                {
                  label: "Loại dữ liệu",
                  value: collectionLabel(selectedLog.collection_name) || "—",
                },
                {
                  label: "Người thực hiện",
                  value: selectedLog.user_name
                    ? `${selectedLog.user_name} (${selectedLog.user_code || ""})`
                    : "Hệ thống",
                },
                {
                  label: "Vai trò",
                  value: roleInfo(selectedLog.user_role).label,
                },
                { label: "Email", value: selectedLog.user_email || "—" },
              ].map((row) => (
                <Box
                  key={row.label}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    px: 3,
                    py: 1.5,
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ minWidth: 120 }}
                  >
                    {row.label}
                  </Typography>
                  {row.chip ? (
                    <Chip
                      label={row.value}
                      size="small"
                      sx={{ ...getChipStyle(row.action), fontWeight: 700 }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#1e293b",
                        wordBreak: "break-all",
                      }}
                    >
                      {row.value}
                    </Typography>
                  )}
                </Box>
              ))}
              <Box sx={{ px: 3, py: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Dữ liệu thay đổi
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    mt: 0.5,
                    p: 1.5,
                    bgcolor: "#f8fafc",
                    borderRadius: 1.5,
                    border: "1px solid #e2e8f0",
                    maxHeight: 220,
                    overflow: "auto",
                  }}
                >
                  <Typography
                    component="pre"
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      color: "#334155",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {formatChanges(selectedLog.changes)}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3 }}>
          <Button onClick={() => setSelectedLog(null)} variant="outlined">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Old Logs Dialog */}
      <Dialog
        open={clearDialog}
        onClose={() => setClearDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Xóa Nhật Ký Cũ</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Hành động này không thể hoàn tác!
          </Alert>
          <TextField
            fullWidth
            label="Xóa nhật ký cũ hơn (số ngày)"
            type="number"
            value={daysOld}
            onChange={(e) => setDaysOld(Number(e.target.value))}
            size="small"
            helperText="Nhật ký từ trước số ngày này sẽ bị xóa vĩnh viễn"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setClearDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleClearOld}
            disabled={clearing || daysOld < 1}
            sx={{ fontWeight: 700 }}
          >
            {clearing ? "Đang xóa..." : `Xóa log > ${daysOld} ngày`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SystemLogs;
