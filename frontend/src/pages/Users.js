import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { People, Edit, Delete, Add } from "@mui/icons-material";

const GET_USERS = gql`
  query GetUsers {
    daftarPengguna {
      id
      nama
      email
      role
      tanggalDibuat
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($nama: String!, $email: String!, $role: String) {
    buatPengguna(nama: $nama, email: $email, role: $role) {
      id
      nama
      email
      role
      tanggalDibuat
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $nama: String, $email: String, $role: String) {
    updatePengguna(id: $id, nama: $nama, email: $email, role: $role) {
      id
      nama
      email
      role
      tanggalDibuat
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    hapusPengguna(id: $id)
  }
`;

const Users = () => {
  const { loading, error, data, refetch } = useQuery(GET_USERS);
  const [createUser] = useMutation(CREATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    role: "customer",
  });
  const [createError, setCreateError] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({
      nama: "",
      email: "",
      role: "customer",
    });
    setCreateError("");
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setFormData({
      nama: user.nama,
      email: user.email,
      role: user.role || "customer",
    });
    setOpen(true);
  };

  const handleDelete = (user) => {
    setDeleteDialog({ open: true, user });
  };

  const confirmDelete = async () => {
    try {
      await deleteUser({
        variables: { id: deleteDialog.user.id },
      });
      setDeleteDialog({ open: false, user: null });
      refetch();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");
    try {
      if (editingUser) {
        await updateUser({
          variables: {
            id: editingUser,
            ...formData,
          },
        });
      } else {
        await createUser({
          variables: formData,
        });
      }
      refetch();
      handleClose();
    } catch (error) {
      setCreateError(error.message);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "manager":
        return "warning";
      case "staff":
        return "info";
      case "customer":
        return "success";
      default:
        return "default";
    }
  };

  if (loading)
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="text.secondary">Loading users...</Typography>
      </Box>
    );
  if (error)
    return (
      <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
        {error.message}
      </Alert>
    );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Users
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage user accounts and roles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
          sx={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            },
          }}
        >
          Add User
        </Button>
      </Box>

      {data.daftarPengguna.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 2,
          }}
        >
          <People
            sx={{
              fontSize: 80,
              color: "grey.300",
              mb: 2,
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No users yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Get started by adding your first user
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpen}
            sx={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              },
            }}
          >
            Add User
          </Button>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "grey.50",
                  "& th": {
                    fontWeight: 600,
                    color: "text.primary",
                    borderBottom: "2px solid",
                    borderColor: "grey.200",
                  },
                }}
              >
                <TableCell>User ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.daftarPengguna.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "grey.50",
                    },
                    "& td": {
                      borderBottom: "1px solid",
                      borderColor: "grey.100",
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      #{user.id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.nama}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role || "customer"}
                      color={getRoleColor(user.role)}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(user.tanggalDibuat).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(user)}
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "grey.200",
            fontWeight: 600,
          }}
        >
          {editingUser ? "Edit User" : "Add New User"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {createError && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
            >
              {createError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Role"
              select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              margin="normal"
              sx={{ mb: 2 }}
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "grey.50",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              },
            }}
          >
            {editingUser ? "Update User" : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{deleteDialog.user?.nama}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
