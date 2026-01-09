import React, { useState, useContext } from "react";
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
import { ShoppingCart, Edit, Delete, Add } from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";

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

const GET_USER_ORDERS = gql`
  query GetUserOrders($penggunaId: ID) {
    daftarPesanan(penggunaId: $penggunaId) {
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

const GET_PRODUCTS = gql`
  query GetProducts {
    daftarProduk {
      id
      nama
      harga
    }
  }
`;

const GET_USERS = gql`
  query GetUsers {
    daftarPengguna {
      id
      nama
      email
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($penggunaId: ID!, $produk: [OrderItemInput!]!) {
    buatPesanan(penggunaId: $penggunaId, produk: $produk) {
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
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Admin sees all orders, users see only their orders
  const { loading, error, data, refetch } = useQuery(
    isAdmin ? GET_ORDERS : GET_USER_ORDERS,
    {
      variables: isAdmin ? {} : { penggunaId: user?.id },
      skip: !user,
    }
  );
  const { data: productsData } = useQuery(GET_PRODUCTS);
  const { data: usersData } = useQuery(GET_USERS);
  const [updateOrder] = useMutation(UPDATE_ORDER);
  const [deleteOrder] = useMutation(DELETE_ORDER);
  const [createOrder] = useMutation(CREATE_ORDER);
  const [editingOrder, setEditingOrder] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    penggunaId: "",
    produk: [{ produkId: "", jumlah: 1, harga: 0 }],
  });
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
      case "complete":
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

  const handleCreateOpen = () => {
    setCreateDialog(true);
    setCreateForm({
      penggunaId: "",
      produk: [{ produkId: "", jumlah: 1, harga: 0 }],
    });
  };

  const handleCreateClose = () => {
    setCreateDialog(false);
  };

  const handleAddProduct = () => {
    setCreateForm({
      ...createForm,
      produk: [...createForm.produk, { produkId: "", jumlah: 1, harga: 0 }],
    });
  };

  const handleRemoveProduct = (index) => {
    const newProduk = createForm.produk.filter((_, i) => i !== index);
    setCreateForm({ ...createForm, produk: newProduk });
  };

  const handleProductChange = (index, field, value) => {
    const newProduk = [...createForm.produk];
    newProduk[index][field] = value;

    // Auto-fill price when product is selected
    if (field === "produkId" && productsData) {
      const selectedProduct = productsData.daftarProduk.find(
        (p) => p.id === value
      );
      if (selectedProduct) {
        newProduk[index].harga = selectedProduct.harga;
      }
    }

    setCreateForm({ ...createForm, produk: newProduk });
  };

  const handleCreateSubmit = async () => {
    try {
      await createOrder({
        variables: {
          penggunaId: createForm.penggunaId,
          produk: createForm.produk.map((p) => ({
            produkId: p.produkId,
            jumlah: parseInt(p.jumlah),
            harga: parseFloat(p.harga),
          })),
        },
      });
      setCreateDialog(false);
      refetch();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order: " + error.message);
    }
  };

  const calculateTotal = () => {
    return createForm.produk.reduce(
      (sum, item) => sum + item.jumlah * item.harga,
      0
    );
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
            Orders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isAdmin
              ? "View and manage all restaurant orders"
              : "View your order history"}
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateOpen}
            sx={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              },
            }}
          >
            Create Order
          </Button>
        )}
      </Box>

      {data?.daftarPesanan?.length === 0 ? (
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
                <TableCell>User</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                {isAdmin && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.daftarPesanan?.map((order) => (
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
                      {usersData?.daftarPengguna.find(
                        (u) => u.id === order.penggunaId
                      )?.nama || order.penggunaId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.produk.map((item, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        {productsData?.daftarProduk.find(
                          (p) => p.id === item.produkId
                        )?.nama || `Product ${item.produkId}`}
                        : {item.jumlah} × Rp{" "}
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
                      {order.tanggalDibuat
                        ? new Date(order.tanggalDibuat).toLocaleString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "-"}
                    </Typography>
                  </TableCell>
                  {isAdmin && (
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
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Order Dialog */}
      <Dialog
        open={createDialog}
        onClose={handleCreateClose}
        maxWidth="md"
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
          Create New Order
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            select
            label="Select User"
            value={createForm.penggunaId}
            onChange={(e) =>
              setCreateForm({ ...createForm, penggunaId: e.target.value })
            }
            margin="normal"
            required
            sx={{ mb: 3 }}
          >
            <MenuItem value="">
              <em>Select a user</em>
            </MenuItem>
            {usersData?.daftarPengguna.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.nama} ({user.email})
              </MenuItem>
            ))}
          </TextField>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Products
          </Typography>

          {createForm.produk.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                alignItems: "flex-start",
              }}
            >
              <TextField
                select
                label="Product"
                value={item.produkId}
                onChange={(e) =>
                  handleProductChange(index, "produkId", e.target.value)
                }
                sx={{ flex: 2 }}
                required
              >
                <MenuItem value="">
                  <em>Select product</em>
                </MenuItem>
                {productsData?.daftarProduk.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.nama} - Rp {product.harga.toLocaleString("id-ID")}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="number"
                label="Quantity"
                value={item.jumlah}
                onChange={(e) =>
                  handleProductChange(index, "jumlah", e.target.value)
                }
                sx={{ flex: 1 }}
                inputProps={{ min: 1 }}
                required
              />
              <TextField
                type="number"
                label="Price"
                value={item.harga}
                onChange={(e) =>
                  handleProductChange(index, "harga", e.target.value)
                }
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: "text.secondary" }}>Rp</Box>
                  ),
                }}
                disabled
              />
              {createForm.produk.length > 1 && (
                <IconButton
                  onClick={() => handleRemoveProduct(index)}
                  color="error"
                  sx={{ mt: 1 }}
                >
                  <Delete />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddProduct}
            sx={{ mb: 3 }}
          >
            Add Product
          </Button>

          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: "2px solid",
              borderColor: "grey.200",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Total: Rp {calculateTotal().toLocaleString("id-ID")}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={
              !createForm.penggunaId ||
              createForm.produk.some((p) => !p.produkId)
            }
            sx={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              },
            }}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>

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
