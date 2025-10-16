// client/src/theme.js
import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode, // 'light' or 'dark'
      primary: { main: "#2563eb" }, // Tailwind blue-600
      secondary: { main: "#16a34a" },
      darkorange: { main: "#FF8C00" } // typical dark orange
// Tailwind green-600
    },
    typography: { fontFamily: "'Roboto', sans-serif" },
  });
