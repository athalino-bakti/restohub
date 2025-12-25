const mongoose = require("mongoose");
const { initConnections } = require("./resolvers");

const dummyPayments = [
  {
    pesananId: "507f1f77bcf86cd799439016",
    jumlah: 80000,
    metode: "credit_card",
    status: "completed",
    tanggalDibuat: new Date("2023-10-01"),
  },
  {
    pesananId: "507f1f77bcf86cd799439017",
    jumlah: 65000,
    metode: "bank_transfer",
    status: "pending",
    tanggalDibuat: new Date("2023-10-02"),
  },
  {
    pesananId: "507f1f77bcf86cd799439018",
    jumlah: 20000,
    metode: "cash",
    status: "completed",
    tanggalDibuat: new Date("2023-10-03"),
  },
];

const seedPayments = async () => {
  try {
    await initConnections();
    const Pembayaran = mongoose.model("Pembayaran");
    await Pembayaran.deleteMany(); // Clear existing data
    await Pembayaran.insertMany(dummyPayments);
    console.log("Dummy payments inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding payments:", error);
    process.exit(1);
  }
};

seedPayments();
