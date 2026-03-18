import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  Groups as GroupsIcon,
  FactCheck as RubricIcon,
  BarChart as ReportIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Topic as TopicIcon,
  School as SchoolIcon,
  Category as CategoryIcon,
  Description as LogIcon,
  SwapHoriz as ImportExportIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 240;

// ── Menu groups ──────────────────────────────────────────────────────────────
const menuGroups = [
  {
    // No label = no section header (top items always visible)
    items: [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
      { text: "Người dùng", icon: <PeopleIcon />, path: "/admin/users" },
    ],
  },
  {
    label: "HỌC KỲ & ĐĂNG KÝ",
    items: [
      { text: "Học kỳ", icon: <CalendarIcon />, path: "/admin/semesters" },
      {
        text: "Đợt đăng ký",
        icon: <AssignmentIcon />,
        path: "/admin/registration-periods",
      },
    ],
  },
  {
    label: "CHẤM ĐIỂM",
    items: [
      { text: "Hội đồng", icon: <GroupsIcon />, path: "/admin/councils" },
      { text: "Rubric", icon: <RubricIcon />, path: "/admin/rubrics" },
      { text: "Lịch trình", icon: <ScheduleIcon />, path: "/admin/schedules" },
    ],
  },
  {
    label: "NỘI DUNG",
    items: [
      {
        text: "Đề tài hệ thống",
        icon: <TopicIcon />,
        path: "/admin/system-topics",
      },
      {
        text: "Khoa & Ngành",
        icon: <SchoolIcon />,
        path: "/admin/faculty-major",
      },
      {
        text: "Danh mục đề tài",
        icon: <CategoryIcon />,
        path: "/admin/topic-categories",
      },
    ],
  },
  {
    label: "HỆ THỐNG",
    items: [
      {
        text: "Nhập/Xuất dữ liệu",
        icon: <ImportExportIcon />,
        path: "/admin/import-export",
      },
      { text: "Nhật ký", icon: <LogIcon />, path: "/admin/logs" },
      { text: "Cài đặt", icon: <SettingsIcon />, path: "/admin/settings" },
    ],
  },
];

const AdminLayout = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const isSelected = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ── AppBar ───────────────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.primary.main,
          width: "100%",
          top: 0,
          left: 0,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: "#fff",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                A
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "-0.3px",
                color: "#fff",
              }}
            >
              Admin Panel
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="body2"
              sx={{
                mr: 1,
                display: { xs: "none", sm: "block" },
                fontFamily: "'Inter', sans-serif",
                color: "#94a3b8",
              }}
            >
              {user?.user_name}
            </Typography>
            <Tooltip title="Tài khoản">
              <IconButton onClick={handleMenuClick} sx={{ p: 0.5 }}>
                <Avatar
                  src={user?.user_avatar}
                  sx={{
                    width: 38,
                    height: 38,
                    fontSize: "0.95rem",
                    bgcolor: "#3b82f6",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {user?.user_name?.charAt(0) || "A"}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: { borderRadius: "8px", mt: 0.5, minWidth: 160 },
              }}
            >
              <MenuItem
                onClick={() => {
                  navigate("/profile");
                  handleMenuClose();
                }}
                sx={{ fontFamily: "'Inter', sans-serif" }}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Hồ sơ cá nhân
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{ color: "error.main", fontFamily: "'Inter', sans-serif" }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                Đăng xuất
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Content + Sidebar ────────────────────────────────────────── */}
      <Box sx={{ display: "flex", flexGrow: 1, mt: "64px" }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "#fafafa",
              borderRight: "1px solid #e0e0e0",
              mt: "64px",
              height: "calc(100% - 64px)",
              overflowX: "hidden",
            },
          }}
        >
          <Box sx={{ py: 1.5, overflowY: "auto", height: "100%" }}>
            {menuGroups.map((group, gIdx) => (
              <Box key={gIdx}>
                {/* Section header */}
                {group.label && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      px: 2.5,
                      pt: gIdx === 0 ? 1 : 2,
                      pb: 0.5,
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      letterSpacing: "0.08em",
                      color: "#94a3b8",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {group.label}
                  </Typography>
                )}

                <List dense disablePadding>
                  {group.items.map((item) => {
                    const selected = isSelected(item.path);
                    return (
                      <ListItem
                        button
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        selected={selected}
                        sx={{
                          mx: 1,
                          mb: 0.3,
                          borderRadius: "8px",
                          width: "calc(100% - 16px)",
                          py: 0.8,
                          transition: "all 0.15s ease",
                          bgcolor: selected
                            ? "rgba(25,118,210,0.1)"
                            : "transparent",
                          color: selected ? "primary.main" : "inherit",
                          "&:hover": {
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                            "& .MuiListItemIcon-root": {
                              color: "primary.contrastText",
                            },
                          },
                          "& .MuiListItemIcon-root": {
                            color: selected ? "primary.main" : undefined,
                            minWidth: 36,
                          },
                        }}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontSize: "0.855rem",
                            fontWeight: selected ? 600 : 400,
                            fontFamily: "'Inter', sans-serif",
                          }}
                        />
                        {selected && (
                          <Box
                            sx={{
                              width: 3,
                              height: 20,
                              bgcolor: "primary.main",
                              borderRadius: 4,
                              ml: 0.5,
                            }}
                          />
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            ))}
          </Box>

          {/* Footer */}
          <Box
            sx={{ p: 2, borderTop: "1px solid #e0e0e0", bgcolor: "#f8fafc" }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#94a3b8",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                display: "block",
              }}
            >
              Quản trị viên
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#cbd5e1", fontFamily: "'Inter', sans-serif" }}
            >
              {user?.user_id}
            </Typography>
          </Box>
        </Drawer>

        {/* ── Main Content ─────────────────────────────────────────── */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "#f5f5f5",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
