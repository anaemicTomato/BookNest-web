// src/pages/staff/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert, Button, Chip, CircularProgress, Paper,
  Table, TableBody, TableCell, TableHead, TableRow,
} from "@mui/material";
import PageHeader from "../../components/PageHeader";
import { getStaffDashboard } from "../../api/staff";
import "./Dashboard.css";

const ACTION_COLOR = {
  Borrowed: "success",
  Returned: "default",
  Reserved: "warning",
  "Returned late": "error",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getStaffDashboard()
      .then((res) => {
        if (ignore) return;
        setData(res);
        setError("");
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <PageHeader title="Staff dashboard" subtitle="Today at the library desk." />

      {error && <Alert severity="error">{error}</Alert>}
      {!data && !error && (
        <div className="staff-dash-loading">
          <CircularProgress />
        </div>
      )}

      {data && (
        <>
          <div className="staff-dash-stats">
            <Paper elevation={0} className="staff-dash-card staff-dash-stat">
              <span className="staff-dash-muted">Active loans</span>
              <strong>{data.activeLoans}</strong>
            </Paper>
            <Paper elevation={0} className="staff-dash-card staff-dash-stat">
              <span className="staff-dash-muted">Due today</span>
              <strong className="staff-dash-warn">{data.dueToday}</strong>
            </Paper>
            <Paper elevation={0} className="staff-dash-card staff-dash-stat">
              <span className="staff-dash-muted">Overdue</span>
              <strong className="staff-dash-danger">{data.overdue}</strong>
            </Paper>
            <Paper elevation={0} className="staff-dash-card staff-dash-stat">
              <span className="staff-dash-muted">Reservations ready</span>
              <strong>{data.reservationsReady}</strong>
            </Paper>
          </div>

          <div className="staff-dash-row">
            <Paper elevation={0} className="staff-dash-card staff-dash-activity">
              <h2>Recent activity</h2>
              {data.recentActivity.length === 0 ? (
                <p className="staff-dash-muted">No activity yet.</p>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Member</TableCell>
                      <TableCell>Book</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentActivity.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.member}</TableCell>
                        <TableCell>{row.book}</TableCell>
                        <TableCell>
                          <Chip size="small" label={row.action} color={ACTION_COLOR[row.action]} />
                        </TableCell>
                        <TableCell>{row.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>

            <Paper elevation={0} className="staff-dash-card staff-dash-actions">
              <h2>Quick actions</h2>
              <Button variant="contained" onClick={() => navigate("/staff/issue-return")}>
                Issue a book
              </Button>
              <Button variant="outlined" onClick={() => navigate("/staff/issue-return?tab=return")}>
                Return a book
              </Button>
              <Button variant="outlined" onClick={() => navigate("/staff/manage-books")}>
                Add a book
              </Button>
            </Paper>
          </div>
        </>
      )}
    </>
  );
}