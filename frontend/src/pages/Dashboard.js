import React, { useContext, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import {
  Restaurant,
  ShoppingCart,
  Payment,
  Inventory,
  ArrowForward,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin";

  const allCards = [
    {
      title: "Products",
      icon: Restaurant,
      path: "/products",
      description: "Manage restaurant products",
      color: "#6366f1",
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      path: "/orders",
      description: "View and manage orders",
      color: "#ec4899",
      gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
    },
    {
      title: "Payments",
      icon: Payment,
      path: "/payments",
      description: "Track payment transactions",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    },
    {
      title: "Inventory",
      icon: Inventory,
      path: "/inventory",
      description: "Monitor stock levels",
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    },
  ];

  // Filter cards based on user role
  const cards = isAdmin
    ? allCards
    : allCards.filter(
        (card) => card.title === "Products" || card.title === "Orders"
      );

  return (
    <Box>
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
        >
          Welcome back, {user.nama}! 👋
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ fontWeight: 400 }}
        >
          Manage your restaurant operations efficiently
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <Card
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: "grey.200",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    borderColor: card.color,
                  },
                }}
                onClick={() => navigate(card.path)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: card.gradient,
                      }}
                    >
                      <IconComponent sx={{ fontSize: 28 }} />
                    </Avatar>
                    <ArrowForward
                      sx={{
                        color: "text.secondary",
                        fontSize: 20,
                        transition: "all 0.3s",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Dashboard;
