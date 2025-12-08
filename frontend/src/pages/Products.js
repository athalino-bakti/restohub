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
  Fab,
} from "@mui/material";
import { Add } from "@mui/icons-material";

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
  ) {
    buatProduk(
      nama: $nama
      harga: $harga
      deskripsi: $deskripsi
      kategori: $kategori
    ) {
      id
      nama
      harga
      deskripsi
      kategori
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
  });
  const [createError, setCreateError] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ nama: "", harga: "", deskripsi: "", kategori: "" });
    setCreateError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");
    try {
      await createProduct({
        variables: {
          ...formData,
          harga: parseFloat(formData.harga),
        },
      });
      refetch();
      handleClose();
    } catch (error) {
      setCreateError(error.message);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
      </Typography>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleOpen}
      >
        <Add />
      </Fab>

      <Grid container spacing={3}>
        {data.daftarProduk.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {product.nama}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {product.deskripsi}
                </Typography>
                <Typography variant="h6" color="primary">
                  Rp {product.harga.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Category: {product.kategori}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Edit</Button>
                <Button size="small" color="error">
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              margin="normal"
              required
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
            />
            <TextField
              fullWidth
              label="Category"
              value={formData.kategori}
              onChange={(e) =>
                setFormData({ ...formData, kategori: e.target.value })
              }
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
