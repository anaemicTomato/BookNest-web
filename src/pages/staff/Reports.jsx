import { useEffect, useState } from "react";
import {
  Alert, Button, Chip, CircularProgress, Paper, TextField,
  Table, TableBody, TableCell, TableHead, TableRow,
} from "@mui/material";
import PageHeader from "../../components/PageHeader";
import {
  getActiveLoansReport, getOverdueReport, getPopularReport,
} from "../../api/staff";
import "./Reports.css";

const isoDay = (d) => d.toISOString().slice(0, 10);

// "Maria Santos" -> "Maria S."
const shortName = (name) => {
  const parts = name.trim().split(" ");
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : name;
};

export default function Reports() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return isoDay(d);
  });
  const [to, setTo] = useState(() => isoDay(new Date()));
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    Promise.all([getActiveLoansReport(), getOverdueReport(), getPopularReport(from, to)])
      .then(([active, overdue, popular]) => {
        if (ignore) return;
        setData({ active, overdue, popular });
        setError("");
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
    // from and to are read when "Generate report" bumps reloadKey, not on every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const generate = () => setReloadKey((key) => key + 1);
  const topCount = data?.popular[0]?.timesBorrowed ?? 1;

  return (
    <>
      <PageHeader title="Reports" subtitle="Generate reports for a date range." />

      <div className="staff-reports-toolbar">
        <TextField
          type="date" size="small" label="From" value={from}
          onChange={(e) => setFrom(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          type="date" size="small" label="To" value={to}
          onChange={(e) => setTo(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button variant="contained" onClick={generate}>Generate report</Button>
        <Button variant="outlined" onClick={() => window.print()}>Export PDF</Button>
      </div>

      {error && <Alert severity="error">{error}</Alert>}
      {!data && !error && <CircularProgress className="staff-reports-spinner" />}

      {data && (
        <div className="staff-reports-grid">
          <Paper elevation={0} className="staff-reports-card">
            <h2>Active loans</h2>
            {data.active.length === 0 ? (
              <p className="staff-reports-muted">No active loans.</p>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Book</TableCell>
                    <TableCell>Due</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.active.map((r) => (
                    <TableRow key={r.loanId}>
                      <TableCell>{shortName(r.member)}</TableCell>
                      <TableCell>{r.title}</TableCell>
                      <TableCell>{r.dueDate.replace(/, \d{4}$/, "")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          <Paper elevation={0} className="staff-reports-card">
            <h2>Overdue books</h2>
            {data.overdue.length === 0 ? (
              <p className="staff-reports-muted">Nothing is overdue.</p>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Book</TableCell>
                    <TableCell>Late</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.overdue.map((r) => (
                    <TableRow key={r.loanId}>
                      <TableCell>{shortName(r.member)}</TableCell>
                      <TableCell>{r.title}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={r.daysLate >= 2 ? "error" : "warning"}
                          label={`${r.daysLate} ${r.daysLate === 1 ? "day" : "days"}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          <Paper elevation={0} className="staff-reports-card">
            <h2>Popular books</h2>
            {data.popular.length === 0 ? (
              <p className="staff-reports-muted">No loans in this date range.</p>
            ) : (
              data.popular.map((b) => (
                <div key={b.id} className="staff-reports-bar">
                  <span className="staff-reports-bar-name">{b.title}</span>
                  <div className="staff-reports-bar-track">
                    <div
                      className="staff-reports-bar-fill"
                      style={{ width: `${(b.timesBorrowed / topCount) * 100}%` }}
                    />
                  </div>
                  <span className="staff-reports-bar-count">{b.timesBorrowed}</span>
                </div>
              ))
            )}
          </Paper>
        </div>
      )}
    </>
  );
}
