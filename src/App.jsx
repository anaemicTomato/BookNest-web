import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Placeholder from "./pages/Placeholder";
import ProtectedRoute from "./auth/ProtectedRoute";
import MemberLayout from "./layouts/MemberLayout";
import MemberDashboard from "./pages/member/Dashboard";
import Catalog from "./pages/member/Catalog";
import BookDetails from "./pages/member/BookDetails";
import MyBooks from "./pages/member/MyBooks";
import LoanStatus from "./pages/member/LoanStatus";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* member area: every page below appears inside MemberLayout */}
      <Route
        path="/member"
        element={
          <ProtectedRoute roles={["member"]}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MemberDashboard />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="catalog/:bookId" element={<BookDetails />} />
        <Route path="my-books" element={<MyBooks />} />
        <Route path="loan-status" element={<LoanStatus />} />
      </Route>

      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={["staff", "admin"]}>
            <Placeholder title="Staff dashboard" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Placeholder title="Admin dashboard" />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}