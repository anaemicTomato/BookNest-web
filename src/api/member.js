import { api } from "./client";

export const getMemberDashboard = () => api("/member/dashboard");
export const getCurrentLoans = () => api("/member/loans");
export const getHistory = () => api("/member/history");
export const getLoanStatus = () => api("/member/loan-status");
export const returnLoan = (loanId) => api(`/member/loans/${loanId}/return`, { method: "POST" });