const mongoose = require("mongoose");
const { initConnections } = require("./resolvers");

const dummyOrders = [
  {
    penggunaId: "user1",
    produk: [
      { produkId: "507f1f77bcf86cd799439011", jumlah: 2, harga: 25000 },
      { produkId: "507f1f77bcf86cd799439012", jumlah: 1, harga: 30000 },
    ],
    total: 80000,
    status: "completed",
    tanggalDibuat: new Date("2023-10-01"),
  },
  {
    penggunaId: "user2",
    produk: [
      { produkId: "507f1f77bcf86cd799439013", jumlah: 1, harga: 5000 },
      { produkId: "507f1f77bcf86cd799439014", jumlah: 3, harga: 20000 },
    ],
    total: 65000,
    status: "pending",
    tanggalDibuat: new Date("2023-10-02"),
  },
  {
    penggunaId: "user1",
    produk: [{ produkId: "507f1f77bcf86cd799439015", jumlah: 2, harga: 10000 }],
    total: 20000,
    status: "shipped",
    tanggalDibuat: new Date("2023-10-03"),
  },
];

const seedOrders = async () => {
  try {
    await initConnections();
    const Order = mongoose.model("Order");
    await Order.deleteMany(); // Clear existing data
    await Order.insertMany(dummyOrders);
    console.log("Dummy orders inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding orders:", error);
    process.exit(1);
  }
};

seedOrders();
