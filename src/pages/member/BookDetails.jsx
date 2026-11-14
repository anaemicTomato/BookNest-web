import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Button, Chip, CircularProgress, Paper } from "@mui/material";
import PageHeader from "../../components/PageHeader";
import BookCover from "../../components/BookCover";
import Toast from "../../components/Toast";
import { borrowBook, getBook, reserveBook } from "../../api/books";
import "./BookDetails.css";

export default function BookDetails() {
    const { bookId } = useParams();
    const [book, setBook] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);   // change it to fetch the book again

  useEffect(() => {
    let ignore = false;
    getBook(bookId)
      .then((data) => {
        if (ignore) return;
        setBook(data);
        setError("");
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [bookId, reloadKey]);

    const reload = () => setReloadKey((key) => key + 1);

    async function run(action) {
    setBusy(true);
    try {
      const res = await action(book.id);
      setToast({ message: res.message, severity: "success" });
    } catch (err) {
      setToast({ message: err.message, severity: "error" });
    } finally {
      setBusy(false);
      reload();   // refresh, so the buttons match what the server now says
    }
  }
  

  if (error && !book) {
    return (
      <>
        <PageHeader title="Book details" />
        <Alert severity="error">{error}</Alert>
        <div>
          <Button component={Link} to="/member/catalog" variant="outlined">
            Back to catalog
          </Button>
        </div>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <PageHeader title="Book details" />
        <div className="bd-loading">
          <CircularProgress />
        </div>
      </>
    );
  }

  // which button to show
  let action;
  if (book.hasLoan) {
    action = <Alert severity="info">You currently have this book. Return it from My Books.</Alert>;
  } else if (book.canBorrow) {
    action = (
      <>
        {book.hasReservation && (
          <Alert severity="success">Your reserved copy is ready. Borrow it now.</Alert>
        )}
        <Button variant="contained" size="large" disabled={busy} onClick={() => run(borrowBook)}>
          Borrow book
        </Button>
      </>
    );
  } else if (book.hasReservation) {
    action = <Alert severity="warning">You are on the waiting list for this book.</Alert>;
  } else {
    action = (
      <>
        <Alert severity="warning">
          No copy is available right now. Reserve it and you will be next in line when one comes back.
        </Alert>
        <Button variant="contained" size="large" disabled={busy} onClick={() => run(reserveBook)}>
          Reserve book
        </Button>
      </>
    );
  }

  return (
    <>
      <PageHeader title={book.title} subtitle={`Catalog  /  ${book.title}`} />

      <Paper elevation={0} className="bd-card">
        <BookCover seed={book.id} width={250} height={340} />

        <div className="bd-info">
          <h2 className="bd-title">{book.title}</h2>
          <div className="bd-author">{book.author}</div>

          <Chip
            label={book.canBorrow ? "Available" : "No copy available"}
            color={book.canBorrow ? "success" : "error"}
            size="small"
          />

          <div className="bd-facts">
            <div className="bd-fact">
              <span>Category</span>
              <span>{book.category}</span>
            </div>
            <div className="bd-fact">
              <span>ISBN</span>
              <span>{book.isbn}</span>
            </div>
            <div className="bd-fact">
              <span>Copies</span>
              <span>
                {book.availableCopies} of {book.totalCopies} available
              </span>
            </div>
          </div>

          <div className="bd-actions">
            {action}
            <Button component={Link} to="/member/catalog" color="inherit">
              Back to catalog
            </Button>
          </div>
        </div>
      </Paper>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}