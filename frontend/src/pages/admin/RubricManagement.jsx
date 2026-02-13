import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Grid,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const RubricManagement = () => {
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [topicCategories, setTopicCategories] = useState([]);
  const [formData, setFormData] = useState({
    rubric_name: "",
    rubric_note: "",
    rubric_category: "instructor",
    rubric_topic_category: "",
    rubric_template: true,
    rubric_evaluations: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rubricRes, categoryRes] = await Promise.all([
        axios.get("/api/rubrics"),
        axios.get("/api/topic-categories"),
      ]);
      setRubrics(rubricRes.data.data || []);
      setTopicCategories(categoryRes.data.data || []);
    } catch {
      toast.error("KhÃ´ng thá»ƒ táº£i danh sÃ¡ch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        rubric_name: item.rubric_name || "",
        rubric_note: item.rubric_note || "",
        rubric_category: item.rubric_category || "instructor",
        rubric_topic_category:
          item.rubric_topic_category?._id || item.rubric_topic_category || "",
        rubric_template: item.rubric_template ?? true,
        rubric_evaluations: item.rubric_evaluations || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        rubric_name: "",
        rubric_note: "",
        rubric_category: "instructor",
        rubric_topic_category: "",
        rubric_template: true,
        rubric_evaluations: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`/api/rubrics/${editingItem._id}`, formData);
        toast.success("Cáº­p nháº­t thÃ nh cÃ´ng");
      } else {
        await axios.post("/api/rubrics", formData);
        toast.success("ThÃªm thÃ nh cÃ´ng");
      }
      handleClose();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tÃ¡c tháº¥t báº¡i");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a rubric nÃ y?")) {
      try {
        await axios.delete(`/api/rubrics/${id}`);
        toast.success("XÃ³a thÃ nh cÃ´ng");
        fetchData();
      } catch (error) {
        toast.error("XÃ³a tháº¥t báº¡i");
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Quáº£n lÃ½ Rubric cháº¥m Ä‘iá»ƒm
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          ThÃªm Rubric
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>TÃªn Rubric</TableCell>
                <TableCell>Loáº¡i</TableCell>
                <TableCell>Danh má»¥c Ä‘á» tÃ i</TableCell>
                <TableCell>Sá»‘ tiÃªu chÃ­</TableCell>
                <TableCell align="right">Thao tÃ¡c</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rubrics.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.rubric_name || "Untitled"}</TableCell>
                  <TableCell>{item.rubric_category || "N/A"}</TableCell>
                  <TableCell>
                    {item.rubric_topic_category?.topic_category_title || "N/A"}
                  </TableCell>
                  <TableCell>{item.rubric_evaluations?.length || 0}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpen(item)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingItem ? "Chá»‰nh sá»­a Rubric" : "ThÃªm Rubric má»›i"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="TÃªn Rubric"
                  required
                  value={formData.rubric_name}
                  onChange={(e) =>
                    setFormData({ ...formData, rubric_name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Loáº¡i Rubric"
                  required
                  value={formData.rubric_category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rubric_category: e.target.value,
                    })
                  }
                >
                  <MenuItem value="instructor">Giáº£ng viÃªn hÆ°á»›ng dáº«n</MenuItem>
                  <MenuItem value="reviewer">Giáº£ng viÃªn pháº£n biá»‡n</MenuItem>
                  <MenuItem value="assembly">Há»™i Ä‘á»“ng</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Danh má»¥c Ä‘á» tÃ i Ã¡p dá»¥ng"
                  value={formData.rubric_topic_category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rubric_topic_category: e.target.value,
                    })
                  }
                >
                  <MenuItem value="">TÃ¢́t cả</MenuItem>
                  {topicCategories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.topic_category_title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ghi chÃº"
                  multiline
                  rows={3}
                  value={formData.rubric_note}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rubric_note: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Há»§y</Button>
            <Button type="submit" variant="contained">
              LÆ°u
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default RubricManagement;
