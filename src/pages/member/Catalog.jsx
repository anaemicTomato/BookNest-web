import { useEffect, useState } from "react";
import { Alert, Chip, CircularProgress, TextField } from "@mui/material";
import PageHeader from "../../components/PageHeader";
import BookCard from "../../components/BookCard";
import { getBooks, getCategories } from "../../api/books";
import "./Catalog.css";

export default function Catalog() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");        // the search text, after a short pause
  const [categoryId, setCategoryId] = useState(null);
  const [books, setBooks] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message));
  }, []);

  // wait 300ms after typing stops, so we don't call the API on every key press
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let ignore = false;
    getBooks({ search: query, categoryId })
      .then((data) => {
        if (!ignore) {
          setBooks(data);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;   // a newer search replaced this one
    };
  }, [query, categoryId]);

  return (
    <>
      <PageHeader title="Catalog" subtitle="Search the library and open a book to borrow or reserve it." />

      <div className="catalog-toolbar">
        <TextField
          className="catalog-search"
          placeholder="Search by title or author"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <div className="catalog-chips">
          <Chip
            label="All"
            clickable
            color={categoryId === null ? "primary" : "default"}
            variant={categoryId === null ? "filled" : "outlined"}
            onClick={() => setCategoryId(null)}
          />
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              clickable
              color={categoryId === c.id ? "primary" : "default"}
              variant={categoryId === c.id ? "filled" : "outlined"}
              onClick={() => setCategoryId(c.id)}
            />
          ))}
        </div>
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      {!books && !error && (
        <div className="catalog-state">
          <CircularProgress />
        </div>
      )}

      {books && books.length === 0 && (
        <div className="catalog-state">No books match your search.</div>
      )}

      {books && books.length > 0 && (
        <div className="catalog-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </>
  );
}