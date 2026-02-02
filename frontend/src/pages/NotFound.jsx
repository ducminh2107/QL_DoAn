import { Typography, Container, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <Container>
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h1" color="primary">
          404
        </Typography>
        <Typography variant="h5" gutterBottom>
          Oops! Page Not Found
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}

export default NotFound;
