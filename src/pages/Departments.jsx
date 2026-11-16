import { useState } from "react";
import {
  Avatar, Box, Chip, InputAdornment, MenuItem, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useData } from "../context/DataContext.jsx";

export default function Designations() {
  const { employees, departments } = useData();
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");

  const seen = new Set();
  const designations = [];
  employees.forEach((employee) => {
    const key = `${employee.title}|${employee.department}`;
    if (employee.title && !seen.has(key)) {
      seen.add(key);
      designations.push({ title: employee.title, department: employee.department });
    }
  });
  designations.sort((a, b) => a.title.localeCompare(b.title));

  const list = designations.map((designation, index) => ({ ...designation, id: index + 1 }));
  const text = search.toLowerCase();
  const rows = list.filter(
    (designation) =>
      (dept === "" || designation.department === dept) &&
      (designation.title + designation.id + designation.department).toLowerCase().includes(text)
  );

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4">Designations</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Explore the roles represented across your teams.</Typography>
      </Box>

      <Paper sx={{ p: 2, border: "1px solid #eceef4", boxShadow: "none" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <TextField
            placeholder="Search designation or department…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            fullWidth
            slotProps={{
              input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> },
            }}
          />
          <TextField select label="Department" value={dept} onChange={(event) => setDept(event.target.value)} size="small" sx={{ minWidth: { sm: 220 } }}>
            <MenuItem value="">All departments</MenuItem>
            {departments.map((department) => <MenuItem key={department} value={department}>{department}</MenuItem>)}
          </TextField>
          <Chip label={`${rows.length} designations`} variant="outlined" sx={{ alignSelf: { xs: "flex-start", sm: "center" } }} />
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{ border: "1px solid #eceef4" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="120">ID</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Department</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((designation) => (
              <TableRow key={designation.id} hover>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" fontWeight={650}>
                    #{String(designation.id).padStart(3, "0")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar variant="rounded" sx={{ bgcolor: "primary.light", color: "primary.main", width: 42, height: 42 }}>
                      <BusinessRoundedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{designation.title}</Typography>
                      <Typography variant="caption" color="text.secondary">Role within {designation.department}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell><Chip label={designation.department} size="small" variant="outlined" /></TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6, color: "text.secondary" }}>No designations found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
