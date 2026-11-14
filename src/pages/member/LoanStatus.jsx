import { useEffect, useState } from "react";
import {
  Alert,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import PageHeader from "../../components/PageHeader";
import { getLoanStatus } from "../../api/member";
import { dueStatus, peso } from "../../utils/loans";
import "./LoanStatus.css";

function ordinal(n) {
  const suffix = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}

export default function LoanStatus() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getLoanStatus()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <PageHeader title="Loan Status" subtitle="Deadlines, hold requests and fines in one place." />

      {error && <Alert severity="error">{error}</Alert>}
      {!data && !error && (
        <div className="ls-state">
          <CircularProgress />
        </div>
      )}

      {data && (
        <div className="ls-layout">
          <div className="ls-main">
            <Paper elevation={0} className="ls-card">
              <h2>Active deadlines</h2>
              {data.deadlines.length === 0 ? (
                <p className="ls-muted">You have no borrowed books right now.</p>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Book</TableCell>
                      <TableCell>Due date</TableCell>
                      <TableCell>Time left</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.deadlines.map((d) => {
                      const status = dueStatus(d.daysLeft);
                      return (
                        <TableRow key={d.loanId}>
                          <TableCell>{d.title}</TableCell>
                          <TableCell>{d.dueDate}</TableCell>
                          <TableCell>
                            <Chip size="small" label={status.label} color={status.color} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Paper>

            <Paper elevation={0} className="ls-card">
              <h2>Hold requests</h2>
              {data.holds.length === 0 ? (
                <p className="ls-muted">You have no hold requests.</p>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Book</TableCell>
                      <TableCell>Place in line</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.holds.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>{h.title}</TableCell>
                        <TableCell>{h.status === "ready" ? "—" : ordinal(h.placeInLine)}</TableCell>
                        <TableCell>
                          {h.status === "ready" ? (
                            <Chip size="small" color="success" label="Ready for pickup" />
                          ) : (
                            <Chip size="small" color="warning" label="Waiting" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </div>

          <Paper elevation={0} className="ls-card ls-side">
            <h2>Fines and fees</h2>
            <div className={data.totalUnpaid > 0 ? "ls-total ls-total-due" : "ls-total"}>
              {peso(data.totalUnpaid)}
            </div>
            <div className="ls-muted">Unpaid balance</div>

            {data.fines.length > 0 && (
              <Table size="small" className="ls-fines">
                <TableHead>
                  <TableRow>
                    <TableCell>Book</TableCell>
                    <TableCell>Days late</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.fines.map((f) => (
                    <TableRow key={f.fineId}>
                      <TableCell>{f.title}</TableCell>
                      <TableCell>{f.daysLate}</TableCell>
                      <TableCell align="right">{peso(f.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <Alert severity="warning" className="ls-note">
              Fines are {peso(data.finePerDay)} per day late. Pay at the library desk and staff will
              record it.
            </Alert>
          </Paper>
        </div>
      )}
    </>
  );
}