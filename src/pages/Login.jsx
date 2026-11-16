import { useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Stack, TextField, Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh", display: "grid", placeItems: "center", p: 2,
      bgcolor: "#f6f7fb",
    }}>
      <Card
        elevation={0}
        sx={{
          width: "100%", maxWidth: 490, borderRadius: 3,
          border: "1px solid #eceef4",
          boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 16px 40px rgba(16,24,40,.07)",
        }}
      >
        <CardContent sx={{ p: { xs: 3.5, sm: 5 }, "&:last-child": { pb: { xs: 3.5, sm: 5 } } }}>
          <Stack spacing={2.5} component="form" onSubmit={submit}>
            <Box>
              <Typography variant="h4" fontWeight={700}>Welcome back</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Log in to view your dashboard
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Alert severity="info" sx={{ py: 0.5 }}>
              Demo account is pre-filled: <strong>emilys</strong> / <strong>emilyspass</strong>
            </Alert>

            <Box>
              <Typography component="label" htmlFor="login-email" sx={{ display: "block", mb: 0.75, fontWeight: 600 }}>
                Username or email
              </Typography>
              <TextField
                id="login-email"
                type="text"
                placeholder="emilys"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                fullWidth
              />
            </Box>

            <Box>
              <Typography component="label" htmlFor="login-password" sx={{ display: "block", mb: 0.75, fontWeight: 600 }}>
                Password
              </Typography>
              <TextField
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
            </Box>

            <Button type="submit" variant="contained" size="large" disabled={busy} sx={{ height: 48 }}>
              {busy ? "Logging in…" : "Login"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
