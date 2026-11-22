import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import "./AdminLayout.css";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/issue-return", label: "Issue / Return" },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/staff", label: "Manage Staff" },
  { to: "/admin/books", label: "Manage Books" },
  { to: "/admin/reports", label: "Reports" },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">BookNest</div>
        <div className="admin-role">Admin account</div>

        <nav className="admin-nav">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="admin-link">
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-logout">
          <Button color="inherit" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}