import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Placeholder({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700}>
        {title}
      </Typography>
      <Typography sx={{ my: 2 }}>
        Signed in as {user.fullName} ({user.role})
      </Typography>
      <Button
        variant="contained"
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        Log out
      </Button>
    </Box>
  );
}