// src/layouts/StaffLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import "./StaffLayout.css";

const LINKS = [
  { to: "/staff", label: "Dashboard", end: true },
  { to: "/staff/issue-return", label: "Issue / Return" },
  { to: "/staff/manage-books", label: "Manage Books" },
  { to: "/staff/members", label: "Members" },
  { to: "/staff/reports", label: "Reports" },
];

export default function StaffLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="staff-layout">
      <aside className="staff-sidebar">
        <div className="staff-logo">BookNest</div>
        <div className="staff-role">Staff account</div>

        <nav className="staff-nav">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="staff-link">
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="staff-logout">
          <Button color="inherit" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </aside>

      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  );
}