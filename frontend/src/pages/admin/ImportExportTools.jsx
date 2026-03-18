import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Info as InfoIcon,
  GetApp as DownloadIcon,
  TableChart as TableChartIcon,
  People as PeopleIcon,
  MenuBook as MenuBookIcon,
  Grade as GradeIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const EXPORT_OPTIONS = [
  {
    id: "topics",
    label: "Danh Sách Đề Tài",
    icon: <MenuBookIcon />,
    color: "#3b82f6",
    desc: "Xuất tất cả đề tài kèm trạng thái, giảng viên, số sinh viên",
    endpoint: "/api/admin/export/topics",
  },
  {
    id: "grades",
    label: "Kết Quả Chấm Điểm",
    icon: <GradeIcon />,
    color: "#10b981",
    desc: "Xuất toàn bộ bảng điểm sinh viên từ Hội đồng và Giảng viên",
    endpoint: "/api/admin/export/grades",
  },
  {
    id: "students",
    label: "Danh Sách Sinh Viên",
    icon: <PeopleIcon />,
    color: "#f59e0b",
    desc: "Xuất danh sách tất cả sinh viên",
    endpoint: "/api/admin/export/users?role=student",
  },
  {
    id: "teachers",
    label: "Danh Sách Giảng Viên",
    icon: <PeopleIcon />,
    color: "#8b5cf6",
    desc: "Xuất danh sách tất cả giảng viên",
    endpoint: "/api/admin/export/users?role=teacher",
  },
];

