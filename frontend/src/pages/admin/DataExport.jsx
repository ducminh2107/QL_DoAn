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
} from "@mui/material";
import { GetApp as DownloadIcon, Info as InfoIcon } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const DataExport = () => {
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [selectedData, setSelectedData] = useState({
    users: true,
    topics: true,
    registrations: true,
    grades: false,
  });
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const handleDataChange = (e) => {
    const { name, checked } = e.target;
    setSelectedData({ ...selectedData, [name]: checked });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({ ...dateRange, [name]: value });
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "/api/admin/export/data",
        {
          format: exportFormat,
          data: selectedData,
          dateRange,
        },
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const ext = exportFormat === "csv" ? "csv" : "xlsx";
      link.setAttribute("download", `export_${new Date().getTime()}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);

      toast.success("Xuất dữ liệu thành công");
    } catch (error) {
      toast.error("Lỗi xuất dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Xuất Dữ Liệu
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Xuất dữ liệu hệ thống ra file
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Thông báo */}
        <Grid item xs={12}>
          <Alert icon={<InfoIcon />} severity="info">
            Chọn các dữ liệu bạn muốn xuất và định dạng mong muốn
          </Alert>
        </Grid>

        {/* Định dạng */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Chọn Định Dạng
            </Typography>
            <RadioGroup
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel
                value="xlsx"
                control={<Radio />}
                label="Excel (XLSX)"
              />
              <FormControlLabel value="json" control={<Radio />} label="JSON" />
            </RadioGroup>
          </Paper>
        </Grid>

        {/* Khoảng thời gian */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Khoảng Thời Gian (Tùy Chọn)
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Từ Ngày"
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                fullWidth
                label="Đến Ngày"
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Chọn dữ liệu */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Chọn Dữ Liệu Cần Xuất
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    name="users"
                    checked={selectedData.users}
                    onChange={handleDataChange}
                  />
                }
                label="Dữ Liệu Người Dùng"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="topics"
                    checked={selectedData.topics}
                    onChange={handleDataChange}
                  />
                }
                label="Dữ Liệu Đề Tài"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="registrations"
                    checked={selectedData.registrations}
                    onChange={handleDataChange}
                  />
                }
                label="Dữ Liệu Đăng Ký"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="grades"
                    checked={selectedData.grades}
                    onChange={handleDataChange}
                  />
                }
                label="Dữ Liệu Điểm Số"
              />
            </FormGroup>
          </Paper>
        </Grid>

        {/* Nút xuất */}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={loading || !Object.values(selectedData).some((v) => v)}
          >
            {loading ? "Đang Xuất..." : "Xuất Dữ Liệu"}
          </Button>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Grid>

        {/* Thông tin */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Hướng Dẫn Sử Dụng
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ margin: "8px 0" }}>
                  <li>Chọn định dạng tệp (CSV, Excel hoặc JSON)</li>
                  <li>Chọn loại dữ liệu cần xuất</li>
                  <li>Tùy chọn: Chỉ định khoảng thời gian</li>
                  <li>Nhấp "Xuất Dữ Liệu" để tải file</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DataExport;
