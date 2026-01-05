import React, { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from "@mui/material";
import {
  AccountCircle,
  Restaurant,
  Dashboard as DashboardIcon,
  Logout,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const getInitials = (name = "First Name") => {
    if (name == undefined) {
      return "FN";
    } else {
      name = name.trim();
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "grey.200",
        mb: 0,
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            mr: 4,
          }}
          onClick={() => navigate("/")}
        >
          <Restaurant
            sx={{
              mr: 1.5,
              color: "primary.main",
              fontSize: 28,
            }}
          />
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            RestoHub
          </Typography>
        </Box>

        {user && (
          <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
            <Button
              startIcon={<DashboardIcon />}
              onClick={() => navigate("/")}
              sx={{
                color:
                  location.pathname === "/" ? "primary.main" : "text.secondary",
                fontWeight: location.pathname === "/" ? 600 : 400,
                "&:hover": {
                  backgroundColor: "grey.50",
                },
              }}
            >
              Dashboard
            </Button>
            <Button
              onClick={() => navigate("/products")}
              sx={{
                color:
                  location.pathname === "/products"
                    ? "primary.main"
                    : "text.secondary",
                fontWeight: location.pathname === "/products" ? 600 : 400,
                "&:hover": {
                  backgroundColor: "grey.100",
                },
              }}
            >
              Products
            </Button>
            <Button
              onClick={() => navigate("/orders")}
              sx={{
                color:
                  location.pathname === "/orders"
                    ? "primary.main"
                    : "text.secondary",
                fontWeight: location.pathname === "/orders" ? 600 : 400,
                "&:hover": {
                  backgroundColor: "grey.50",
                },
              }}
            >
              Orders
            </Button>
            <Button
              onClick={() => navigate("/payments")}
              sx={{
                color:
                  location.pathname === "/payments"
                    ? "primary.main"
                    : "text.secondary",
                fontWeight: location.pathname === "/payments" ? 600 : 400,
                "&:hover": {
                  backgroundColor: "grey.50",
                },
              }}
            >
              Payments
            </Button>
            <Button
              onClick={() => navigate("/inventory")}
              sx={{
                color:
                  location.pathname === "/inventory"
                    ? "primary.main"
                    : "text.secondary",
                fontWeight: location.pathname === "/inventory" ? 600 : 400,
                "&:hover": {
                  backgroundColor: "grey.50",
                },
              }}
            >
              Inventory
            </Button>
          </Box>
        )}

        {user ? (
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={user.role}
              size="small"
              sx={{
                backgroundColor: "primary.light",
                color: "white",
                fontWeight: 500,
                display: { xs: "none", sm: "flex" },
              }}
            />
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{ cursor: "pointer" }}
              onClick={handleMenu}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "primary.main",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                {getInitials(user.nama)}
              </Avatar>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                  display: { xs: "none", md: "block" },
                }}
              >
                {user.nama}
              </Typography>
            </Box>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  navigate("/");
                  handleClose();
                }}
                sx={{ py: 1.5 }}
              >
                <DashboardIcon sx={{ mr: 2, fontSize: 20 }} />
                Dashboard
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{ py: 1.5, color: "error.main" }}
              >
                <Logout sx={{ mr: 2, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={() => navigate("/login")}
              sx={{
                borderColor: "grey.300",
                color: "text.primary",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "grey.50",
                },
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/register")}
              sx={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                },
              }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
