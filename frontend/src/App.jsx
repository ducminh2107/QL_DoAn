import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppRoutes from "./routes";

const theme = createTheme({
  palette: {
    primary: {
      main: "#42a5f5", // Brighter blue from the screenshot
      dark: "#1e88e5",
    },
    background: {
      default: "#f8f9fb", // Light grayish background
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </ThemeProvider>
  );
}

export default App;
