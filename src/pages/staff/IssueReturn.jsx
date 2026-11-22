import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert, Avatar, Button, Checkbox, Chip, FormControlLabel,
  InputAdornment, Paper, Tab, Tabs, TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "../../components/PageHeader";
import BookCover from "../../components/BookCover";
import Toast from "../../components/Toast";
import {
  getStaffMembers, searchBooksToIssue, issueBook,
  getOpenLoans, returnLoan, payFine,
} from "../../api/staff";
import { peso } from "../../utils/loans";
import "./IssueReturn.css";

// Must match LoanSettings:LoanDays in appsettings.json on the API
const LOAN_DAYS = 14;

const fmt = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const initials = (name) =>
  name.split(" ").slice(0, 2).map((word) => word[0]).join("");

// Waits 300 ms after typing stops, then calls fetcher(text). An empty box gives no results.
function useSearch(term, fetcher, onToast) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      const text = term.trim();
      if (!text) {
        setRows([]);
        return;
      }
      fetcher(text)
        .then((data) => {
          if (!ignore) setRows(data.slice(0, 5));
        })
        .catch((err) => {
          if (!ignore) onToast({ message: err.message, severity: "error" });
        });
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [term, fetcher, onToast]);

  return rows;
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <TextField
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
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
  );
}

