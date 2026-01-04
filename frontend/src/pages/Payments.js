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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { Payment } from "@mui/icons-material";

const GET_PAYMENTS = gql`
  query GetPayments {
    daftarPembayaran {
      id
      pesananId
      jumlah
      status
      metode
      tanggalDibuat
    }
  }
`;

const UPDATE_PAYMENT = gql`
  mutation UpdatePayment(
    $id: ID!
    $pesananId: ID
    $jumlah: Int
    $status: String
    $metode: String
  ) {
    updatePembayaran(
      id: $id
      pesananId: $pesananId
      jumlah: $jumlah
      status: $status
      metode: $metode
    ) {
      id
      pesananId
      jumlah
      status
      metode
      tanggalDibuat
    }
  }
`;

const DELETE_PAYMENT = gql`
  mutation DeletePayment($id: ID!) {
    hapusPembayaran(id: $id)
  }
`;

const Payments = () => {
  const { loading, error, data, refetch } = useQuery(GET_PAYMENTS);
  const [updatePayment] = useMutation(UPDATE_PAYMENT);
  const [deletePayment] = useMutation(DELETE_PAYMENT);
  const [editingPayment, setEditingPayment] = React.useState(null);
  const [editForm, setEditForm] = useState({
    pesananId: "",
    jumlah: 0,
    status: "",
    metode: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    payment: null,
  });

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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "completed":
        return "success";
      case "failed":
        return "error";
      case "refunded":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment.id);
    setEditForm({
      pesananId: payment.pesananId,
      jumlah: payment.jumlah,
      status: payment.status,
      metode: payment.metode,
    });
  };

  const handleSave = async () => {
    try {
      await updatePayment({
        variables: {
          id: editingPayment,
          ...editForm,
        },
      });
      setEditingPayment(null);
      refetch();
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  const handleCancel = () => {
    setEditingPayment(null);
  };

  const handleDelete = (payment) => {
    setDeleteDialog({ open: true, payment });
  };

  const confirmDelete = async () => {
    try {
      await deletePayment({
        variables: { id: deleteDialog.payment.id },
      });
      setDeleteDialog({ open: false, payment: null });
      refetch();
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track all payment transactions and their status
        </Typography>
      </Box>

      {data.daftarPembayaran.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 2,
          }}
        >
          <Payment
            sx={{
              fontSize: 80,
              color: "grey.300",
              mb: 2,
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No payments yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Payment records will appear here
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
                <TableCell>Payment ID</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.daftarPembayaran.map((payment) => (
                <TableRow
                  key={payment.id}
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
                      #{payment.id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      #{payment.pesananId.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "success.main" }}
                    >
                      Rp {payment.jumlah.toLocaleString("id-ID")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.metode}
                      size="small"
                      sx={{
                        backgroundColor: "grey.100",
                        color: "text.primary",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={getStatusColor(payment.status)}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(payment.tanggalDibuat).toLocaleDateString(
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
                    <Button
                      size="small"
                      onClick={() => handleEdit(payment)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(payment)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
      <Dialog open={editingPayment !== null} onClose={handleCancel}>
        <DialogTitle>Edit Payment</DialogTitle>
        <DialogContent>
          <TextField
            label="Order ID"
            value={editForm.pesananId}
            onChange={(e) =>
              setEditForm({ ...editForm, pesananId: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Amount"
            type="number"
            value={editForm.jumlah}
            onChange={(e) =>
              setEditForm({ ...editForm, jumlah: parseInt(e.target.value) })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Status"
            select
            value={editForm.status}
            onChange={(e) =>
              setEditForm({ ...editForm, status: e.target.value })
            }
            fullWidth
            margin="normal"
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
          </TextField>
          <TextField
            label="Method"
            value={editForm.metode}
            onChange={(e) =>
              setEditForm({ ...editForm, metode: e.target.value })
            }
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, payment: null })}
      >
        <DialogTitle>Delete Payment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this payment? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, payment: null })}
          >
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

export default Payments;
