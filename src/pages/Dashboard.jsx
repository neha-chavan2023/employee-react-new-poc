import { useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import { useData } from "../context/DataContext.jsx";

const metricCards = [
  { label: "Employees", key: "employees", icon: <GroupsRoundedIcon />, color: "#5b5bd6", tint: "#eeeeff" },
  { label: "Departments", key: "departments", icon: <BusinessRoundedIcon />, color: "#0f9f92", tint: "#e5f7f4" },
];

export default function Dashboard() {
  const { employees, departments } = useData();

  const byDept = useMemo(() => {
    const map = {};
    employees.forEach((e) => (map[e.department] = (map[e.department] || 0) + 1));
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

  const values = {
    employees: employees.length,
    departments: departments.length,
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Dashboard</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>A quick overview of your people and teams.</Typography>
      </Box>

      <Grid container spacing={2}>
        {metricCards.map((metric) => (
          <Grid size={{ xs: 12, sm: 6 }} key={metric.key}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{metric.label}</Typography>
                    <Typography variant="h4" sx={{ mt: 1, color: "text.primary" }}>
                      {values[metric.key]}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 44, height: 44, display: "grid", placeItems: "center",
                    borderRadius: 2.5, color: metric.color, bgcolor: metric.tint,
                  }}>
                    {metric.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6">Employees per department</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Team size across all departments
          </Typography>
          <Box sx={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={byDept} margin={{ top: 8, right: 12, left: -16, bottom: 38 }}>
                <CartesianGrid stroke="#eef0f6" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 12, fill: "#737990" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#737990" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f6f7fb" }} />
                <Bar dataKey="count" name="Employees" fill="#5b5bd6" radius={[8, 8, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
