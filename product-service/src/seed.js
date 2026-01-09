const mongoose = require("mongoose");
const { initConnections } = require("./resolvers");

// Data produk dummy dengan gambar dari web (foto makanan sungguhan)
const dummyProducts = [
  {
    nama: "Nasi Goreng",
    harga: 25000,
    deskripsi: "Nasi goreng spesial dengan ayam dan sayuran",
    kategori: "Makanan Utama",
    gambar:
      "https://images.unsplash.com/photo-1604908176997-1251884b08a3?auto=format&fit=crop&w=800&q=80",
  },
  {
    nama: "Ayam Bakar",
    harga: 30000,
    deskripsi: "Ayam bakar dengan bumbu rempah",
    kategori: "Makanan Utama",
    gambar:
      "https://images.unsplash.com/photo-1608038509085-7bb9d5c0f11a?auto=format&fit=crop&w=800&q=80",
  },
  {
    nama: "Es Teh Manis",
    harga: 5000,
    deskripsi: "Teh manis dingin segar",
    kategori: "Minuman",
    gambar:
      "https://images.unsplash.com/photo-1532634726-8b9fb99825ee?auto=format&fit=crop&w=800&q=80",
  },
  {
    nama: "Bakso",
    harga: 20000,
    deskripsi: "Bakso daging sapi dengan mie",
    kategori: "Makanan Utama",
    gambar:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc1d?auto=format&fit=crop&w=800&q=80",
  },
  {
    nama: "Jus Jeruk",
    harga: 10000,
    deskripsi: "Jus jeruk segar tanpa gula",
    kategori: "Minuman",
    gambar:
      "https://images.unsplash.com/photo-1542444255-3d6c02fff9c6?auto=format&fit=crop&w=800&q=80",
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
