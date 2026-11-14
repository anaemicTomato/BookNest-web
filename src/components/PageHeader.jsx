import { Avatar } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import "./PageHeader.css";

export default function PageHeader({ title, subtitle }) {
  const { user } = useAuth();
  const initials = user.fullName
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="page-user">
        <Avatar>{initials}</Avatar>
        <span>{user.fullName}</span>
      </div>
    </header>
  );
}