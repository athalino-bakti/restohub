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
import {
  Inventory as InventoryIcon,
  Edit,
  Delete,
  Save,
  Cancel,
} from "@mui/icons-material";

const GET_INVENTORY = gql`
  query GetInventory {
    daftarInventori {
      id
      produkId
      stok
      lokasi
    }
  }
`;

const UPDATE_INVENTORY = gql`
  mutation UpdateInventory(
    $id: ID!
    $produkId: ID
    $stok: Int
    $lokasi: String
  ) {
    updateInventori(
      id: $id
      produkId: $produkId
      stok: $stok
      lokasi: $lokasi
    ) {
      id
      produkId
      stok
      lokasi
    }
  }
`;

const DELETE_INVENTORY = gql`
  mutation DeleteInventory($id: ID!) {
    hapusInventori(id: $id)
  }
`;

const Inventory = () => {
  const { loading, error, data, refetch } = useQuery(GET_INVENTORY);
  const [updateInventory] = useMutation(UPDATE_INVENTORY);
  const [deleteInventory] = useMutation(DELETE_INVENTORY);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    produkId: "",
    stok: 0,
    lokasi: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

  if (loading)
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  if (error)
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error.message}
      </Alert>
    );

  const getStockStatus = (stok) => {
    if (stok === 0) return { label: "Out of Stock", color: "error" };
    if (stok < 10) return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({
      produkId: item.produkId,
      stok: item.stok,
      lokasi: item.lokasi || "",
    });
  };

  const handleSave = async () => {
    try {
      await updateInventory({
        variables: {
          id: editingItem,
          ...editForm,
        },
      });
      setEditingItem(null);
      refetch();
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
  };

  const handleDelete = (item) => {
    setDeleteDialog({ open: true, item });
  };

  const confirmDelete = async () => {
    try {
      await deleteInventory({
        variables: { id: deleteDialog.item.id },
      });
      setDeleteDialog({ open: false, item: null });
      refetch();
    } catch (error) {
      console.error("Error deleting inventory:", error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Inventory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor stock levels and manage inventory
        </Typography>
      </Box>

      {data.daftarInventori && data.daftarInventori.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 2,
          }}
        >
          <InventoryIcon
            sx={{
              fontSize: 80,
              color: "grey.300",
              mb: 2,
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No inventory items yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inventory records will appear here
          </Typography>
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
                <TableCell>Product ID</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data &&
                data.daftarInventori &&
                data.daftarInventori.map((item) => {
                  const status = getStockStatus(item.stok);
                  return (
                    <TableRow
                      key={item.id}
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
                          #{item.produkId.slice(-8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color:
                              item.stok === 0 ? "error.main" : "text.primary",
                          }}
                        >
                          {item.stok}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.lokasi || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status.label}
                          color={status.color}
                          size="small"
                          sx={{
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(item)}
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(item)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editingItem !== null}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Inventory Item</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Product ID"
            value={editForm.produkId}
            onChange={(e) =>
              setEditForm({ ...editForm, produkId: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Stock"
            type="number"
            value={editForm.stok}
            onChange={(e) =>
              setEditForm({ ...editForm, stok: parseInt(e.target.value) || 0 })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={editForm.lokasi}
            onChange={(e) =>
              setEditForm({ ...editForm, lokasi: e.target.value })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete inventory item for product #
            {deleteDialog.item?.produkId.slice(-8)}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, item: null })}>
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

export default Inventory;
