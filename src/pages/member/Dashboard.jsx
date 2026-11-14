import { useEffect, useState } from "react";
import { Paper, Chip, Alert, CircularProgress } from "@mui/material";
import PageHeader from "../../components/PageHeader";
import BookCover from "../../components/BookCover";
import { useAuth } from "../../auth/AuthContext";
import { getMemberDashboard } from "../../api/member";
import "./Dashboard.css";
import { dueStatus } from "../../utils/loans";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMemberDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const firstName = user.fullName.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Hi, ${firstName}`}
        subtitle="Here is what you have borrowed and what is coming up."
      />

      {error && <Alert severity="error">{error}</Alert>}
      {!data && !error && (
        <div className="dash-loading">
          <CircularProgress />
        </div>
      )}

      {data && (
        <>
          <div className="dash-stats">
            <Paper elevation={0} className="dash-card dash-stat">
              <span className="dash-muted">Books borrowed</span>
              <strong>{data.borrowed.length}</strong>
            </Paper>
            <Paper elevation={0} className="dash-card dash-stat">
              <span className="dash-muted">Due soon</span>
              <strong className="dash-warn">
                {data.borrowed.filter((b) => b.daysLeft <= 3).length}
              </strong>
            </Paper>
            <Paper elevation={0} className="dash-card dash-stat">
              <span className="dash-muted">Unpaid fines</span>
              <strong className="dash-danger">₱{data.unpaidFines.toFixed(2)}</strong>
            </Paper>
          </div>

          <Paper elevation={0} className="dash-card">
            <h2>Currently borrowed</h2>
            {data.borrowed.length === 0 ? (
              <p className="dash-muted">You have no borrowed books right now.</p>
            ) : (
              <div className="dash-borrowed">
                {data.borrowed.map((book) => {
                  const status = dueStatus(book.daysLeft);
                  return (
                    <div key={book.id} className="dash-item">
                      <BookCover seed={book.id} width={48} height={64} />
                      <div>
                        <div className="dash-item-title">{book.title}</div>
                        <div className="dash-muted">{book.author}</div>
                        <div className="dash-item-due">
                          Due {book.dueDate}{" "}
                          <Chip size="small" label={status.label} color={status.color} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Paper>

          <Paper elevation={0} className="dash-card">
            <h2>New arrivals</h2>
            <div className="dash-arrivals">
              {data.newArrivals.map((book) => (
                <div key={book.id}>
                  <BookCover seed={book.id} height={110} />
                  <div className="dash-arrival-title">{book.title}</div>
                  <div className="dash-muted">{book.author}</div>
                </div>
              ))}
            </div>
          </Paper>
        </>
      )}
    </>
  );
}