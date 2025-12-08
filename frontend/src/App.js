import React from "react";
import { Routes, Route } from "react-router-dom";
import { Container, Box } from "@mui/material";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Inventory from "./pages/Inventory";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Box sx={{ flexGrow: 1, minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/inventory" element={<Inventory />} />
          </Routes>
        </Container>
      </Box>
    </AuthProvider>
  );
}

export default App;
