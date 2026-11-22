import { useEffect, useState } from "react";
import {
  Alert, Button, Chip, CircularProgress, InputAdornment, MenuItem, Paper,
  Table, TableBody, TableCell, TableHead, TableRow, TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "../../components/PageHeader";
import Toast from "../../components/Toast";
import { getCategories } from "../../api/books";
import { getAllBooks, addBook, updateBook } from "../../api/staff";
import "./ManageBooks.css";

const EMPTY = { title: "", author: "", isbn: "", categoryId: "", totalCopies: 1 };

function statusOf(book) {
  if (book.isArchived) return { label: "Archived", color: "default" };
  if (book.availableCopies === 0) return { label: "All on loan", color: "warning" };
  return { label: "Available", color: "success" };
}

export default function ManageBooks() {
  const [books, setBooks] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, setToast] = useState(null);

  // "new" = adding (the design shows the panel open), or a book id = editing
  const [editing, setEditing] = useState("new");
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
        setForm((f) => (f.categoryId === "" ? { ...f, categoryId: data[0]?.id ?? "" } : f));
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      getAllBooks(search.trim())
        .then((data) => {
          if (ignore) return;
          setBooks(data);
          setError("");
        })
        .catch((err) => {
          if (!ignore) setError(err.message);
        });
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  function openAdd() {
    setEditing("new");
    setForm({ ...EMPTY, categoryId: categories[0]?.id ?? "" });
  }

  const cancel = openAdd;   // Cancel goes back to a blank Add book form

  function openEdit(book) {
    setEditing(book.id);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      categoryId: book.categoryId,
      totalCopies: book.totalCopies,
    });
  }

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function save() {
    setBusy(true);
    const body = { ...form, categoryId: Number(form.categoryId), totalCopies: Number(form.totalCopies) };
    try {
      const res = editing === "new" ? await addBook(body) : await updateBook(editing, body);
      setToast({ message: res.message, severity: "success" });
      openAdd();
      reload();
    } catch (err) {
      setToast({ message: err.message, severity: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Manage Books" subtitle="Add, edit books in the catalog." />

      <div className="staff-books-grid">
        <Paper elevation={0} className="staff-books-card staff-books-list">
          <div className="staff-books-toolbar">
            <TextField
              fullWidth
              placeholder="Search books"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button variant="contained" onClick={openAdd} disabled={categories.length === 0}>
              Add book
            </Button>
          </div>

          {error && <Alert severity="error">{error}</Alert>}
          {!books && !error && <CircularProgress className="staff-books-spinner" />}
          {books && books.length === 0 && <p className="staff-books-muted">No books found.</p>}

          {books && books.length > 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Book</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Copies free</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {books.map((b) => {
                  const status = statusOf(b);
                  return (
                    <TableRow key={b.id}>
                      <TableCell>
                        <strong className="staff-books-title">{b.title}</strong>
                        <span className="staff-books-muted">{b.author}</span>
                      </TableCell>
                      <TableCell>{b.category}</TableCell>
                      <TableCell>
                        {b.availableCopies} / {b.totalCopies}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={status.label} color={status.color} />
                      </TableCell>
                      <TableCell align="right">
                        <Button variant="outlined" size="small" onClick={() => openEdit(b)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Paper elevation={0} className="staff-books-card staff-books-form">
            <h2>{editing === "new" ? "Add book" : "Edit book"}</h2>
            <label>
              Title
              <TextField fullWidth placeholder="Book title" value={form.title} onChange={change("title")} />
            </label>
            <label>
              Author
              <TextField fullWidth placeholder="Author name" value={form.author} onChange={change("author")} />
            </label>
            <label>
              ISBN
              <TextField fullWidth placeholder="978-0-00-000000-0" value={form.isbn} onChange={change("isbn")} />
            </label>
            <label>
              Category
              <TextField select fullWidth value={form.categoryId} onChange={change("categoryId")}>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </label>
            <label>
              Copies
              <TextField
                fullWidth
                type="number"
                slotProps={{ htmlInput: { min: 1 } }}
                value={form.totalCopies}
                onChange={change("totalCopies")}
              />
            </label>
            <div className="staff-books-buttons">
              <Button variant="contained" onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Save book"}
              </Button>
              <Button variant="outlined" onClick={cancel} disabled={busy}>
                Cancel
              </Button>
            </div>
        </Paper>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}