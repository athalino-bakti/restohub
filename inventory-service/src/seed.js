const mongoose = require("mongoose");
const { initConnections } = require("./resolvers");

const dummyInventory = [
  {
    produkId: "507f1f77bcf86cd799439011",
    stok: 50,
    lokasi: "Gudang Utama",
  },
  {
    produkId: "507f1f77bcf86cd799439012",
    stok: 30,
    lokasi: "Gudang Utama",
  },
  {
    produkId: "507f1f77bcf86cd799439013",
    stok: 100,
    lokasi: "Gudang Cabang",
  },
  {
    produkId: "507f1f77bcf86cd799439014",
    stok: 20,
    lokasi: "Gudang Utama",
  },
  {
    produkId: "507f1f77bcf86cd799439015",
    stok: 40,
    lokasi: "Gudang Cabang",
  },
];

const seedInventory = async () => {
  try {
    await initConnections();
    const Inventory = mongoose.model("Inventory");
    await Inventory.deleteMany(); // Clear existing data
    await Inventory.insertMany(dummyInventory);
    console.log("Dummy inventory inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding inventory:", error);
    process.exit(1);
  }
};

seedInventory();
