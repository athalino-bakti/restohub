import React, { useContext } from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import {
  Restaurant,
  ShoppingCart,
  Payment,
  Inventory,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const cards = [
    {
      title: "Products",
      icon: <Restaurant fontSize="large" />,
      path: "/products",
      description: "Manage restaurant products",
    },
    {
      title: "Orders",
      icon: <ShoppingCart fontSize="large" />,
      path: "/orders",
      description: "View and manage orders",
    },
    {
      title: "Payments",
      icon: <Payment fontSize="large" />,
      path: "/payments",
      description: "Track payment transactions",
    },
    {
      title: "Inventory",
      icon: <Inventory fontSize="large" />,
      path: "/inventory",
      description: "Monitor stock levels",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to RestoHub, {user.nama}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Manage your restaurant operations efficiently
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
                transition: "box-shadow 0.3s",
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Box sx={{ color: "primary.main", mb: 2 }}>{card.icon}</Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
