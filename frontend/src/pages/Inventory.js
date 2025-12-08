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

const GET_INVENTORY = gql`
  query GetInventory {
    daftarStok {
      id
      produkId
      jumlah
      lokasi
      tanggalUpdate
    }
  }
`;

const Inventory = () => {
  const { loading, error, data } = useQuery(GET_INVENTORY);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  const getStockStatus = (jumlah) => {
    if (jumlah === 0) return { label: "Out of Stock", color: "error" };
    if (jumlah < 10) return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Inventory
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product ID</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.daftarStok.map((item) => {
              const status = getStockStatus(item.jumlah);
              return (
                <TableRow key={item.id}>
                  <TableCell>{item.produkId}</TableCell>
                  <TableCell>{item.jumlah}</TableCell>
                  <TableCell>{item.lokasi}</TableCell>
                  <TableCell>
                    <Chip
                      label={status.label}
                      color={status.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(item.tanggalUpdate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Inventory;
