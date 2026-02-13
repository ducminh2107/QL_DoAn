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
  Schedule as ScheduleIcon,
  Description as LogIcon,
  CloudDownload as ExportIcon,
  CloudUpload as ImportIcon,
} from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 240;

const AdminLayout = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { text: "Quản lý người dùng", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Học kỳ", icon: <CalendarIcon />, path: "/admin/semesters" },
    {
      text: "Đợt đăng ký",
      icon: <AssignmentIcon />,
      path: "/admin/registration-periods",
    },
    { text: "Hội đồng", icon: <GroupsIcon />, path: "/admin/councils" },
    { text: "Rubric", icon: <RubricIcon />, path: "/admin/rubrics" },
    // Content Management
    {
      text: "Đề tài hệ thống",
      icon: <TopicIcon />,
      path: "/admin/system-topics",
    },
    { text: "Ngành học", icon: <SchoolIcon />, path: "/admin/faculty-major" },
    {
      text: "Danh mục đề tài",
      icon: <CategoryIcon />,
      path: "/admin/topic-categories",
    },
    // Reporting & Analytics
    { text: "Báo cáo", icon: <ReportIcon />, path: "/admin/reports" },
    // Organization
    { text: "Lịch trình", icon: <ScheduleIcon />, path: "/admin/schedules" },
    // System Administration
    { text: "Nhật ký hệ thống", icon: <LogIcon />, path: "/admin/logs" },
    { text: "Cài đặt", icon: <SettingsIcon />, path: "/admin/settings" },
    // Data Management
    { text: "Xuất dữ liệu", icon: <ExportIcon />, path: "/admin/export" },
    { text: "Nhập/Xuất", icon: <ImportIcon />, path: "/admin/import-export" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* App Bar - Full Width */}
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
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 700 }}
          >
            Admin Panel
          </Typography>

          {/* User Menu */}
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="body2"
              sx={{ mr: 1, display: { xs: "none", sm: "block" } }}
            >
              {user?.user_name}
            </Typography>
            <IconButton onClick={handleMenuClick} sx={{ p: 0.5 }}>
              <Avatar
                src={user?.user_avatar}
                sx={{ width: 40, height: 40, fontSize: "1rem" }}
              >
                {user?.user_name?.charAt(0) || "A"}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                onClick={() => {
                  navigate("/profile");
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Hồ sơ
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Đăng xuất
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content Area with Sidebar and Main */}
      <Box sx={{ display: "flex", flexGrow: 1, mt: "64px" }}>
        {/* Sidebar Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: "#fafafa",
              borderRight: "1px solid #e0e0e0",
            },
          }}
        >
          {/* Navigation List */}
          <List sx={{ pt: 2 }}>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "primary.light",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                  backgroundColor:
                    location.pathname === item.path
                      ? "rgba(33, 150, 243, 0.1)"
                      : "transparent",
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Role Badge */}
          <Box sx={{ p: 2, textAlign: "center", mt: "auto" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Vai trò: Quản trị viên
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 0.5 }}
            >
              Mã: {user?.user_id}
            </Typography>
          </Box>
        </Drawer>

        {/* Main Content */}
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
