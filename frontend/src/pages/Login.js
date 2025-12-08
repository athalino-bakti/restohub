import React, { useState, useContext } from "react";
import { useMutation, gql } from "@apollo/client";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Alert,
  Container,
  Link,
  InputAdornment,
} from "@mui/material";
import { Email, Lock, Restaurant } from "@mui/icons-material";
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
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "calc(100vh - 200px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            width: "100%",
            maxWidth: 450,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
            background: "white",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                display: "inline-flex",
                p: 2,
                borderRadius: 2,
                background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                mb: 2,
              }}
            >
              <Restaurant sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue to RestoHub
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-icon": {
                  alignItems: "center",
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 2,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                },
                "&:disabled": {
                  background: "grey.300",
                },
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate("/register")}
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
