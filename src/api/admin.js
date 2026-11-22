import { api } from "./client";

// Dashboard (screen 16)
export const getMetrics = () => api("/admin/metrics");

// Manage Staff (screen 17)
export const getStaff = (search) =>
  api(`/admin/staff${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const createStaff = (body) => api("/admin/staff", { method: "POST", body });
export const updateStaff = (id, body) => api(`/admin/staff/${id}`, { method: "PUT", body });
export const setStaffActive = (id, isActive) =>
  api(`/admin/staff/${id}/active`, { method: "PUT", body: { isActive } });

export const deleteStaff = (id) => api(`/admin/staff/${id}`, { method: "DELETE" });
export const resetStaffPassword = (id, newPassword) =>
  api(`/admin/staff/${id}/password`, { method: "PUT", body: { newPassword } });

// Manage Books (screen 18): archive, restore and delete are admin-only
export const archiveBook = (id, isArchived) =>
  api(`/admin/books/${id}/archive`, { method: "PUT", body: { isArchived } });
export const deleteBook = (id) => api(`/admin/books/${id}`, { method: "DELETE" });

// Members page: delete a deactivated member (admin only)
export const deleteMember = (id) => api(`/admin/members/${id}`, { method: "DELETE" });

