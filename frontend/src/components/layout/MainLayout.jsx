import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
  Grade as GradeIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 240;

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

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

  // Navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
      { text: "Hồ sơ", icon: <PersonIcon />, path: "/profile" },
    ];

    if (user?.role === "student") {
      baseItems.push(
        { text: "Đề tài của tôi", icon: <AssignmentIcon />, path: "/student" },
        {
          text: "Danh sách đề tài",
          icon: <SchoolIcon />,
          path: "/student/topics",
        }
      );
    } else if (user?.role === "teacher") {
      baseItems.push(
        { text: "Dashboard", icon: <DashboardIcon />, path: "/teacher" },
        {
          text: "Quản lý đề tài",
          icon: <AssignmentIcon />,
          path: "/teacher/topics",
        },
        {
          text: "Duyệt đề tài",
          icon: <CheckCircleIcon />,
          path: "/teacher/topics/pending-approval",
        },
        {
          text: "Đăng ký sinh viên",
          icon: <GroupIcon />,
          path: "/teacher/students/registrations",
        },
        {
          text: "Sinh viên HD",
          icon: <SchoolIcon />,
          path: "/teacher/students/guided",
        },
        { text: "Chấm điểm", icon: <GradeIcon />, path: "/teacher/grading" }
      );
    } else if (user?.role === "admin") {
      baseItems.push({
        text: "Quản lý hệ thống",
        icon: <AssignmentIcon />,
        path: "/admin",
      });
    }

    return baseItems;
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.primary.main,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Hệ Thống Quản Lý Luận Văn
          </Typography>

          {/* User menu */}
          <Box display="flex" alignItems="center">
            <Typography
              variant="body2"
              sx={{ mr: 2, display: { xs: "none", sm: "block" } }}
            >
              {user?.user_name}
            </Typography>
            <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
              <Avatar>{user?.user_name?.charAt(0) || "U"}</Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
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

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar>
          <IconButton onClick={handleDrawerToggle}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </Toolbar>
        <Divider />

        {/* Navigation List */}
        <List>
          {getNavItems().map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                "&:hover": {
                  backgroundColor: "primary.light",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>

        <Divider />

        {/* Role Badge */}
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Vai trò:{" "}
            {user?.role === "admin"
              ? "Quản trị viên"
              : user?.role === "teacher"
                ? "Giảng viên"
                : "Sinh viên"}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#f5f5f5",
        }}
      >
        {children || <Outlet />}
      </Box>
    </Box>
  );
};

export default MainLayout;
