import { Link } from "react-router-dom";
import { Paper, Chip } from "@mui/material";
import BookCover from "./BookCover";
import "./BookCard.css";

export default function BookCard({ book }) {
  const available = book.availableCopies > 0;
  return (
    <Paper component={Link} to={`/member/catalog/${book.id}`} elevation={0} className="book-card">
      <BookCover seed={book.id} height={120} />
      <div className="book-card-title">{book.title}</div>
      <div className="book-card-author">{book.author}</div>
      <Chip
        size="small"
        label={available ? "Available" : "Unavailable"}
        color={available ? "success" : "error"}
      />
    </Paper>
  );
}