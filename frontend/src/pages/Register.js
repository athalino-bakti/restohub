import React, { useState, useContext } from "react";
import { useMutation, gql } from "@apollo/client";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const REGISTER_MUTATION = gql`
  mutation Register($nama: String!, $email: String!, $password: String!) {
    daftar(nama: $nama, email: $email, password: $password) {
      token
      user {
        id
        nama
        email
        role
      }
    }
  }
`;

const Register = () => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      login(data.daftar.token, data.daftar.user);
      navigate("/");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    registerMutation({
      variables: {
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
      },
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Register
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Name"
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          margin="normal"
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </Box>
    </Paper>
  );
};

export default Register;
