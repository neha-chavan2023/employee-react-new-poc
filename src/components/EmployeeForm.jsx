import { useState } from "react";
import {
  Alert, Box, Button, DialogActions, DialogContent, MenuItem, TextField,
} from "@mui/material";
import { getEmployeeValidationErrors } from "../utils/validation.js";

export const EMPTY_EMPLOYEE = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  age: 30,
  gender: "male",
  department: "",
  title: "",
  city: "",
};

export default function EmployeeForm({ initial, departments, onSubmit, onCancel, validatePhone }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  function fieldProps(name) {
    const messages = errors
      .filter((error) => error.field === name)
      .map((error) => error.message);
    return { error: messages.length > 0, helperText: messages.join(" ") };
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    setSubmitError("");
    if (errors.length) {
      setErrors(getEmployeeValidationErrors(
        { ...nextForm, age: Number(nextForm.age) },
        departments,
        validatePhone
      ));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const employee = { ...form, age: Number(form.age) };
    const validationErrors = getEmployeeValidationErrors(employee, departments, validatePhone);
    if (validationErrors.length) {
      setErrors(validationErrors);
      setSubmitError("");
      return;
    }

    setErrors([]);
    setSubmitError("");
    setSaving(true);
    try {
      await onSubmit(employee);
    } catch (submitError) {
      setSubmitError(submitError.message);
      setSaving(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <DialogContent dividers>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}>
          <TextField name="firstName" label="First name" value={form.firstName} onChange={handleChange} required fullWidth {...fieldProps("firstName")} />
          <TextField name="lastName" label="Last name" value={form.lastName} onChange={handleChange} required fullWidth {...fieldProps("lastName")} />
          <TextField name="email" label="Email" type="email" value={form.email} onChange={handleChange} required fullWidth {...fieldProps("email")} />
          <TextField
            name="phone"
            label="Mobile number"
            value={form.phone}
            onChange={handleChange}
            slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 10 } }}
            fullWidth
            {...fieldProps("phone")}
          />
          <TextField
            name="age"
            label="Age"
            type="number"
            slotProps={{ htmlInput: { min: 18, max: 70, step: 1 } }}
            value={form.age}
            onChange={handleChange}
            required
            fullWidth
            {...fieldProps("age")}
          />
          <TextField name="gender" label="Gender" select value={form.gender} onChange={handleChange} fullWidth>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </TextField>
          <TextField name="department" label="Department" select value={form.department} onChange={handleChange} required fullWidth {...fieldProps("department")}>
            {!form.department && <MenuItem value="" disabled>Select department</MenuItem>}
            {departments.map((department) => (
              <MenuItem key={department} value={department}>{department}</MenuItem>
            ))}
          </TextField>
          <TextField name="title" label="Job title" value={form.title} onChange={handleChange} fullWidth />
          <TextField name="city" label="City" value={form.city} onChange={handleChange} fullWidth />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} color="inherit">Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Saving…" : "Save employee"}
        </Button>
      </DialogActions>
    </Box>
  );
}
