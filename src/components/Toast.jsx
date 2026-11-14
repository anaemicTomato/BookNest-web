import { Snackbar, Alert } from "@mui/material";

// toast = { message, severity: "success" | "warning" | "error" } or null
export default function Toast({ toast, onClose }) {
  function handleClose(_, reason) {
    if (reason === "clickaway") return;
    onClose();
  }

  return (
    <Snackbar
      open={Boolean(toast)}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity={toast?.severity ?? "success"} variant="filled" onClose={onClose}>
        {toast?.message}
      </Alert>
    </Snackbar>
  );
}