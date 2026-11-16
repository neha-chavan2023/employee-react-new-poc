import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Avatar, Box, Chip, Divider, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Stack, Toolbar, Tooltip, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";

const drawerWidth = 264;

export default function Layout() {
  const { user, logout } = useAuth();
  const { loading, error } = useData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { label: "Dashboard", to: "/", icon: <DashboardRoundedIcon /> },
    { label: "Employees", to: "/employees", icon: <GroupsRoundedIcon /> },
    { label: "Departments", to: "/departments", icon: <BusinessRoundedIcon /> },
  ];

  const drawer = (
    <Stack sx={{ height: "100%", p: 2.5 }} spacing={3}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 0.5, pt: 0.5 }}>
        <Box sx={{
          width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 3,
          color: "#fff", fontSize: 22, fontWeight: 800, bgcolor: "primary.main",
          boxShadow: "0 8px 18px rgba(91,91,214,.32)",
        }}>E</Box>
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1.15 }}>EmpManager</Typography>
          <Typography variant="caption" color="text.secondary">PEOPLE OPERATIONS</Typography>
        </Box>
      </Stack>

      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ pl: 1.5, fontWeight: 700, letterSpacing: 1.2 }}>
          WORKSPACE
        </Typography>
        <List disablePadding sx={{ mt: 1 }}>
          {navigation.map(({ label, to, icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <ListItemButton
                key={to}
                component={NavLink}
                to={to}
                end={to === "/"}
                onClick={() => setMobileOpen(false)}
                sx={{
                  minHeight: 48, mb: 0.5, px: 1.5, borderRadius: 2.5,
                  color: "text.secondary",
                  "& .MuiListItemIcon-root": { minWidth: 40, color: "inherit" },
                  "&:hover": { bgcolor: "rgba(91,91,214,.07)", color: "primary.main" },
                  ...(active && {
                    bgcolor: "primary.main", color: "#fff !important", fontWeight: 700,
                    boxShadow: "0 8px 18px rgba(91,91,214,.28)",
                    "&:hover": { bgcolor: "primary.dark", color: "#fff !important" },
                    "& .MuiListItemIcon-root": { color: "#fff" },
                  }),
                }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 650 }} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ flex: 1 }} />
      <Divider />
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        sx={{
          minWidth: 0, p: 1, pl: 1.25, borderRadius: 2.5,
          border: "1px solid #eceef4", bgcolor: "#fafaff",
        }}
      >
        <Avatar src={user.image} alt={user.name} sx={{ width: 38, height: 38, flexShrink: 0 }}>
          <PersonRoundedIcon />
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
          <Typography variant="body2" fontWeight={700} noWrap>{user.name}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
            {user.email}
          </Typography>
        </Box>
        <Tooltip title="Sign out" arrow>
          <IconButton
            aria-label="Sign out"
            onClick={logout}
            size="small"
            sx={{
              flexShrink: 0, color: "text.secondary", bgcolor: "background.paper",
              border: "1px solid #e6e8f2",
              "&:hover": {
                color: "error.main", bgcolor: "rgba(211,47,47,.06)",
                borderColor: "rgba(211,47,47,.35)",
              },
            }}
          >
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth, flexShrink: 0,
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", borderRight: "1px solid #eceef4" },
          }}
        >
          {drawer}
        </Drawer>
      )}
      {isMobile && (
        <>
          <Toolbar sx={{ bgcolor: "background.paper", borderBottom: "1px solid #eceef4" }}>
            <IconButton aria-label="Open navigation" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuRoundedIcon />
            </IconButton>
            <Typography variant="h6">EmpManager</Typography>
            <Box sx={{ flex: 1 }} />
            <Chip size="small" avatar={<Avatar src={user.image} />} label={user.name} variant="outlined" />
          </Toolbar>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" } }}
          >
            {drawer}
          </Drawer>
        </>
      )}
      <Box
        component="main"
        sx={{
          minWidth: 0, minHeight: "100vh", p: { xs: 2, sm: 3.5 },
          ml: isMobile ? 0 : `${drawerWidth}px`,
        }}
      >
        {error && <Chip color="error" label={`Failed to load data: ${error}`} sx={{ mb: 2, maxWidth: "100%" }} />}
        {loading ? (
          <Typography color="text.secondary">Loading employees…</Typography>
        ) : (
          <Outlet />
        )}
      </Box>
    </Box>
  );
}