function PickRow({ onClick, disabled, children }) {
  return (
    <button type="button" className="staff-issue-row" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function SummaryLine({ label, value, danger }) {
  return (
    <div className="staff-issue-line">
      <span className="staff-issue-muted">{label}</span>
      <strong className={danger ? "staff-issue-danger" : undefined}>{value}</strong>
    </div>
  );
}

/* ───────────── Issue tab (screen 11) ───────────── */

function IssuePanel({ onToast }) {
  const [today] = useState(() => new Date());
  const [memberSearch, setMemberSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [member, setMember] = useState(null);
  const [book, setBook] = useState(null);
  const [busy, setBusy] = useState(false);

  const memberResults = useSearch(memberSearch, getStaffMembers, onToast);
  const bookResults = useSearch(bookSearch, searchBooksToIssue, onToast);

  const due = new Date(today);
  due.setDate(due.getDate() + LOAN_DAYS);

  function pickMember(m) {
    setMember(m);
    setMemberSearch("");
  }

  function pickBook(b) {
    setBook(b);
    setBookSearch("");
  }

  async function confirmIssue() {
    setBusy(true);
    try {
      const res = await issueBook(member.id, book.id);
      onToast({ message: res.message, severity: "success" });
      setMember(null);
      setBook(null);
    } catch (err) {
      onToast({ message: err.message, severity: "error" });
    } finally {
      setBusy(false);
    }
  }

  const canConfirm = member && book && book.availableCopies > 0 && !busy;

  return (
    <div className="staff-issue-grid">
      <div className="staff-issue-left">
        <Paper elevation={0} className="staff-issue-card">
          <h2>Member</h2>
          <SearchBox
            value={memberSearch}
            onChange={setMemberSearch}
            placeholder="Search by name, email or member ID"
          />
          {memberResults.map((m) => (
            <PickRow key={m.id} disabled={!m.isActive} onClick={() => pickMember(m)}>
              <Avatar>{initials(m.fullName)}</Avatar>
              <div className="staff-issue-grow">
                <strong>{m.fullName}</strong>
                <span className="staff-issue-muted">{m.email}</span>
              </div>
              {m.isActive ? (
                <Chip size="small" label={`${m.booksOut} books out`} color="info" />
              ) : (
                <Chip size="small" label="Deactivated" />
              )}
            </PickRow>
          ))}

          {member && (
            <>
              <div className="staff-issue-selected">
                <Avatar>{initials(member.fullName)}</Avatar>
                <div className="staff-issue-grow">
                  <strong>{member.fullName}</strong>
                  <span className="staff-issue-muted">{member.email}</span>
                </div>
                <Chip size="small" label={`${member.booksOut} books out`} color="info" />
              </div>
              {member.unpaidFines > 0 && (
                <Alert severity="warning">
                  Unpaid fine of {peso(member.unpaidFines)}. Ask the member to pay it at the desk.
                </Alert>
              )}
            </>
          )}
        </Paper>

        <Paper elevation={0} className="staff-issue-card">
          <h2>Book</h2>
          <SearchBox
            value={bookSearch}
            onChange={setBookSearch}
            placeholder="Scan or search by title or ISBN"
          />
          {bookResults.map((b) => (
            <PickRow key={b.id} onClick={() => pickBook(b)}>
              <BookCover seed={b.id} width={36} height={48} />
              <div className="staff-issue-grow">
                <strong>{b.title}</strong>
                <span className="staff-issue-muted">{b.author}</span>
              </div>
              <Chip
                size="small"
                label={b.availableCopies > 0 ? `${b.availableCopies} copies available` : "None available"}
                color={b.availableCopies > 0 ? "success" : "warning"}
              />
            </PickRow>
          ))}

          {book && (
            <div className="staff-issue-selected">
              <BookCover seed={book.id} width={36} height={48} />
              <div className="staff-issue-grow">
                <strong>{book.title}</strong>
                <span className="staff-issue-muted">{book.author}</span>
              </div>
              <Chip
                size="small"
                label={book.availableCopies > 0 ? `${book.availableCopies} copies available` : "None available"}
                color={book.availableCopies > 0 ? "success" : "warning"}
              />
            </div>
          )}
        </Paper>
      </div>

      <Paper elevation={0} className="staff-issue-card staff-issue-summary">
        <h2>Loan summary</h2>
        <SummaryLine label="Member" value={member ? member.fullName : "—"} />
        <SummaryLine label="Book" value={book ? book.title : "—"} />
        <SummaryLine label="Issue date" value={fmt(today)} />
        <SummaryLine label="Due date" value={fmt(due)} />
        <Button variant="contained" size="large" disabled={!canConfirm} onClick={confirmIssue}>
          {busy ? "Please wait…" : "Confirm issue"}
        </Button>
      </Paper>
    </div>
  );
}

/* ───────────── Return tab (screen 12) ───────────── */

function ReturnPanel({ onToast }) {
  const [today] = useState(() => new Date());
  const [search, setSearch] = useState("");
  const [loan, setLoan] = useState(null);
  const [paid, setPaid] = useState(false);
  const [busy, setBusy] = useState(false);

  const results = useSearch(search, getOpenLoans, onToast);

  function pickLoan(l) {
    setLoan(l);
    setPaid(false);
    setSearch("");
  }

  async function confirmReturn() {
    setBusy(true);
    try {
      const res = await returnLoan(loan.loanId);

      if (res.returnedLate) {
        const days = `${res.daysLate} ${res.daysLate === 1 ? "day" : "days"}`;
        let message = `Returned ${days} late. Fine of ${peso(res.fineAmount)}.`;
        if (paid && res.fineId) {
          try {
            await payFine(res.fineId);
            message += " Marked as paid.";
          } catch (err) {
            message += ` The book was returned, but the fine could not be marked paid: ${err.message}`;
          }
        }
        onToast({ message, severity: "warning" });
      } else {
        onToast({ message: "Book returned.", severity: "success" });
      }
      setLoan(null);
    } catch (err) {
      onToast({ message: err.message, severity: "error" });
    } finally {
      setBusy(false);
    }
  }

  const late = loan && loan.daysLate > 0;

  return (
    <div className="staff-issue-grid">
      <Paper elevation={0} className="staff-issue-card staff-issue-left">
        <h2>Book being returned</h2>
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Scan or search by title, ISBN or member"
        />
        {results.map((l) => (
          <PickRow key={l.loanId} onClick={() => pickLoan(l)}>
            <BookCover seed={l.id} width={36} height={48} />
            <div className="staff-issue-grow">
              <strong>{l.title}</strong>
              <span className="staff-issue-muted">
                {l.author} · {l.member}
              </span>
            </div>
          </PickRow>
        ))}

        {loan && (
          <>
            <div className="staff-issue-selected">
              <BookCover seed={loan.id} width={36} height={48} />
              <div className="staff-issue-grow">
                <strong>{loan.title}</strong>
                <span className="staff-issue-muted">{loan.author}</span>
              </div>
              <Chip
                size="small"
                label={late ? `Returned ${loan.daysLate} ${loan.daysLate === 1 ? "day" : "days"} late` : "On time"}
                color={late ? "error" : "success"}
              />
            </div>
            <SummaryLine label="Borrowed by" value={loan.member} />
            <SummaryLine label="Borrowed on" value={loan.borrowedAt} />
            <SummaryLine label="Due on" value={loan.dueDate} />
          </>
        )}
      </Paper>

      <Paper elevation={0} className="staff-issue-card staff-issue-summary">
        <h2>Return summary</h2>
        <SummaryLine label="Returned on" value={fmt(today)} />
        <SummaryLine label="Days late" value={loan ? loan.daysLate : "—"} />
        <SummaryLine
          label={`Fine (${loan ? peso(loan.finePerDay) : "₱0.00"} per day)`}
          value={loan ? peso(loan.projectedFine) : "—"}
          danger={late}
        />
        <FormControlLabel
          control={<Checkbox checked={paid} onChange={(e) => setPaid(e.target.checked)} />}
          label="Fine paid at the desk"
          disabled={!late}
        />
        <Button variant="contained" size="large" disabled={!loan || busy} onClick={confirmReturn}>
          {busy ? "Please wait…" : "Confirm return"}
        </Button>
      </Paper>
    </div>
  );
}

/* ───────────── The page ───────────── */

export default function IssueReturn() {
  const [params, setParams] = useSearchParams();
  const [toast, setToast] = useState(null);
  const tab = params.get("tab") === "return" ? 1 : 0;

  return (
    <>
      <PageHeader title="Issue / Return" subtitle="Lend a book to a member or take one back." />

      <Tabs
        value={tab}
        onChange={(_, value) => setParams(value === 1 ? { tab: "return" } : {})}
        className="staff-issue-tabs"
      >
        <Tab label="Issue" />
        <Tab label="Return" />
      </Tabs>

      {tab === 0 ? <IssuePanel onToast={setToast} /> : <ReturnPanel onToast={setToast} />}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}