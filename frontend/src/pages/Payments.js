import React from "react";
import { useQuery, gql } from "@apollo/client";
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

const Payments = () => {
  const { loading, error, data } = useQuery(GET_PAYMENTS);

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
                      {new Date(payment.tanggalDibuat).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Payments;
