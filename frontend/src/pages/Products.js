import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
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
} from "@mui/material";
import { Add, Restaurant } from "@mui/icons-material";

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

const Products = () => {
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    harga: "",
    deskripsi: "",
    kategori: "",
    gambar: null,
  });
  const [createError, setCreateError] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      nama: "",
      harga: "",
      deskripsi: "",
      kategori: "",
      gambar: null,
    });
    setCreateError("");
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
      await createProduct({
        variables,
      });
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
            Manage your restaurant menu and products
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
          Add Product
        </Button>
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
                  <Button size="small" sx={{ fontWeight: 500 }}>
                    Edit
                  </Button>
                  <Button size="small" color="error" sx={{ fontWeight: 500 }}>
                    Delete
                  </Button>
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
          Add New Product
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
            <TextField
              fullWidth
              label="Category"
              value={formData.kategori}
              onChange={(e) =>
                setFormData({ ...formData, kategori: e.target.value })
              }
              margin="normal"
              placeholder="e.g., Food, Beverage, Dessert"
              sx={{ mb: 2 }}
            />
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
            Create Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
