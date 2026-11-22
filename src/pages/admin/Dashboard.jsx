import { useEffect, useState } from "react";
import { Alert, CircularProgress, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import PageHeader from "../../components/PageHeader";
import { getMetrics } from "../../api/admin";
import "./Dashboard.css";

const BAR_COLORS = ["#4bc3a8", "#03a9e0", "#15c9aa", "#1190ff", "#e9cf4a"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getMetrics()
      .then((result) => {
        if (ignore) return;
        setData(result);
        setError("");
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;   // the page closed, or a newer request replaced this one
    };
  }, []);

  // The tallest bar is 100%. The other bars are measured against it.
  const maxLoans = data ? Math.max(1, ...data.loansPerMonth.map((m) => m.loans)) : 1;
  const maxBooks = data ? Math.max(1, ...data.booksByCategory.map((c) => c.books)) : 1;

  return (
    <>
      <PageHeader title="System metrics" subtitle="How the library is doing." />

      {error && <Alert severity="error">{error}</Alert>}
      {!data && !error && (
        <div className="admin-dash-loading">
          <CircularProgress />
        </div>
      )}

      {data && (
        <>
          <div className="admin-dash-stats">
            <Paper elevation={0} className="admin-dash-card admin-dash-stat">
              <span className="admin-dash-muted">Total books</span>
              <strong>{data.totalBooks.toLocaleString()}</strong>
            </Paper>
            <Paper elevation={0} className="admin-dash-card admin-dash-stat">
              <span className="admin-dash-muted">Members</span>
              <strong>{data.members.toLocaleString()}</strong>
            </Paper>
            <Paper elevation={0} className="admin-dash-card admin-dash-stat">
              <span className="admin-dash-muted">Staff accounts</span>
              <strong>{data.staffAccounts.toLocaleString()}</strong>
            </Paper>
            <Paper elevation={0} className="admin-dash-card admin-dash-stat">
              <span className="admin-dash-muted">Active loans</span>
              <strong>{data.activeLoans.toLocaleString()}</strong>
            </Paper>
          </div>

          <div className="admin-dash-charts">
            <Paper elevation={0} className="admin-dash-card admin-dash-months">
              <h2>Loans per month</h2>
              <div className="admin-dash-chart">
                {data.loansPerMonth.map((m, index) => {
                  const isCurrent = index === data.loansPerMonth.length - 1;   // this month is not finished yet
                  return (
                    <div key={`${m.month}-${index}`} className="admin-dash-col">
                      <span className="admin-dash-value">{m.loans}</span>
                      <div className="admin-dash-track">
                        <div
                          className={`admin-dash-bar${isCurrent ? " admin-dash-bar-current" : ""}`}
                          style={{ height: `${(m.loans / maxLoans) * 100}%` }}
                        />
                      </div>
                      <span className="admin-dash-muted">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </Paper>

            <Paper elevation={0} className="admin-dash-card admin-dash-categories">
              <h2>Books by category</h2>
              {data.booksByCategory.length === 0 ? (
                <p className="admin-dash-muted">No categories yet.</p>
              ) : (
                data.booksByCategory.map((c, index) => (
                  <div key={c.category} className="admin-dash-row">
                    <span>{c.category}</span>
                    <div className="admin-dash-line">
                      <div
                        className="admin-dash-fill"
                        style={{
                          width: `${(c.books / maxBooks) * 100}%`,
                          background: BAR_COLORS[index % BAR_COLORS.length],
                        }}
                      />
                    </div>
                    <strong>{c.books}</strong>
                  </div>
                ))
              )}
            </Paper>
          </div>

          <Paper elevation={0} className="admin-dash-card admin-dash-activity">
            <h2>Recent system activity</h2>
            {(data.recentActivity ?? []).length === 0 ? (
              <p className="admin-dash-muted">No activity yet. Actions by staff and admins will show up here.</p>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Who</TableCell>
                    <TableCell>What</TableCell>
                    <TableCell align="right">Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recentActivity.map((a, index) => (
                    <TableRow key={`${a.who}-${a.time}-${index}`}>
                      <TableCell>{a.who}</TableCell>
                      <TableCell>{a.what}</TableCell>
                      <TableCell align="right">{a.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </>
      )}
    </>
  );
}
