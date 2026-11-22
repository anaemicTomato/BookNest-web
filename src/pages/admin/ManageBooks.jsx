import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "../../components/PageHeader";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";
import { getCategories } from "../../api/books";
import { getAllBooks, addBook, updateBook } from "../../api/staff";
import { archiveBook, deleteBook } from "../../api/admin";
import "./ManageBooks.css";

const EMPTY_FORM = { title: "", author: "", isbn: "", categoryId: "", totalCopies: 1 };

function status(book) {
  if (book.isArchived) return { label: "Archived", color: "default" };
  if (book.availableCopies === 0) return { label: "All on loan", color: "warning" };
  return { label: "Available", color: "success" };
}

export default function ManageBooks() {
  const [books, setBooks] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);   // change it to fetch the list again

  const [editing, setEditing] = useState(null);    // the book being edited, or null when adding
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [target, setTarget] = useState(null);      // the book waiting for Archive confirmation
  const [deleting, setDeleting] = useState(null);   // the book waiting for Delete confirmation
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  // The categories load on their own, so the form still works if the book list fails
  useEffect(() => {
    let ignore = false;
    getCategories()
      .then((cats) => {
        if (ignore) return;
        setCategories(cats);
        setForm((f) => (f.categoryId === "" ? { ...f, categoryId: cats[0]?.id ?? "" } : f));
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    getAllBooks()
      .then((list) => {
        if (ignore) return;
        setBooks(list);
        setError("");
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;   // the page closed, or a newer request replaced this one
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);
  const change = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  // The list is already loaded, so the search box just filters it here
  const term = search.trim().toLowerCase();
  const visible = books?.filter(
    (b) => !term || b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
  );

  function startAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? "" });
    setFormError("");
  }

  function startEdit(book) {
    // the list gives the category id (and name) straight from the API
    const category = categories.find((c) => c.id === book.categoryId);
    setEditing(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn ?? "",
      categoryId: category?.id ?? "",
      totalCopies: book.totalCopies,
    });
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    const body = {
      title: form.title,
      author: form.author,
      isbn: form.isbn,
      categoryId: Number(form.categoryId),
      totalCopies: Number(form.totalCopies),
    };
    try {
      if (editing) await updateBook(editing.id, body);
      else await addBook(body);
      setToast({ message: editing ? "Book updated." : "Book added.", severity: "success" });
      startAdd();
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changeArchived(book, isArchived) {
    setBusy(true);
    try {
      const res = await archiveBook(book.id, isArchived);
      setToast({ message: res.message, severity: "success" });
    } catch (err) {
      setToast({ message: err.message, severity: "error" });
    } finally {
      setBusy(false);
      setTarget(null);
      reload();
    }
  }

  async function removeBook(book) {
    setBusy(true);
    try {
      const res = await deleteBook(book.id);
      setToast({ message: res.message, severity: "success" });
      if (editing?.id === book.id) startAdd();
    } catch (err) {
      setToast({ message: err.message, severity: "error" });   // e.g. the book has loan history
    } finally {
      setBusy(false);
      setDeleting(null);
      reload();
    }
  }

  return (
    <>
      <PageHeader title="Manage Books" subtitle="Add, edit, archive and delete books in the catalog." />

      {error && <Alert severity="error">{error}</Alert>}

      <div className="admin-books-layout">
        <Paper elevation={0} className="admin-books-card admin-books-list">
          <div className="admin-books-top">
            <TextField
              fullWidth
              placeholder="Search books"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
            <Button variant="contained" onClick={startAdd}>
              Add book
            </Button>
          </div>

          {!books && !error && (
            <div className="admin-books-empty">
              <CircularProgress />
            </div>
          )}
          {visible && visible.length === 0 && <div className="admin-books-empty">No books found.</div>}
          {visible && visible.length > 0 && (
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
                {visible.map((book) => {
                  const s = status(book);
                  return (
                    <TableRow key={book.id}>
                      <TableCell>
                        <strong>{book.title}</strong>
                        <span className="admin-books-muted">{book.author}</span>
                      </TableCell>
                      <TableCell>{book.category}</TableCell>
                      <TableCell>
                        {book.availableCopies} / {book.totalCopies}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={s.label} color={s.color} />
                      </TableCell>
                      <TableCell align="right">
                        <div className="admin-books-actions">
                          {book.isArchived ? (
                            <>
                              <Button size="small" variant="outlined" onClick={() => changeArchived(book, false)}>
                                Restore
                              </Button>
                              <Button size="small" variant="outlined" color="error" onClick={() => setDeleting(book)}>
                                Delete
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="small" variant="outlined" onClick={() => startEdit(book)}>
                                Edit
                              </Button>
                              <Button size="small" variant="outlined" color="error" onClick={() => setTarget(book)}>
                                Archive
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Paper elevation={0} className="admin-books-card admin-books-form">
          <h2>{editing ? "Edit book" : "Add book"}</h2>
          <form onSubmit={handleSubmit}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Title" value={form.title} onChange={change("title")} required fullWidth />
            <TextField label="Author" value={form.author} onChange={change("author")} required fullWidth />
            <TextField
              label="ISBN"
             
              value={form.isbn}
              onChange={change("isbn")}
              disabled={Boolean(editing)}   // the ISBN is not changed after a book is added
              required
              fullWidth
            />
            <TextField select label="Category" value={form.categoryId} onChange={change("categoryId")} required fullWidth>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Copies"
              type="number"
              value={form.totalCopies}
              onChange={change("totalCopies")}
              slotProps={{ htmlInput: { min: 1 } }}
              required
              fullWidth
            />
            <div className="admin-books-buttons">
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Saving…" : "Save book"}
              </Button>
              <Button variant="outlined" onClick={startAdd} disabled={saving}>
                Cancel
              </Button>
            </div>
          </form>
        </Paper>
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        title="Archive this book?"
        message={`"${target?.title ?? ""}" will be hidden from the catalog. Its loan history is kept and you can restore it later.`}
        confirmLabel="Archive"
        busy={busy}
        onConfirm={() => changeArchived(target, true)}
        onCancel={() => setTarget(null)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this book?"
        message={`Are you really sure you want to delete "${deleting?.title ?? ""}"? It will be removed for good and this cannot be undone.`}
        confirmLabel="Yes, delete"
        danger
        busy={busy}
        onConfirm={() => removeBook(deleting)}
        onCancel={() => setDeleting(null)}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
