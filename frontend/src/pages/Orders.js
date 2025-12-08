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

const GET_ORDERS = gql`
  query GetOrders {
    daftarPesanan {
      id
      penggunaId
      item {
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

const Orders = () => {
  const { loading, error, data } = useQuery(GET_ORDERS);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Orders
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.daftarPesanan.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.penggunaId}</TableCell>
                <TableCell>
                  {order.item.map((item, index) => (
                    <div key={index}>
                      Product {item.produkId}: {item.jumlah} x Rp{" "}
                      {item.harga.toLocaleString()}
                    </div>
                  ))}
                </TableCell>
                <TableCell>Rp {order.total.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(order.tanggalDibuat).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Orders;
