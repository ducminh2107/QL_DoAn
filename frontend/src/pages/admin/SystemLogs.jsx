import React, { useState, useEffect, useMemo } from "react";
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
  TextField,
  MenuItem,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCollection, setFilterCollection] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [filterCollection]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/system-logs", {
        params:
          filterCollection !== "all"
            ? { collection: filterCollection }
            : undefined,
      });
      setLogs(response.data.data || []);
    } catch (error) {
      console.error("Fetch logs error:", error);
      toast.error("KhÃ´ng thá»ƒ táº£i nháº­t kÃ½ há»‡ thá»‘ng");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLogs = async () => {
    try {
      const response = await axios.get("/api/admin/system-logs/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "system-logs.csv");
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (error) {
      toast.error("Lá»—i táº£i nháº­t kÃ½");
    }
  };

  const collections = useMemo(() => {
    return Array.from(
      new Set(logs.map((log) => log.collection_name).filter(Boolean)),
    );
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    const search = searchTerm.toLowerCase();
    if (!search) return true;
    return (
      log.action?.toLowerCase().includes(search) ||
      log.collection_name?.toLowerCase().includes(search) ||
      log.user_id?.toLowerCase().includes(search)
    );
  });

  const uniqueActions = new Set(
    logs.map((log) => log.action).filter(Boolean),
  ).size;
  const uniqueCollections = collections.length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Nháº­t KÃ½ Há»‡ Thá»‘ng
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Xem vÃ  giÃ¡m sÃ¡t cÃ¡c hoáº¡t Ä‘á»™ng cá»§a há»‡ thá»‘ng
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {/* Filters */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    placeholder="TÃ¬m kiáº¿m theo action, collection, user_id..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    value={filterCollection}
                    onChange={(e) => setFilterCollection(e.target.value)}
                  >
                    <MenuItem value="all">Táº¥t Cáº£ Collection</MenuItem>
                    {collections.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadLogs}
                  >
                    Táº£i
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Stats */}
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
                      Tá»•ng Nháº­t KÃ½
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {logs.length}
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
                      Action
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {uniqueActions}
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
                      Collection
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {uniqueCollections}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Logs Table */}
          <Grid item xs={12}>
            {filteredLogs.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography color="textSecondary">
                  KhÃ´ng cÃ³ nháº­t kÃ½ nÃ o
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ overflow: "hidden" }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Thá»i Gian
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Action
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Collection
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          User Id
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Changes
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLogs.map((log, idx) => (
                        <TableRow key={idx}>
                          <TableCell variant="body2">
                            {new Date(log.timestamp).toLocaleString("vi-VN")}
                          </TableCell>
                          <TableCell variant="body2">{log.action}</TableCell>
                          <TableCell variant="body2">
                            {log.collection_name || "-"}
                          </TableCell>
                          <TableCell variant="body2">
                            {log.user_id || "System"}
                          </TableCell>
                          <TableCell variant="body2">
                            {log.ip_address || "-"}
                          </TableCell>
                          <TableCell variant="body2">
                            {typeof log.changes === "object"
                              ? JSON.stringify(log.changes)
                              : log.changes || ""}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default SystemLogs;
