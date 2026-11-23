import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Alert, Avatar, Box, Button, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";

const drawerWidth = 240;
const navigation = [
  { label: "Dashboard", to: "/", icon: <DashboardRoundedIcon /> },
  { label: "Employees", to: "/employees", icon: <GroupsRoundedIcon /> },
  { label: "Departments", to: "/departments", icon: <BusinessRoundedIcon /> },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { loading, error } = useData();
  const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menu = (
    <Box sx={{ width: drawerWidth, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>EmpManager</Typography>
      <List>
        {navigation.map(({ label, to, icon }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            end={to === "/"}
            selected={to === "/" ? pathname === "/" : pathname.startsWith(to)}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
        <Avatar src={user.image} alt={user.name} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap>{user.name}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
        </Box>
        <IconButton aria-label="Sign out" onClick={logout}>
          <LogoutRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {!isMobile && (
        <Drawer variant="permanent" sx={{ width: drawerWidth, "& .MuiDrawer-paper": { width: drawerWidth } }}>
          {menu}
        </Drawer>
      )}
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        {isMobile && (
          <>
            <Toolbar>
              <IconButton aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
                <MenuRoundedIcon />
              </IconButton>
              <Typography variant="h6">EmpManager</Typography>
              <Box sx={{ flex: 1 }} />
              <Button onClick={logout}>Sign out</Button>
            </Toolbar>
            <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>{menu}</Drawer>
          </>
        )}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load data: {error}</Alert>}
          {loading ? <Typography color="text.secondary">Loading employees…</Typography> : <Outlet />}
        </Box>
      </Box>
    </Box>
  );
}
