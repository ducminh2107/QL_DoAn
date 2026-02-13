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
  TextField,
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
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const FacultyMajorManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    faculty_title: "",
    faculty_description: "",
    major_title: "",
    major_faculty: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facultyRes, majorRes] = await Promise.all([
        axios.get("/api/faculties"),
        axios.get("/api/majors"),
      ]);
      setFaculties(facultyRes.data.data || []);
      setMajors(majorRes.data.data || []);
    } catch (error) {
      console.error("Fetch data error:", error);
      toast.error("KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      if (tabValue === 0) {
        setFormData({
          faculty_title: item.faculty_title,
          faculty_description: item.faculty_description || "",
        });
      } else {
        setFormData({
          major_title: item.major_title,
          major_faculty: item.major_faculty?._id || item.major_faculty || "",
        });
      }
    } else {
      setEditingItem(null);
      setFormData(
        tabValue === 0
          ? { faculty_title: "", faculty_description: "" }
          : { major_title: "", major_faculty: "" },
      );
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (tabValue === 0) {
        if (editingItem) {
          await axios.put(`/api/faculties/${editingItem._id}`, formData);
          toast.success("Cáº­p nháº­t khoa thÃ nh cÃ´ng");
        } else {
          await axios.post("/api/faculties", formData);
          toast.success("Táº¡o khoa thÃ nh cÃ´ng");
        }
      } else {
        if (editingItem) {
          await axios.put(`/api/majors/${editingItem._id}`, formData);
          toast.success("Cáº­p nháº­t ngÃ nh thÃ nh cÃ´ng");
        } else {
          await axios.post("/api/majors", formData);
          toast.success("Táº¡o ngÃ nh thÃ nh cÃ´ng");
        }
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      toast.error("Lá»—i lÆ°u dá»¯ liá»‡u");
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a?")) {
      try {
        const endpoint =
          tabValue === 0 ? `/api/faculties/${itemId}` : `/api/majors/${itemId}`;
        await axios.delete(endpoint);
        toast.success("XÃ³a thÃ nh cÃ´ng");
        fetchData();
      } catch (error) {
        toast.error("Lá»—i xÃ³a dá»¯ liá»‡u");
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Quáº£n LÃ½ Khoa & NgÃ nh
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          ThÃªm Má»›i
        </Button>
      </Box>

      <Paper>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label="Quáº£n LÃ½ Khoa" />
          <Tab label="Quáº£n LÃ½ NgÃ nh" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <LinearProgress />
          ) : (
            <>
              {tabValue === 0 ? (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mb: 1 }}
                          >
                            Tá»•ng Khoa
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {faculties.length}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                          <TableCell sx={{ fontWeight: 600 }}>
                            TÃªn Khoa
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>MÃ´ Táº£</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">
                            HÃ nh Äá»™ng
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {faculties.map((faculty) => (
                          <TableRow key={faculty._id}>
                            <TableCell>{faculty.faculty_title}</TableCell>
                            <TableCell>{faculty.faculty_description}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(faculty)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(faculty._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mb: 1 }}
                          >
                            Tá»•ng NgÃ nh
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {majors.length}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                          <TableCell sx={{ fontWeight: 600 }}>
                            TÃªn NgÃ nh
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Khoa</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">
                            HÃ nh Äá»™ng
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {majors.map((major) => (
                          <TableRow key={major._id}>
                            <TableCell>{major.major_title}</TableCell>
                            <TableCell>
                              {major.major_faculty?.faculty_title ||
                                faculties.find(
                                  (f) =>
                                    f._id ===
                                    (major.major_faculty?._id ||
                                      major.major_faculty),
                                )?.faculty_title ||
                                "N/A"}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(major)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(major._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </>
          )}
        </Box>
      </Paper>

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {tabValue === 0
            ? editingItem
              ? "Cáº­p Nháº­t Khoa"
              : "ThÃªm Khoa Má»›i"
            : editingItem
              ? "Cáº­p Nháº­t NgÃ nh"
              : "ThÃªm NgÃ nh Má»›i"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {tabValue === 0 ? (
              <>
                <TextField
                  fullWidth
                  label="TÃªn Khoa"
                  name="faculty_title"
                  value={formData.faculty_title}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="MÃ´ Táº£"
                  name="faculty_description"
                  value={formData.faculty_description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="TÃªn NgÃ nh"
                  name="major_title"
                  value={formData.major_title}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Khoa"
                  name="major_faculty"
                  value={formData.major_faculty}
                  onChange={handleChange}
                  select
                  SelectProps={{ native: true }}
                >
                  <option value="">-- Chá»n Khoa --</option>
                  {faculties.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.faculty_title}
                    </option>
                  ))}
                </TextField>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Há»§y</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingItem ? "Cáº­p Nháº­t" : "Táº¡o"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FacultyMajorManagement;
