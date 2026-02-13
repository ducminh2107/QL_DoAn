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
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
  Grade as GradeIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Assessment as AssessmentIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 240;

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

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
      { text: "Hồ sơ", icon: <PersonIcon />, path: "/profile" },
    ];

    if (user?.role === "student") {
      baseItems.push(
        {
          text: "Trang chủ",
          icon: <DashboardIcon />,
          path: "/student",
        },
        {
          text: "Đề tài của tôi",
          icon: <AssignmentIcon />,
          path: "/student/my-topics",
        },
        {
          text: "Danh sách đề tài",
          icon: <SchoolIcon />,
          path: "/student/topics",
        },
        {
          text: "Tiến độ đề tài",
          icon: <CheckCircleIcon />,
          path: "/student/progress",
        },
        {
          text: "Điểm số & Nhận xét",
          icon: <GradeIcon />,
          path: "/student/grades",
        },
        {
          text: "Lịch sử đăng ký",
          icon: <AssignmentIcon />,
          path: "/student/registration-history",
        },
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
        { text: "Chấm điểm", icon: <GradeIcon />, path: "/teacher/grading" },
        {
          text: "Đánh giá Rubric",
          icon: <AssessmentIcon />,
          path: "/teacher/rubric-evaluation",
        },
        {
          text: "Tham gia Hội Đồng",
          icon: <GroupsIcon />,
          path: "/teacher/councils",
        },
        {
          text: "Theo dõi Tiến độ",
          icon: <TrendingUpIcon />,
          path: "/teacher/progress",
        },
        {
          text: "Lịch sử Giảng Dạy",
          icon: <HistoryIcon />,
          path: "/teacher/history",
        },
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
            Hệ Thống Quản Lý Luận Văn
          </Typography>

          {/* User menu */}
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
                {user?.user_name?.charAt(0) || "U"}
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
            {getNavItems().map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
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
              Vai trò:{" "}
              {user?.role === "admin"
                ? "Quản trị viên"
                : user?.role === "teacher"
                  ? "Giảng viên"
                  : "Sinh viên"}
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
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
