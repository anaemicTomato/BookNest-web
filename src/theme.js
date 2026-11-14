import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: { main: "#4bc3a8", contrastText: "#fff" },
    background: { default: "#dffcf3" },
  },
  typography: {
    fontFamily: '"Manrope", system-ui, sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#4bc3a8",
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 14, boxShadow: "none" },
      },
    },
        MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 16 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

export default theme;