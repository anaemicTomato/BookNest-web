import { api } from "./client";

export const getCategories = () => api("/categories");

export function getBooks({ search, categoryId } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (categoryId) params.set("categoryId", categoryId);
  const query = params.toString();
  return api(`/books${query ? `?${query}` : ""}`);
}

export const getBook = (id) => api(`/books/${id}`);
export const borrowBook = (id) => api(`/books/${id}/borrow`, { method: "POST" });
export const reserveBook = (id) => api(`/books/${id}/reserve`, { method: "POST" });