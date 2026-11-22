import { api } from "./client";

const qs = (search) => (search ? `?search=${encodeURIComponent(search)}` : "");

// Dashboard
export const getStaffDashboard = () => api("/staff/dashboard");

// Issue / Return
export const getStaffMembers = (search) => api(`/staff/members${qs(search)}`);
export const searchBooksToIssue = (search) => api(`/staff/books${qs(search)}`);
export const issueBook = (userId, bookId) =>
  api("/staff/loans", { method: "POST", body: { userId, bookId } });
export const getOpenLoans = (search) => api(`/staff/loans${qs(search)}`);
export const returnLoan = (loanId) =>
  api(`/staff/loans/${loanId}/return`, { method: "POST" });
export const payFine = (fineId) =>
  api(`/staff/fines/${fineId}/pay`, { method: "POST" });

// Manage Books
export const getAllBooks = (search) => api(`/staff/books/all${qs(search)}`);
export const addBook = (book) => api("/staff/books", { method: "POST", body: book });
export const updateBook = (id, book) =>
  api(`/staff/books/${id}`, { method: "PUT", body: book });

// Members
export const setMemberActive = (id, isActive) =>
  api(`/staff/members/${id}/active`, { method: "PUT", body: { isActive } });

// Reports
export const getActiveLoansReport = () => api("/staff/reports/active-loans");
export const getOverdueReport = () => api("/staff/reports/overdue");
export const getPopularReport = (from, to) => {
  const p = new URLSearchParams();
  if (from) p.set("from", from);
  if (to) p.set("to", to);
  const q = p.toString();
  return api(`/staff/reports/popular${q ? `?${q}` : ""}`);
};
