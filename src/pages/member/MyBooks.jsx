import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
} from "@mui/material";
import PageHeader from "../../components/PageHeader";
import BookCover from "../../components/BookCover";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";
import { getCurrentLoans, getHistory, returnLoan } from "../../api/member";
import { dueStatus, peso } from "../../utils/loans";
import "./MyBooks.css";

function BookCell({ book }) {
  return (
    <div className="mb-book">
      <BookCover seed={book.id} width={36} height={48} />
      <div>
        <strong>{book.title}</strong>
        <span className="mb-muted">{book.author}</span>
      </div>
    </div>
  );
}

export default function MyBooks() {
  const [tab, setTab] = useState(0);
  const [loans, setLoans] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [target, setTarget] = useState(null);   // the loan waiting for return confirmation
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);   // change it to fetch the lists again

  useEffect(() => {
    let ignore = false;
    Promise.all([getCurrentLoans(), getHistory()])
      .then(([current, past]) => {
        if (ignore) return;
        setLoans(current);
        setHistory(past);
        setError("");
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;   // the page closed or a newer request replaced this one
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  async function confirmReturn() {
    setBusy(true);
    try {
      const res = await returnLoan(target.loanId);
      if (res.returnedLate) {
        const days = `${res.daysLate} ${res.daysLate === 1 ? "day" : "days"}`;
        setToast({
          message: `Returned ${days} late. A fine of ${peso(res.fineAmount)} was added.`,
          severity: "warning",
        });
      } else {
        setToast({ message: "Book returned. Thank you!", severity: "success" });
      }
    } catch (err) {
      setToast({ message: err.message, severity: "error" });
    } finally {
      setBusy(false);
      setTarget(null);
      reload();
    }
  }

  return (
    <>
      <PageHeader title="My Books" subtitle="Your current checkouts and reading history." />

      {error && <Alert severity="error">{error}</Alert>}
      {!loans && !error && (
        <div className="mb-empty">
          <CircularProgress />
        </div>
      )}

      {loans && (
        <Paper elevation={0} className="mb-card">
          <Tabs value={tab} onChange={(_, value) => setTab(value)} className="mb-tabs">
            <Tab label={`Current checkouts (${loans.length})`} />
            <Tab label={`Reading history (${history.length})`} />
          </Tabs>

          {tab === 0 &&
            (loans.length === 0 ? (
              <div className="mb-empty">You have no borrowed books right now.</div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book</TableCell>
                    <TableCell>Borrowed</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loans.map((loan) => {
                    const status = dueStatus(loan.daysLeft);
                    return (
                      <TableRow key={loan.loanId}>
                        <TableCell>
                          <BookCell book={loan} />
                        </TableCell>
                        <TableCell>{loan.borrowedAt}</TableCell>
                        <TableCell>{loan.dueDate}</TableCell>
                        <TableCell>
                          <Chip size="small" label={status.label} color={status.color} />
                        </TableCell>
                        <TableCell align="right">
                          <Button variant="contained" size="small" onClick={() => setTarget(loan)}>
                            Return
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ))}

          {tab === 1 &&
            (history.length === 0 ? (
              <div className="mb-empty">Books you return will show up here.</div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book</TableCell>
                    <TableCell>Borrowed</TableCell>
                    <TableCell>Returned</TableCell>
                    <TableCell>Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.loanId}>
                      <TableCell>
                        <BookCell book={h} />
                      </TableCell>
                      <TableCell>{h.borrowedAt}</TableCell>
                      <TableCell>{h.returnedAt}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={h.wasLate ? "Returned late" : "Returned"}
                          color={h.wasLate ? "warning" : "success"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ))}
        </Paper>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Return this book?"
        message={target ? `Return "${target.title}"? If it is late, a fine will be added.` : ""}
        confirmLabel="Return book"
        busy={busy}
        onConfirm={confirmReturn}
        onCancel={() => setTarget(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}