const ImportExportTools = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState({});
  const [importFile, setImportFile] = useState(null);
  const [importFormat, setImportFormat] = useState("csv");
  const [importType, setImportType] = useState("users");
  const [importHistory, setImportHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImportFile(file);
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Vui lòng chọn file");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("format", importFormat);
      formData.append("type", importType);

      const response = await axios.post("/api/admin/import/data", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response.data.message || "Nhập dữ liệu thành công");
      setImportFile(null);
      document.getElementById("import-file-input").value = "";
      fetchImportHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi nhập dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchImportHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get("/api/admin/import/history");
      const rawData = response.data.data || [];
      // Map SystemLog fields to what UI expects
      const mapped = rawData.map((log) => ({
        _id: log._id,
        timestamp: log.timestamp,
        type: log.collection_name || "unknown",
        row_count: log.changes?.count || "—",
        status: "success",
        imported_by: log.user_id || "Admin",
      }));
      setImportHistory(mapped);
    } catch (error) {
      console.error("Fetch import history error:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const downloadTemplate = async (type) => {
    try {
      const response = await axios.get(`/api/admin/import/template/${type}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `template_${type}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      toast.success("Đã tải template");
    } catch {
      toast.error("Lỗi tải template");
    }
  };

  const handleExport = async (opt) => {
    try {
      setExportLoading((prev) => ({ ...prev, [opt.id]: true }));
      const response = await axios.get(opt.endpoint, {
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      let filename = `${opt.id}_export.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);

      toast.success(`Đã xuất ${opt.label}`);
    } catch {
      toast.error(`Lỗi xuất ${opt.label}`);
    } finally {
      setExportLoading((prev) => ({ ...prev, [opt.id]: false }));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          📦 Công Cụ Nhập / Xuất Dữ Liệu
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Import hàng loạt và Export báo cáo CSV cho hệ thống
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3, borderBottom: "1px solid #e2e8f0" }}
      >
        <Tab
          label="📥 Nhập Dữ Liệu (Import)"
          id="tab-0"
          aria-controls="tabpanel-0"
        />
        <Tab
          label="📤 Xuất Dữ Liệu (Export)"
          id="tab-1"
          aria-controls="tabpanel-1"
        />
        <Tab label="📋 Lịch Sử" id="tab-2" aria-controls="tabpanel-2" />
      </Tabs>

      {/* ── TAB 0: IMPORT ── */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert icon={<InfoIcon />} severity="warning">
              Chỉ quản trị viên mới có thể nhập dữ liệu. Tải template để biết
              định dạng chính xác trước khi nhập.
            </Alert>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Nhập Dữ Liệu Hàng Loạt
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Loại dữ liệu */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    1. Loại Dữ Liệu
                  </Typography>
                  <RadioGroup
                    value={importType}
                    onChange={(e) => setImportType(e.target.value)}
                    row
                  >
                    <FormControlLabel
                      value="users"
                      control={<Radio />}
                      label="Người Dùng"
                    />
                    <FormControlLabel
                      value="topics"
                      control={<Radio />}
                      label="Đề Tài"
                    />
                    <FormControlLabel
                      value="semesters"
                      control={<Radio />}
                      label="Học Kỳ"
                    />
                    <FormControlLabel
                      value="faculties"
                      control={<Radio />}
                      label="Khoa"
                    />
                  </RadioGroup>
                </Box>

                {/* Định dạng */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    2. Định Dạng Tệp
                  </Typography>
                  <RadioGroup
                    value={importFormat}
                    onChange={(e) => setImportFormat(e.target.value)}
                    row
                  >
                    <FormControlLabel
                      value="csv"
                      control={<Radio />}
                      label="CSV"
                    />
                    <FormControlLabel
                      value="xlsx"
                      control={<Radio />}
                      label="Excel (XLSX)"
                    />
                  </RadioGroup>
                </Box>

                {/* Tải template */}
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadTemplate(importType)}
                >
                  Tải Template {importType.toUpperCase()}
                </Button>

                <Divider />

                {/* Upload file */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    3. Chọn Tệp
                  </Typography>
                  <input
                    id="import-file-input"
                    type="file"
                    accept={importFormat === "csv" ? ".csv" : ".xlsx,.xls"}
                    onChange={handleFileChange}
                    disabled={loading}
                    style={{ display: "block", width: "100%" }}
                  />
                </Box>

                {importFile && (
                  <Alert severity="info" icon={<CheckCircleIcon />}>
                    Tệp đã chọn: <strong>{importFile.name}</strong> (
                    {(importFile.size / 1024).toFixed(1)} KB)
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={
                    loading ? (
                      <LinearProgress
                        sx={{ width: 16, height: 16, borderRadius: 1 }}
                      />
                    ) : (
                      <CloudUploadIcon />
                    )
                  }
                  onClick={handleImport}
                  disabled={!importFile || loading}
                >
                  {loading ? "Đang Nhập..." : "Nhập Dữ Liệu"}
                </Button>

                {loading && <LinearProgress sx={{ borderRadius: 1 }} />}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  📖 Hướng Dẫn Import
                </Typography>
                {[
                  {
                    step: "1",
                    title: "Chọn Loại Dữ Liệu",
                    desc: "Chọn loại dữ liệu bạn muốn nhập: người dùng, đề tài, học kỳ hay khoa",
                  },
                  {
                    step: "2",
                    title: "Tải Template",
                    desc: "Nhấn 'Tải Template' để lấy file mẫu với đúng cột cần điền",
                  },
                  {
                    step: "3",
                    title: "Điền Dữ Liệu",
                    desc: "Mở file template bằng Excel/Google Sheets và điền dữ liệu vào",
                  },
                  {
                    step: "4",
                    title: "Import File",
                    desc: "Chọn file đã điền và nhấn 'Nhập Dữ Liệu'. Hệ thống tự bỏ qua bản ghi trùng",
                  },
                ].map((s) => (
                  <Box
                    key={s.step}
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 2,
                      p: 2,
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {s.step}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {s.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {s.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── TAB 1: EXPORT ── */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert icon={<TableChartIcon />} severity="info">
              Xuất dữ liệu ra file CSV với encoding UTF-8 (có BOM) để mở đúng
              chữ tiếng Việt trong Excel.
            </Alert>
          </Grid>

          {EXPORT_OPTIONS.map((opt) => (
            <Grid item xs={12} sm={6} key={opt.id}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 3,
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: opt.color,
                    boxShadow: `0 4px 16px ${opt.color}22`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: `${opt.color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: opt.color,
                      }}
                    >
                      {opt.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {opt.label}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Xuất ra .CSV
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2.5, minHeight: 36 }}
                  >
                    {opt.desc}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={
                      exportLoading[opt.id] ? (
                        <LinearProgress
                          sx={{ width: 16, height: 14, borderRadius: 1 }}
                        />
                      ) : (
                        <DownloadIcon />
                      )
                    }
                    onClick={() => handleExport(opt)}
                    disabled={exportLoading[opt.id]}
                    sx={{
                      bgcolor: opt.color,
                      "&:hover": { bgcolor: opt.color, opacity: 0.88 },
                    }}
                  >
                    {exportLoading[opt.id] ? "Đang Xuất..." : "Xuất CSV"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── TAB 2: HISTORY ── */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              <HistoryIcon
                sx={{ verticalAlign: "middle", mr: 1, fontSize: 20 }}
              />
              Lịch Sử Nhập / Xuất Dữ Liệu
            </Typography>
            <Button size="small" onClick={fetchImportHistory}>
              Làm mới
            </Button>
          </Box>

          {historyLoading ? (
            <LinearProgress />
          ) : importHistory.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <HistoryIcon
                sx={{ fontSize: 60, color: "text.disabled", mb: 1 }}
              />
              <Typography color="textSecondary">
                Chưa có lịch sử nhập/xuất nào
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Ngày/Giờ</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Loại Dữ Liệu</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Số Bản Ghi</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importHistory.map((record, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(record.timestamp).toLocaleString("vi-VN")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{record.row_count}</TableCell>
                      <TableCell>
                        <Chip
                          icon={
                            record.status === "success" ? (
                              <CheckCircleIcon />
                            ) : (
                              <ErrorIcon />
                            )
                          }
                          label={
                            record.status === "success"
                              ? "Thành công"
                              : "Thất bại"
                          }
                          color={
                            record.status === "success" ? "success" : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default ImportExportTools;
