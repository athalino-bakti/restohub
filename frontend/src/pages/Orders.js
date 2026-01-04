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
import { ShoppingCart, Edit, Delete } from "@mui/icons-material";

const GET_ORDERS = gql`
  query GetOrders {
    daftarPesanan {
      id
      penggunaId
      produk {
        produkId
        jumlah
        harga
      }
      total
      status
      tanggalDibuat
    }
  }
`;

const UPDATE_ORDER = gql`
  mutation UpdateOrder($id: ID!, $total: Float, $status: String) {
    updatePesanan(id: $id, total: $total, status: $status) {
      id
      penggunaId
      produk {
        produkId
        jumlah
        harga
      }
      total
      status
      tanggalDibuat
    }
  }
`;

const DELETE_ORDER = gql`
  mutation DeleteOrder($id: ID!) {
    hapusPesanan(id: $id)
  }
`;

const Orders = () => {
  const { loading, error, data, refetch } = useQuery(GET_ORDERS);
  const [updateOrder] = useMutation(UPDATE_ORDER);
  const [deleteOrder] = useMutation(DELETE_ORDER);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    penggunaId: "",
    produk: [],
    total: 0,
    status: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    order: null,
  });

  if (loading)
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="text.secondary">Loading orders...</Typography>
      </Box>
    );
  if (error)
    return (
      <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
        {error.message}
      </Alert>
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "preparing":
        return "primary";
      case "ready":
        return "success";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order.id);
    setEditForm({
      penggunaId: order.penggunaId,
      produk: order.produk,
      total: order.total,
      status: order.status,
    });
  };

  const handleSave = async () => {
    try {
      await updateOrder({
        variables: {
          id: editingOrder,
          total: parseFloat(editForm.total),
          status: editForm.status,
        },
      });
      setEditingOrder(null);
      refetch();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order: " + error.message);
    }
  };

  const handleCancel = () => {
    setEditingOrder(null);
  };

  const handleDelete = (order) => {
    setDeleteDialog({ open: true, order });
  };

  const confirmDelete = async () => {
    try {
      await deleteOrder({
        variables: { id: deleteDialog.order.id },
      });
      setDeleteDialog({ open: false, order: null });
      refetch();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all restaurant orders
        </Typography>
      </Box>

      {data.daftarPesanan.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 2,
          }}
        >
          <ShoppingCart
            sx={{
              fontSize: 80,
              color: "grey.300",
              mb: 2,
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Orders will appear here when customers place them
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
                <TableCell>Order ID</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.daftarPesanan.map((order) => (
                <TableRow
                  key={order.id}
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
                      #{order.id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {order.penggunaId.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.produk.map((item, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        Product {item.produkId}: {item.jumlah} × Rp{" "}
                        {item.harga.toLocaleString("id-ID")}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      Rp {order.total.toLocaleString("id-ID")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.tanggalDibuat).toLocaleDateString(
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
                      onClick={() => handleEdit(order)}
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(order)}
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

      {/* Edit Dialog */}
      <Dialog
        open={editingOrder !== null}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Order</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="User ID"
            value={editForm.penggunaId}
            onChange={(e) =>
              setEditForm({ ...editForm, penggunaId: e.target.value })
            }
            margin="normal"
            disabled
          />
          <TextField
            fullWidth
            label="Total"
            type="number"
            value={editForm.total}
            onChange={(e) =>
              setEditForm({ ...editForm, total: parseInt(e.target.value) })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={editForm.status}
            onChange={(e) =>
              setEditForm({ ...editForm, status: e.target.value })
            }
            margin="normal"
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="preparing">Preparing</MenuItem>
            <MenuItem value="ready">Ready</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, order: null })}
      >
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this order? This action cannot be
            undone.
          </Typography>
          {deleteDialog.order && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Order ID: #{deleteDialog.order.id.slice(-8)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: Rp {deleteDialog.order.total.toLocaleString("id-ID")}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, order: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
