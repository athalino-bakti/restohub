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

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

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
      <Typography variant="h4" component="h1" gutterBottom>
        Payments
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
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
              <TableRow key={payment.id}>
                <TableCell>{payment.id}</TableCell>
                <TableCell>{payment.pesananId}</TableCell>
                <TableCell>Rp {payment.jumlah.toLocaleString()}</TableCell>
                <TableCell>{payment.metode}</TableCell>
                <TableCell>
                  <Chip
                    label={payment.status}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(payment.tanggalDibuat).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Payments;
