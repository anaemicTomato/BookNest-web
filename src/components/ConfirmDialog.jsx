import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,   // true = red confirm button (used for deletes)
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" color={danger ? "error" : "primary"} onClick={onConfirm} disabled={busy}>
          {busy ? "Please wait…" : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}