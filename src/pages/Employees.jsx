import { useMemo, useState } from "react";
import {
  Alert, Avatar, Box, Button, Chip, DialogActions, DialogContent,
  IconButton, MenuItem, Pagination, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField,
  Tooltip, Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useData } from "../context/DataContext.jsx";
import Modal from "../components/Modal.jsx";
import EmployeeForm, { EMPTY_EMPLOYEE } from "../components/EmployeeForm.jsx";

const PAGE_SIZE = 10;

export default function Employees() {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee } = useData();
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: "id", dir: 1 });
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const rows = employees.filter(
      (employee) =>
        (!dept || employee.department === dept) &&
        (!q || `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.title}`.toLowerCase().includes(q))
    );
    return rows.sort((a, b) => {
      const va = sort.key === "name" ? a.firstName : a[sort.key];
      const vb = sort.key === "name" ? b.firstName : b[sort.key];
      return (va > vb ? 1 : va < vb ? -1 : 0) * sort.dir;
    });
  }, [employees, query, dept, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggleSort = (key) =>
    setSort((currentSort) => (currentSort.key === key
      ? { key, dir: -currentSort.dir }
      : { key, dir: 1 }));

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  };

  const save = async (data) => {
    if (editing === "new") {
      await addEmployee(data);
      flash("Employee added.");
    } else {
      await updateEmployee(editing.id, data);
      flash("Employee updated.");
    }
    setEditing(null);
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployee(toDelete.id);
      flash("Employee deleted.");
    } catch (err) {
      flash(err.message);
    }
    setToDelete(null);
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2}>
        <Box>
          <Typography variant="h4">Employees</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Manage your people, roles, and teams.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setEditing("new")}>
          Add employee
        </Button>
      </Stack>

      {notice && <Alert severity="success" onClose={() => setNotice("")}>{notice}</Alert>}

      <Paper sx={{ p: 2, border: "1px solid #eceef4", boxShadow: "none" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            placeholder="Search name, email, title…"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(1); }}
            size="small"
            fullWidth
            slotProps={{ input: { startAdornment: <SearchRoundedIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> } }}
          />
          <TextField
            select
            label="Department"
            value={dept}
            onChange={(event) => { setDept(event.target.value); setPage(1); }}
            size="small"
            sx={{ minWidth: { sm: 220 } }}
          >
            <MenuItem value="">All departments</MenuItem>
            {departments.map((department) => <MenuItem key={department} value={department}>{department}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{ border: "1px solid #eceef4" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel active={sort.key === "name"} direction={sort.dir === 1 ? "asc" : "desc"} onClick={() => toggleSort("name")}>Employee</TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel active={sort.key === "department"} direction={sort.dir === 1 ? "asc" : "desc"} onClick={() => toggleSort("department")}>Department</TableSortLabel>
              </TableCell>
              <TableCell>Title</TableCell>
              <TableCell>
                <TableSortLabel active={sort.key === "age"} direction={sort.dir === 1 ? "asc" : "desc"} onClick={() => toggleSort("age")}>Age</TableSortLabel>
              </TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((employee) => (
              <TableRow key={employee.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={employee.image} alt={`${employee.firstName} ${employee.lastName}`} />
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{employee.firstName} {employee.lastName}</Typography>
                      <Typography variant="caption" color="text.secondary">{employee.email}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell><Chip label={employee.department} size="small" color="primary" variant="outlined" /></TableCell>
                <TableCell>{employee.title || "—"}</TableCell>
                <TableCell>{employee.age}</TableCell>
                <TableCell>{employee.phone || "—"}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Edit employee">
                    <IconButton aria-label={`Edit ${employee.firstName} ${employee.lastName}`} size="small" onClick={() => setEditing(employee)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete employee">
                    <IconButton aria-label={`Delete ${employee.firstName} ${employee.lastName}`} size="small" color="error" onClick={() => setToDelete(employee)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>No employees found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Showing {rows.length ? (current - 1) * PAGE_SIZE + 1 : 0}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
        </Typography>
        <Pagination count={pages} page={current} onChange={(_, nextPage) => setPage(nextPage)} color="primary" shape="rounded" />
      </Stack>

      {editing && (
        <Modal title={editing === "new" ? "Add employee" : "Edit employee"} onClose={() => setEditing(null)}>
          <EmployeeForm
            initial={editing === "new" ? { ...EMPTY_EMPLOYEE, department: departments[0] || "" } : editing}
            departments={departments}
            validatePhone={editing === "new"}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {toDelete && (
        <Modal title="Delete employee" onClose={() => setToDelete(null)}>
          <DialogContent>
            <Typography>
              Delete <strong>{toDelete.firstName} {toDelete.lastName}</strong>? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setToDelete(null)} color="inherit">Cancel</Button>
            <Button variant="contained" color="error" onClick={confirmDelete}>Delete employee</Button>
          </DialogActions>
        </Modal>
      )}
    </Stack>
  );
}
