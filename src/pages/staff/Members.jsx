import { useEffect, useState } from "react";
import {
  Alert, Avatar, Button, Chip, CircularProgress, InputAdornment, Paper,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "../../components/PageHeader";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";
import { getStaffMembers, setMemberActive } from "../../api/staff";
import { deleteMember } from "../../api/admin";
import { useAuth } from "../../auth/AuthContext";
import "./Members.css";

const initials = (name) =>
  name.split(" ").slice(0, 2).map((word) => word[0]).join("");

function statusOf(m) {
  if (!m.isActive) return { label: "Deactivated", color: "default" };
  if (m.hasOverdue) return { label: "Overdue book", color: "error" };
  return { label: "Active", color: "success" };
}

export default function Members() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";   // only an admin sees the Delete button
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, setToast] = useState(null);
  const [target, setTarget] = useState(null);   // member waiting for deactivate confirmation
  const [deleting, setDeleting] = useState(null); // member waiting for delete confirmation
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      getStaffMembers(search.trim())
        .then((data) => {
          if (ignore) return;
          setRows(data);
          setError("");
        })
        .catch((err) => {
          if (!ignore) setError(err.message);
        });
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  async function toggle(member, isActive) {
    setBusy(true);
    try {
      const res = await setMemberActive(member.id, isActive);
      setToast({ message: res.message, severity: "success" });
      setTarget(null);
      reload();
    } catch (err) {
      setToast({ message: err.message, severity: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function remove(member) {
    setBusy(true);
    try {
      const res = await deleteMember(member.id);
      setToast({ message: res.message, severity: "success" });
    } catch (err) {
      setToast({ message: err.message, severity: "error" });   // e.g. the member has borrowing history
    } finally {
      setBusy(false);
      setDeleting(null);
      reload();
    }
  }

  return (
    <>
      <PageHeader title="Members" subtitle="Manage member accounts." />

      <Paper elevation={0} className="staff-members-card">
        <div className="staff-members-toolbar">
          <TextField
            fullWidth
            placeholder="Search by name, email or member ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Tooltip title="Needs the Register endpoint (module A)">
            <span>
              <Button variant="contained" disabled>
                Add member
              </Button>
            </span>
          </Tooltip>
        </div>

        {error && <Alert severity="error">{error}</Alert>}
        {!rows && !error && <CircularProgress className="staff-members-spinner" />}
        {rows && rows.length === 0 && <p className="staff-members-muted">No members found.</p>}

        {rows && rows.length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Books out</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((m) => {
                const status = statusOf(m);
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="staff-members-who">
                        <Avatar>{initials(m.fullName)}</Avatar>
                        <div>
                          <strong>{m.fullName}</strong>
                          <span className="staff-members-muted">{m.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{m.booksOut}</TableCell>
                    <TableCell>
                      <Chip size="small" label={status.label} color={status.color} />
                    </TableCell>
                    <TableCell>
                      <div className="staff-members-actions">
                        <Button variant="outlined" size="small" disabled>
                          Edit
                        </Button>
                        {m.isActive ? (
                          <Button variant="outlined" size="small" color="error" onClick={() => setTarget(m)}>
                            Deactivate
                          </Button>
                        ) : (
                          <>
                            <Button variant="outlined" size="small" onClick={() => toggle(m, true)} disabled={busy}>
                              Reactivate
                            </Button>
                            {isAdmin && (
                              <Button variant="outlined" size="small" color="error" onClick={() => setDeleting(m)}>
                                Delete
                              </Button>
                            )}
                          </>
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

      <ConfirmDialog
        open={Boolean(target)}
        title="Deactivate member?"
        message={`${target?.fullName ?? "This member"} will no longer be able to log in or borrow books. Their loan history is kept.`}
        confirmLabel="Deactivate"
        busy={busy}
        onConfirm={() => toggle(target, false)}
        onCancel={() => setTarget(null)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this member account?"
        message={`Are you really sure you want to delete ${deleting?.fullName ?? "this member"}? The account will be removed for good and this cannot be undone.`}
        confirmLabel="Yes, delete"
        danger
        busy={busy}
        onConfirm={() => remove(deleting)}
        onCancel={() => setDeleting(null)}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
