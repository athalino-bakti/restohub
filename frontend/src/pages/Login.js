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

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    masuk(email: $email, password: $password) {
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      login(data.masuk.token, data.masuk.user);
      navigate("/");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    loginMutation({ variables: { email, password } });
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Login
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Box>
    </Paper>
  );
};

export default Login;
