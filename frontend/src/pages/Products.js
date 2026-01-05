import React, { useState, useContext } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Snackbar,
} from "@mui/material";
import {
  Add,
  Restaurant,
  Edit,
  Delete,
  ShoppingCart,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

const GET_PRODUCTS = gql`
  query GetProducts {
    daftarProduk {
      id
      nama
      harga
      deskripsi
      kategori
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $nama: String!
    $harga: Float!
    $deskripsi: String
    $kategori: String
    $gambar: Upload
  ) {
    buatProduk(
      nama: $nama
      harga: $harga
      deskripsi: $deskripsi
      kategori: $kategori
      gambar: $gambar
    ) {
      id
      nama
      harga
      deskripsi
      kategori
      gambar
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $id: ID!
    $nama: String
    $harga: Float
    $deskripsi: String
    $kategori: String
    $gambar: Upload
  ) {
    updateProduk(
      id: $id
      nama: $nama
      harga: $harga
      deskripsi: $deskripsi
      kategori: $kategori
      gambar: $gambar
    ) {
      id
      nama
      harga
      deskripsi
      kategori
      gambar
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    hapusProduk(id: $id)
  }
`;

const Products = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart, getCartItemCount } = useContext(CartContext);
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    product: null,
  });
  const [formData, setFormData] = useState({
    nama: "",
    harga: "",
    deskripsi: "",
    kategori: "",
    gambar: null,
  });
  const [createError, setCreateError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const isAdmin = user?.role === "admin";

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    setFormData({
      nama: "",
      harga: "",
      deskripsi: "",
      kategori: "",
      gambar: null,
    });
    setCreateError("");
  };

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setFormData({
      nama: product.nama,
      harga: product.harga.toString(),
      deskripsi: product.deskripsi || "",
      kategori: product.kategori || "",
      gambar: null,
    });
    setOpen(true);
  };

  const handleDelete = (product) => {
    setDeleteDialog({ open: true, product });
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct({
        variables: { id: deleteDialog.product.id },
      });
      setDeleteDialog({ open: false, product: null });
      refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setSnackbar({ open: true, message: `${product.nama} added to cart!` });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");
    try {
      const variables = {
        nama: formData.nama,
        harga: parseFloat(formData.harga),
        deskripsi: formData.deskripsi,
        kategori: formData.kategori,
      };
      if (formData.gambar) {
        variables.gambar = formData.gambar;
      }

      if (editingProduct) {
        variables.id = editingProduct;
        await updateProduct({
          variables,
        });
      } else {
        await createProduct({
          variables,
        });
      }
      refetch();
      handleClose();
    } catch (error) {
      setCreateError(error.message);
    }
  };

  if (loading)
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="text.secondary">Loading products...</Typography>
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
            Products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isAdmin
              ? "Manage your restaurant menu and products"
              : "Browse our menu and add items to your cart"}
          </Typography>
        </Box>
        {isAdmin ? (
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
            Add Product
          </Button>
        ) : (
          <IconButton onClick={() => navigate("/cart")}>
            <Badge badgeContent={getCartItemCount()} color="primary">
              <ShoppingCart sx={{ fontSize: 32, color: "primary.main" }} />
            </Badge>
          </IconButton>
        )}
      </Box>

      {data.daftarProduk.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 2,
          }}
        >
          <Restaurant
            sx={{
              fontSize: 80,
              color: "grey.300",
              mb: 2,
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Get started by adding your first product
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
            Add Product
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {data.daftarProduk.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid",
                  borderColor: "grey.200",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{ fontWeight: 600, mb: 1.5, color: "text.primary" }}
                  >
                    {product.nama}
                  </Typography>
                  {product.deskripsi && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 40 }}
                    >
                      {product.deskripsi}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: "auto",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                          mb: 0.5,
                        }}
                      >
                        Rp {product.harga.toLocaleString("id-ID")}
                      </Typography>
                      {product.kategori && (
                        <Typography variant="caption" color="text.secondary">
                          {product.kategori}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {isAdmin ? (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(product)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(product)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      onClick={() => handleAddToCart(product)}
                      sx={{
                        background:
                          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                        },
                      }}
                    >
                      Add to Cart
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
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
          {editingProduct ? "Edit Product" : "Add New Product"}
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
              label="Product Name"
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
              label="Price"
              type="number"
              value={formData.harga}
              onChange={(e) =>
                setFormData({ ...formData, harga: e.target.value })
              }
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: "text.secondary" }}>Rp</Box>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              margin="normal"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.kategori}
                onChange={(e) =>
                  setFormData({ ...formData, kategori: e.target.value })
                }
                label="Category"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="Food">Food</MenuItem>
                <MenuItem value="Beverage">Beverage</MenuItem>
                <MenuItem value="Dessert">Dessert</MenuItem>
                <MenuItem value="Appetizer">Appetizer</MenuItem>
                <MenuItem value="Main Course">Main Course</MenuItem>
                <MenuItem value="Snack">Snack</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" component="label" sx={{ mb: 2 }}>
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  setFormData({ ...formData, gambar: e.target.files[0] })
                }
              />
            </Button>
            {formData.gambar && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                Selected: {formData.gambar.name}
              </Typography>
            )}
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
            {editingProduct ? "Update Product" : "Create Product"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete product "
            {deleteDialog.product?.nama}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, product: null })}
          >
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for add to cart notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default Products;
