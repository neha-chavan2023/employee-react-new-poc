import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Link, Stack, TextField, Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext.jsx";
import { validateRegistration } from "../utils/validation.js";

const empty = {
  name: "",
  username: "",
  email: "",
  password: "",
  confirm: "",
};

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateRegistration(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await register(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const field = (id, label, extra = {}) => (
    <Box>
      <Typography component="label" htmlFor={id} sx={{ display: "block", mb: 0.75, fontWeight: 600 }}>
        {label}
      </Typography>
      <TextField
        id={id}
        value={form[id]}
        onChange={change(id)}
        required
        fullWidth
        {...extra}
      />
    </Box>
  );

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
              <Typography variant="h4" fontWeight={700}>Create your account</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Register to start managing your team
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {field("name", "Full name", { autoFocus: true, autoComplete: "name" })}
            {field("username", "Username", { autoComplete: "username" })}
            {field("email", "Email", { type: "email", placeholder: "you@company.com", autoComplete: "email" })}
            {field("password", "Password", { type: "password", autoComplete: "new-password" })}
            {field("confirm", "Confirm password", { type: "password", autoComplete: "new-password" })}

            <Button type="submit" variant="contained" size="large" disabled={busy} sx={{ height: 48 }}>
              {busy ? "Creating account…" : "Create account"}
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Already have an account?{" "}
              <Link component={RouterLink} to="/login" fontWeight={700}>
                Login
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
