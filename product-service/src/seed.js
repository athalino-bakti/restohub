const mongoose = require("mongoose");
const { initConnections } = require("./resolvers");

const dummyProducts = [
  {
    nama: "Nasi Goreng",
    harga: 25000,
    deskripsi: "Nasi goreng spesial dengan ayam dan sayuran",
    kategori: "Makanan Utama",
    gambar: "/uploads/nasi-goreng.jpg",
  },
  {
    nama: "Ayam Bakar",
    harga: 30000,
    deskripsi: "Ayam bakar dengan bumbu rempah",
    kategori: "Makanan Utama",
    gambar: "/uploads/ayam-bakar.jpg",
  },
  {
    nama: "Es Teh Manis",
    harga: 5000,
    deskripsi: "Teh manis dingin segar",
    kategori: "Minuman",
    gambar: "/uploads/es-teh.jpg",
  },
  {
    nama: "Bakso",
    harga: 20000,
    deskripsi: "Bakso daging sapi dengan mie",
    kategori: "Makanan Utama",
    gambar: "/uploads/bakso.jpg",
  },
  {
    nama: "Jus Jeruk",
    harga: 10000,
    deskripsi: "Jus jeruk segar tanpa gula",
    kategori: "Minuman",
    gambar: "/uploads/jus-jeruk.jpg",
  },
];

const seedProducts = async () => {
  try {
    await initConnections();
    const Product = mongoose.model("Product");
    await Product.deleteMany(); // Clear existing data
    await Product.insertMany(dummyProducts);
    console.log("Dummy products inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
