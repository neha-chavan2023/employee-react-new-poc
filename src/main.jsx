import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { DataProvider } from "./context/DataContext.jsx";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#5b5bd6", dark: "#4444b8", light: "#eeeeff" },
    secondary: { main: "#0f9f92" },
    background: { default: "#f6f7fb", paper: "#ffffff" },
    text: { primary: "#20243a", secondary: "#737990" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Arial, sans-serif',
    h4: { fontWeight: 750, letterSpacing: "-0.04em" },
    h5: { fontWeight: 700, letterSpacing: "-0.03em" },
    h6: { fontWeight: 700, letterSpacing: "-0.02em" },
    button: { textTransform: "none", fontWeight: 650 },
  },
  components: {
    MuiCard: { styleOverrides: { root: { border: "1px solid #eceef4", boxShadow: "0 8px 26px rgba(34, 39, 68, 0.045)" } } },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTableCell: { styleOverrides: { head: { color: "#737990", fontWeight: 700, backgroundColor: "#fafaff" } } },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
