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
import { Inventory as InventoryIcon } from "@mui/icons-material";

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

  const getStockStatus = (jumlah) => {
    if (jumlah === 0) return { label: "Out of Stock", color: "error" };
    if (jumlah < 10) return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Inventory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor stock levels and manage inventory
        </Typography>
      </Box>

      {data.daftarStok.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 2,
          }}
        >
          <InventoryIcon
            sx={{
              fontSize: 80,
              color: "grey.300",
              mb: 2,
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No inventory items yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inventory records will appear here
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
                  <TableRow
                    key={item.id}
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
                        #{item.produkId.slice(-8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: item.jumlah === 0 ? "error.main" : "text.primary",
                        }}
                      >
                        {item.jumlah}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.lokasi || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                        sx={{
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(item.tanggalUpdate).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Inventory;
