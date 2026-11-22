import { Routes, Route, Navigate } from "react-router-dom";
  import Login from "./pages/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import MemberLayout from "./layouts/MemberLayout";
import MemberDashboard from "./pages/member/Dashboard";
import Catalog from "./pages/member/Catalog";
import BookDetails from "./pages/member/BookDetails";
import MyBooks from "./pages/member/MyBooks";
import LoanStatus from "./pages/member/LoanStatus";
import StaffLayout from "./layouts/StaffLayout";
import StaffDashboard from "./pages/staff/Dashboard";
import IssueReturn from "./pages/staff/IssueReturn";
import StaffManageBooks from "./pages/staff/ManageBooks";
import Members from "./pages/staff/Members";
import Reports from "./pages/staff/Reports";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import ManageStaff from "./pages/admin/ManageStaff";
import AdminManageBooks from "./pages/admin/ManageBooks";

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
            <StaffLayout />
         </ProtectedRoute>
  }
>
        <Route index element={<StaffDashboard />} />
        <Route path="issue-return" element={<IssueReturn />} />
        <Route path="manage-books" element={<StaffManageBooks />} />
        <Route path="members" element={<Members />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      {/* admin area: all staff functions (flowchart) plus metrics, staff accounts and archiving.
          The shared pages (IssueReturn, Members, Reports) are the staff module's own pages. */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="issue-return" element={<IssueReturn />} />
        <Route path="members" element={<Members />} />
        <Route path="staff" element={<ManageStaff />} />
        <Route path="books" element={<AdminManageBooks />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}