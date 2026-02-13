import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Info as InfoIcon,
  GetApp as DownloadIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const ImportExportTools = () => {
  const [loading, setLoading] = useState(false);
  const [importFormat, setImportFormat] = useState("csv");
  const [importFile, setImportFile] = useState(null);
  const [importType, setImportType] = useState("users");
  const [importHistory, setImportHistory] = useState([]);

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
      setImportFormat("csv");
      setImportType("users");
      fetchImportHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi nhập dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchImportHistory = async () => {
    try {
      const response = await axios.get("/api/admin/import/history");
      setImportHistory(response.data.data || []);
    } catch (error) {
      console.error("Fetch import history error:", error);
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
    } catch (error) {
      toast.error("Lỗi tải template");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Công Cụ Nhập/Xuất
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Nhập dữ liệu hàng loạt và quản lý lịch sử nhập
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Thông báo */}
        <Grid item xs={12}>
          <Alert icon={<InfoIcon />} severity="warning">
            Chỉ quản trị viên mới có thể nhập dữ liệu. Kiểm tra định dạng tệp
            trước khi nhập.
          </Alert>
        </Grid>

        {/* Phần Nhập Dữ Liệu */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Nhập Dữ Liệu Hàng Loạt
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Loại dữ liệu */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Loại Dữ Liệu
                </Typography>
                <RadioGroup
                  value={importType}
                  onChange={(e) => setImportType(e.target.value)}
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

              {/* Định dạng tệp */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Định Dạng Tệp
                </Typography>
                <RadioGroup
                  value={importFormat}
                  onChange={(e) => setImportFormat(e.target.value)}
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

              {/* Nút tải template */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => downloadTemplate(importType)}
              >
                Tải Template
              </Button>

              {/* Upload file */}
              <Box>
                <TextField
                  fullWidth
                  type="file"
                  inputProps={{
                    accept: importFormat === "csv" ? ".csv" : ".xlsx",
                  }}
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </Box>

              {importFile && (
                <Typography variant="body2" color="success.main">
                  ✓ Tệp đã chọn: {importFile.name}
                </Typography>
              )}

              {/* Nút nhập */}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<CloudUploadIcon />}
                onClick={handleImport}
                disabled={!importFile || loading}
              >
                {loading ? "Đang Nhập..." : "Nhập Dữ Liệu"}
              </Button>

              {loading && <LinearProgress />}
            </Box>
          </Paper>
        </Grid>

        {/* Hướng dẫn */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Hướng Dẫn
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    1. Chuẩn Bị Dữ Liệu
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Chuẩn bị tệp CSV hoặc Excel với dữ liệu cần nhập
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    2. Tải Template
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tải template để biết định dạng chính xác
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    3. Chọn Tệp
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Chọn tệp của bạn từ máy tính
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    4. Nhập Dữ Liệu
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Nhấp "Nhập Dữ Liệu" để bắt đầu quá trình
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lịch sử nhập */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Lịch Sử Nhập Dữ Liệu
            </Typography>

            {importHistory.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                Chưa có lịch sử nhập nào
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Ngày/Giờ</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Số Dòng</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Người Nhập</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importHistory.map((record, idx) => (
                      <TableRow key={idx}>
                        <TableCell variant="body2">
                          {new Date(record.timestamp).toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell>{record.type}</TableCell>
                        <TableCell>{record.row_count}</TableCell>
                        <TableCell>
                          <Chip
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
                        <TableCell>{record.imported_by}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ImportExportTools;
