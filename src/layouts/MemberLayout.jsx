import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import "./MemberLayout.css";

const LINKS = [
  { to: "/member", label: "Dashboard", end: true },
  { to: "/member/catalog", label: "Catalog" },
  { to: "/member/my-books", label: "My Books" },
  { to: "/member/loan-status", label: "Loan Status" },
];

export default function MemberLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="member-layout">
      <aside className="member-sidebar">
        <div className="member-logo">BookNest</div>
        <div className="member-role">Member account</div>

        <nav className="member-nav">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="member-link">
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="member-logout">
          <Button color="inherit" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </aside>

      <main className="member-main">
        <Outlet />
      </main>
    </div>
  );
}