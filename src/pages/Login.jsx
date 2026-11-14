import { useState } from "react";
import { Navigate } from "react-router-dom";
import { TextField, Button, Alert } from "@mui/material";
import { useAuth, HOME } from "../auth/AuthContext";
import "./Login.css";

function BooksIllustration() {
  return (
    <svg className="books" viewBox="0 0 260 250" role="img" aria-label="Three books">
      <rect x="0" y="10" width="78" height="232" rx="14" fill="#03A9E0" />
      <rect x="0" y="36" width="78" height="24" fill="#1190FF" />
      <rect x="0" y="190" width="78" height="24" fill="#1190FF" />
      <rect x="34" y="82" width="10" height="84" rx="5" fill="#15E8C4" />

      <rect x="80" y="66" width="70" height="176" rx="12" fill="#15E8C4" />
      <circle cx="115" cy="117" r="19" fill="#FFF97A" />
      <rect x="94" y="147" width="42" height="10" rx="5" fill="#fff" />
      <rect x="94" y="166" width="42" height="10" rx="5" fill="#fff" />

      <g transform="rotate(-15 190 130)">
        <rect x="155" y="25" width="70" height="210" rx="12" fill="#4DB6AC" />
        <rect x="155" y="62" width="70" height="26" fill="#1190FF" />
        <rect x="155" y="100" width="70" height="26" fill="#1190FF" />
        <rect x="175" y="150" width="30" height="9" rx="4.5" fill="#fff" />
        <circle cx="190" cy="195" r="11" fill="#fff" />
      </g>
    </svg>
  );
}

export default function Login() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // already logged in? go straight to your dashboard
  if (user) return <Navigate to={HOME[user.role]} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password); // the redirect above happens once user is set
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-card">
        <h1>Welcome to BookNest!</h1>
        <p className="login-subtitle">
          A home for Books and Bookworms!
          <br />
          Let&rsquo;s get started.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
          />
          <TextField
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button
            className="login-btn"
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Login"}
          </Button>
        </form>

        <p className="login-register">
          Not a member? <a href="/register">Register now</a>
        </p>
      </section>

      <section className="login-art">
        <BooksIllustration />
        <p>Your next favorite read is waiting.</p>
      </section>
    </div>
  );
}