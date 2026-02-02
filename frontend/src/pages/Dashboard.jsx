import { Typography, Container, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <Container>
      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome to Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Thesis Management System is ready.
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate("/login")}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
}

export default Dashboard;
