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
import {
  Person,
  Email,
  Lock,
  Restaurant,
} from "@mui/icons-material";
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

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
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
            maxWidth: 500,
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
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join RestoHub and start managing your restaurant
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
              label="Full Name"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "text.secondary", fontSize: 20 }} />
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
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
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
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
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
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
