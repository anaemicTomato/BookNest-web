import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "../../components/PageHeader";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";
import { useAuth } from "../../auth/AuthContext";
import {
  createStaff,
  deleteStaff,
  getStaff,
  resetStaffPassword,
  setStaffActive,
  updateStaff,
} from "../../api/admin";
import "./ManageStaff.css";

const EMPTY_FORM = { fullName: "", email: "", username: "", password: "", role: "staff" };

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

export default function ManageStaff() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);   // change it to fetch the list again

  const [editing, setEditing] = useState(null);    // the row being edited, or null when adding
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [target, setTarget] = useState(null);      // the row waiting for Remove confirmation
  const [deleting, setDeleting] = useState(null);  // the row waiting for Delete confirmation
  const [filter, setFilter] = useState("all");     // all, active or removed
  const [newPassword, setNewPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let ignore = false;
    getStaff(search.trim())
      .then((data) => {
        if (ignore) return;
        setRows(data);
        setError("");
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;   // the page closed, or a newer request replaced this one
    };
  }, [search, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);
  const change = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  function startAdd() {
    setEditing(null);
    setNewPassword("");
    setForm(EMPTY_FORM);
    setFormError("");
  }

  function startEdit(row) {
    setEditing(row);
    setNewPassword("");
    setForm({ ...EMPTY_FORM, fullName: row.fullName, email: row.email, username: row.username, role: row.role });
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const res = editing
        ? await updateStaff(editing.id, {
            fullName: form.fullName,
            email: form.email,
            role: form.role,
            isActive: editing.isActive,
          })
        : await createStaff(form);
      setToast({ message: res.message, severity: "success" });
      startAdd();
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changeActive(row, isActive) {
    setBusy(true);
    try {
      const res = await setStaffActive(row.id, isActive);
      setToast({ message: res.message, severity: "success" });
    } catch (err) {
      setToast({ message: err.message, severity: "error" });
    } finally {
      setBusy(false);
      setTarget(null);
      reload();
    }
  }

  async function removeForGood(row) {
    setBusy(true);
    try {
      const res = await deleteStaff(row.id);
      setToast({ message: res.message, severity: "success" });
      if (editing?.id === row.id) startAdd();
    } catch (err) {
      setToast({ message: err.message, severity: "error" });
    } finally {
      setBusy(false);
      setDeleting(null);
      reload();
    }
  }

  async function changePassword() {
    setPwBusy(true);
    try {
      const res = await resetStaffPassword(editing.id, newPassword);
      setToast({ message: res.message, severity: "success" });
      setNewPassword("");
    } catch (err) {
      setToast({ message: err.message, severity: "error" });
    } finally {
      setPwBusy(false);
    }
  }

  const counts = {
    all: rows?.length ?? 0,
    active: rows?.filter((r) => r.isActive).length ?? 0,
    removed: rows?.filter((r) => !r.isActive).length ?? 0,
  };
  const shown = (rows ?? []).filter(
    (r) => filter === "all" || (filter === "active" ? r.isActive : !r.isActive),
  );

  return (
    <>
      <PageHeader title="Manage Staff" subtitle="Add, edit, remove and delete staff accounts." />

      {error && <Alert severity="error">{error}</Alert>}

      <div className="admin-staff-layout">
        <Paper elevation={0} className="admin-staff-card admin-staff-list">
          <div className="admin-staff-top">
            <TextField
              fullWidth
              placeholder="Search staff"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button variant="contained" onClick={startAdd}>
              Add account
            </Button>
          </div>

          {rows && (
            <div className="admin-staff-filters">
              {[
                ["all", "All"],
                ["active", "Active"],
                ["removed", "Removed"],
              ].map(([key, label]) => (
                <Chip
                  key={key}
                  label={`${label} (${counts[key]})`}
                  color={filter === key ? "primary" : "default"}
                  variant={filter === key ? "filled" : "outlined"}
                  onClick={() => setFilter(key)}
                />
              ))}
            </div>
          )}

          {!rows && !error && (
            <div className="admin-staff-empty">
              <CircularProgress />
            </div>
          )}
          {rows && shown.length === 0 && (
            <div className="admin-staff-empty">No staff accounts found.</div>
          )}
          {rows && shown.length > 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Staff</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {shown.map((row) => {
                  const isMe = row.fullName === user.fullName;   // the API also blocks removing yourself
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="admin-staff-person">
                          <Avatar className="admin-staff-avatar">{initials(row.fullName)}</Avatar>
                          <div>
                            <strong>{row.fullName}</strong>
                            <span className="admin-staff-muted">{row.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.role === "admin" ? "Admin" : "Staff"}
                          color={row.role === "admin" ? "default" : "info"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.isActive ? "Active" : "Removed"}
                          color={row.isActive ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <div className="admin-staff-actions">
                          <Button size="small" variant="outlined" onClick={() => startEdit(row)}>
                            Edit
                          </Button>
                          {row.isActive && !isMe && (
                            <Button size="small" variant="outlined" color="error" onClick={() => setTarget(row)}>
                              Remove
                            </Button>
                          )}
                          {!row.isActive && (
                            <Button size="small" variant="outlined" onClick={() => changeActive(row, true)} disabled={busy}>
                              Restore
                            </Button>
                          )}
                          {!row.isActive && row.role === "staff" && !isMe && (
                            <Button size="small" variant="outlined" color="error" onClick={() => setDeleting(row)}>
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Paper elevation={0} className="admin-staff-card admin-staff-form">
          <h2>{editing ? "Edit staff account" : "Add staff account"}</h2>
          <form onSubmit={handleSubmit}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Full name" value={form.fullName} onChange={change("fullName")} required fullWidth />
            <TextField label="Email" type="email" value={form.email} onChange={change("email")} required fullWidth />
            <TextField
              label="Username"
             
              value={form.username}
              onChange={change("username")}
              disabled={Boolean(editing)}   // the API does not change usernames
              required
              fullWidth
            />
            {!editing && (
              <TextField
                label="Temporary password"
                type="password"
                value={form.password}
                onChange={change("password")}
                helperText="At least 8 characters."
                required
                fullWidth
              />
            )}
            <TextField select label="Role" value={form.role} onChange={change("role")} fullWidth>
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <div className="admin-staff-buttons">
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Saving…" : editing ? "Save changes" : "Create account"}
              </Button>
              <Button variant="outlined" onClick={startAdd} disabled={saving}>
                Cancel
              </Button>
            </div>
          </form>

          {editing && (
            <div className="admin-staff-password">
              <h3>Reset password</h3>
              <p className="admin-staff-muted">
                Type a new temporary password for {editing.fullName}, then share it with them.
              </p>
              <TextField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                helperText="At least 8 characters."
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={changePassword}
                disabled={pwBusy || newPassword.length < 8}
              >
                {pwBusy ? "Saving…" : "Set new password"}
              </Button>
            </div>
          )}
        </Paper>
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        title="Remove this account?"
        message={`${target?.fullName ?? ""} will no longer be able to log in. Their history is kept and you can restore the account later.`}
        confirmLabel="Remove"
        busy={busy}
        onConfirm={() => changeActive(target, false)}
        onCancel={() => setTarget(null)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this staff account?"
        message={`Are you really sure you want to delete ${deleting?.fullName ?? "this account"}? The account will be removed for good and this cannot be undone.`}
        confirmLabel="Yes, delete"
        danger
        busy={busy}
        onConfirm={() => removeForGood(deleting)}
        onCancel={() => setDeleting(null)}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
