import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
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
  Badge,
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
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  MarkEmailRead as MarkEmailReadIcon,
  FactCheck as RubricIcon,
  Menu as MenuIcon,
  NotificationsActive as NotifIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 240;

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const [openGroups, setOpenGroups] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread notification count for students
  useEffect(() => {
    if (user?.role !== "student") return;
    const fetchUnread = () => {
      import("axios").then(({ default: axios }) => {
        axios
          .get("/api/student/notifications/unread-count")
          .then((r) => setUnreadCount(r.data.count || 0))
          .catch(() => {});
      });
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [user?.role]);

  const isSelected = (path) => {
    if (path === "/student" || path === "/teacher" || path === "/admin") {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
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
    const mainItems = [];

    if (user?.role === "student") {
      mainItems.push(
        { text: "Trang chủ", icon: <DashboardIcon />, path: "/student" },
        { text: "Đề tài của tôi", icon: <AssignmentIcon />, path: "/student/my-topics" },
        { text: "Danh sách đề tài", icon: <SchoolIcon />, path: "/student/topics" },
        { text: "Tiến độ đề tài", icon: <CheckCircleIcon />, path: "/student/progress" },
        { text: "Điểm số & Nhận xét", icon: <GradeIcon />, path: "/student/grades" },
        { text: "Lịch sử đăng ký", icon: <HistoryIcon />, path: "/student/registration-history" },
        {
          text: "Thông báo",
          icon: (
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotifIcon />
            </Badge>
          ),
          path: "/student/notifications",
        },
      );
    } else if (user?.role === "teacher") {
      mainItems.push(
        { text: "Dashboard", icon: <DashboardIcon />, path: "/teacher" },
        {
          text: "Đề tài",
          icon: <AssignmentIcon />,
          children: [
            {
              text: "Quản lý đề tài",
              path: "/teacher/topics",
              icon: <AssignmentIcon />, // reuse same icon
            },
            {
              text: "Duyệt đề tài",
              path: "/teacher/topics/pending-approval",
              icon: <CheckCircleIcon />,
            },
          ],
        },
        {
          text: "Sinh viên",
          icon: <GroupIcon />,
          children: [
            {
              text: "Đăng ký sinh viên",
              path: "/teacher/students/registrations",
              icon: <GroupIcon />,
            },
            {
              text: "Sinh viên HD",
              path: "/teacher/students/guided",
              icon: <SchoolIcon />,
            },
          ],
        },
        { text: "Chấm điểm", icon: <GradeIcon />, path: "/teacher/grading" },
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
        {
          text: "Thông báo",
          icon: <MarkEmailReadIcon />,
          path: "/teacher/notifications",
        },
        {
          text: "Rubric",
          icon: <RubricIcon />,
          children: [
            {
              text: "Xem Rubric",
              path: "/teacher/rubric-view",
              icon: <RubricIcon />,
            },
            {
              text: "Chấm điểm SV",
              path: "/teacher/rubric-evaluation",
              icon: <GradeIcon />,
            },
          ],
        },
      );
    } else if (user?.role === "admin") {
      mainItems.push({
        text: "Quản lý hệ thống",
        icon: <AssignmentIcon />,
        path: "/admin",
      });
    }

    // Profile always last
    mainItems.push({ text: "Hồ sơ cá nhân", icon: <PersonIcon />, path: "/profile" });
    return mainItems;
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
          <Box display="flex" alignItems="center" gap={1}>
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => setMobileOpen((v) => !v)}
                size="small"
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
              Hệ Thống Quản Lý Đồ Án Tốt Nghiệp
            </Typography>
          </Box>

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
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: "#fafafa",
              borderRight: "1px solid #e0e0e0",
              mt: isMobile ? 0 : "64px",
              height: isMobile ? "100%" : "calc(100% - 64px)",
            },
          }}
        >
          {/* Spacer: đẩy menu xuống dưới AppBar khi dùng temporary drawer (mobile) */}
          {isMobile && <Toolbar />}
          {/* Navigation List — with active highlight */}
          <List sx={{ pt: 0.5, px: 0.5 }}>
            {getNavItems().map((item) => {
              const hasChildren = Boolean(item.children);
              const selected = !hasChildren && item.path ? isSelected(item.path) : false;
              return (
                <React.Fragment key={item.text}>
                  <ListItem
                    button
                    onClick={() => {
                      if (hasChildren) {
                        setOpenGroups((prev) => ({ ...prev, [item.text]: !prev[item.text] }));
                      } else if (item.path) {
                        navigate(item.path);
                        if (isMobile) setMobileOpen(false);
                      }
                    }}
                    selected={selected}
                    sx={{
                      mx: 0.5,
                      mb: 0.3,
                      borderRadius: "8px",
                      width: "calc(100% - 8px)",
                      py: 0.8,
                      transition: "all 0.15s ease",
                      bgcolor: selected ? "rgba(25,118,210,0.1)" : "transparent",
                      color: selected ? "primary.main" : "inherit",
                      "&:hover": {
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                        "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                      },
                      "& .MuiListItemIcon-root": {
                        color: selected ? "primary.main" : undefined,
                        minWidth: 38,
                      },
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: "0.855rem", fontWeight: selected ? 700 : 400 }}
                    />
                    {hasChildren && (openGroups[item.text] ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />)}
                    {selected && (
                      <Box sx={{ width: 3, height: 20, bgcolor: "primary.main", borderRadius: 4, ml: 0.5 }} />
                    )}
                  </ListItem>

                  {/* Sub-items */}
                  {hasChildren && openGroups[item.text] && item.children.map((sub) => {
                    const subSelected = isSelected(sub.path);
                    return (
                      <ListItem
                        button
                        key={sub.text}
                        onClick={() => { navigate(sub.path); if (isMobile) setMobileOpen(false); }}
                        selected={subSelected}
                        sx={{
                          mx: 0.5, mb: 0.3, pl: 4, borderRadius: "8px",
                          width: "calc(100% - 8px)", py: 0.7,
                          bgcolor: subSelected ? "rgba(25,118,210,0.08)" : "transparent",
                          color: subSelected ? "primary.main" : "inherit",
                          "&:hover": {
                            bgcolor: "primary.light",
                            color: "primary.contrastText",
                            "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                          },
                          "& .MuiListItemIcon-root": {
                            color: subSelected ? "primary.main" : undefined,
                            minWidth: 34,
                          },
                        }}
                      >
                        <ListItemIcon sx={{ fontSize: "small" }}>{sub.icon}</ListItemIcon>
                        <ListItemText
                          primary={sub.text}
                          primaryTypographyProps={{ fontSize: "0.82rem", fontWeight: subSelected ? 700 : 400 }}
                        />
                      </ListItem>
                    );
                  })}
                </React.Fragment>
              );
            })}
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
            p: 0,
            backgroundColor: "#f5f5f5",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
