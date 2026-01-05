import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  Divider,
  Alert,
  Grid,
} from "@mui/material";
import {
  ShoppingCart,
  Delete,
  Add,
  Remove,
  ArrowBack,
} from "@mui/icons-material";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const CREATE_ORDER = gql`
  mutation CreateOrder($penggunaId: ID!, $produk: [OrderItemInput!]!) {
    buatPesanan(penggunaId: $penggunaId, produk: $produk) {
      id
      penggunaId
      produk {
        produkId
        harga
        jumlah
      }
      total
      status
    }
  }
`;

const CREATE_PAYMENT = gql`
  mutation CreatePayment($pesananId: ID!, $jumlah: Float!, $metode: String!) {
    prosesPembayaran(pesananId: $pesananId, jumlah: $jumlah, metode: $metode) {
      id
      pesananId
      jumlah
      status
      metode
    }
  }
`;

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useContext(CartContext);
  const [createOrder] = useMutation(CREATE_ORDER);
  const [createPayment] = useMutation(CREATE_PAYMENT);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Create order
      const orderItems = cart.map((item) => ({
        produkId: item.id,
        harga: item.harga,
        jumlah: item.quantity,
      }));

      const orderResult = await createOrder({
        variables: {
          penggunaId: user.id,
          produk: orderItems,
        },
      });

      const orderId = orderResult.data.buatPesanan.id;

      // Create payment
      await createPayment({
        variables: {
          pesananId: orderId,
          jumlah: getCartTotal(),
          metode: paymentMethod,
        },
      });

      setSuccess(true);
      clearCart();
      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to process checkout");
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Please login to view your cart
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/products")}
          sx={{ mb: 2 }}
        >
          Back to Products
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Shopping Cart
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review your items and proceed to checkout
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Order placed successfully! Redirecting to orders...
        </Alert>
      )}

      {cart.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <ShoppingCart sx={{ fontSize: 80, color: "grey.300", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start adding items to your cart
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/products")}
            sx={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              },
            }}
          >
            Browse Products
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {cart.map((item) => (
              <Card
                key={item.id}
                sx={{
                  mb: 2,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {item.nama}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 1 }}>
                        {item.kategori}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: "primary.main", fontWeight: 700 }}
                      >
                        Rp {item.harga.toLocaleString("id-ID")}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid",
                          borderColor: "grey.300",
                          borderRadius: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography
                          sx={{ px: 2, minWidth: 40, textAlign: "center" }}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          minWidth: 120,
                          textAlign: "right",
                        }}
                      >
                        Rp{" "}
                        {(item.harga * item.quantity).toLocaleString("id-ID")}
                      </Typography>
                      <IconButton
                        color="error"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                position: "sticky",
                top: 24,
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Order Summary
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography>
                      Rp {getCartTotal().toLocaleString("id-ID")}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    Rp {getCartTotal().toLocaleString("id-ID")}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  select
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  sx={{ mb: 2 }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="e_wallet">E-Wallet</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </TextField>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleCheckout}
                  disabled={loading || success}
                  sx={{
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    },
                    py: 1.5,
                  }}
                >
                  {loading ? "Processing..." : "Proceed to Checkout"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Cart;
