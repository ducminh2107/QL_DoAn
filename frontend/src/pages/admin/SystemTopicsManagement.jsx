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
  MenuItem,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const SystemTopicsManagement = () => {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    topic_title: "",
    topic_description: "",
    topic_category: "",
    topic_major: "",
    topic_max_members: 1,
    topic_registration_period: "",
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const [topicsRes, categoriesRes, majorsRes] = await Promise.all([
        axios.get("/api/admin/system-topics"),
        axios.get("/api/topic-categories"),
        axios.get("/api/majors"),
      ]);
      setTopics(topicsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setMajors(majorsRes.data.data || []);
    } catch (error) {
      console.error("Fetch system topics error:", error);
      toast.error(
        error.response?.data?.message ||
          "KhÃ´ng thá»ƒ táº£i danh sÃ¡ch Ä‘á» tÃ i há»‡ thá»‘ng",
      );
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
      setFormData({
        topic_title: topic.topic_title || "",
        topic_description: topic.topic_description || "",
        topic_category: topic.topic_category?._id || topic.topic_category || "",
        topic_major: topic.topic_major?._id || topic.topic_major || "",
        topic_max_members: topic.topic_max_members || 1,
        topic_registration_period: topic.topic_registration_period || "",
      });
    } else {
      setEditingTopic(null);
      setFormData({
        topic_title: "",
        topic_description: "",
        topic_category: "",
        topic_major: "",
        topic_max_members: 1,
        topic_registration_period: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTopic(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editingTopic) {
        await axios.put(`/api/admin/system-topics/${editingTopic._id}`, formData);
        toast.success("Cáº­p nháº­t Ä‘á» tÃ i thÃ nh cÃ´ng");
      } else {
        await axios.post("/api/admin/system-topics", formData);
        toast.success("Táº¡o Ä‘á» tÃ i thÃ nh cÃ´ng");
      }
      handleCloseDialog();
      fetchTopics();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lá»—i lÆ°u Ä‘á» tÃ i",
      );
    }
  };

  const handleDelete = async (topicId) => {
    if (window.confirm("Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a Ä‘á» tÃ i nÃ y?")) {
      try {
        await axios.delete(`/api/admin/system-topics/${topicId}`);
        toast.success("XÃ³a Ä‘á» tÃ i thÃ nh cÃ´ng");
        fetchTopics();
      } catch (error) {
        toast.error("Lá»—i xÃ³a Ä‘á» tÃ i");
      }
    }
  };

  const uniqueCategories = new Set(
    topics
      .map((topic) => topic.topic_category?._id || topic.topic_category)
      .filter(Boolean),
  ).size;
  const uniqueMajors = new Set(
    topics
      .map((topic) => topic.topic_major?._id || topic.topic_major)
      .filter(Boolean),
  ).size;

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
            Quáº£n LÃ½ Äá» TÃ i Há»‡ Thá»‘ng
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Quáº£n lÃ½ kho Ä‘á» tÃ i cÃ³ sáºµn trong há»‡ thá»‘ng
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

      {loading ? (
        <LinearProgress />
      ) : topics.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="textSecondary">
            KhÃ´ng cÃ³ Ä‘á» tÃ i há»‡ thá»‘ng nÃ o
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Tá»•ng Äá» TÃ i
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {topics.length}
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
                      Danh Má»¥c
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {uniqueCategories}
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
                      ChuyÃªn NgÃ nh
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {uniqueMajors}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ overflow: "hidden" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>TÃªn Äá» TÃ i</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Danh Má»¥c</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>ChuyÃªn NgÃ nh</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Sinh ViÃªn Max
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        HÃ nh Äá»™ng
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topics.map((topic) => (
                      <TableRow key={topic._id}>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {topic.topic_title}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {topic.topic_description?.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {topic.topic_category?.topic_category_title || "N/A"}
                        </TableCell>
                        <TableCell>
                          {topic.topic_major?.major_title || "N/A"}
                        </TableCell>
                        <TableCell>{topic.topic_max_members}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(topic)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(topic._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTopic ? "Cáº­p Nháº­t Äá» TÃ i" : "ThÃªm Äá» TÃ i Má»›i"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="TÃªn Äá» TÃ i"
              name="topic_title"
              value={formData.topic_title}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="MÃ´ Táº£"
              name="topic_description"
              value={formData.topic_description}
              onChange={handleChange}
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Danh Má»¥c"
              name="topic_category"
              value={formData.topic_category}
              onChange={handleChange}
              select
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.topic_category_title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="ChuyÃªn NgÃ nh"
              name="topic_major"
              value={formData.topic_major}
              onChange={handleChange}
              select
              required
            >
              {majors.map((major) => (
                <MenuItem key={major._id} value={major._id}>
                  {major.major_title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Sá»‘ Sinh ViÃªn Tá»‘i Äa"
              name="topic_max_members"
              type="number"
              value={formData.topic_max_members}
              onChange={handleChange}
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              label="KÃ½ Ä‘Äƒng kÃ½ (VD: HK1-2024)"
              name="topic_registration_period"
              value={formData.topic_registration_period}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Há»§y</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingTopic ? "Cáº­p Nháº­t" : "Táº¡o"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SystemTopicsManagement;
