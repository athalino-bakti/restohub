const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { initConnections } = require("./resolvers");

// Function to create a placeholder image
const createPlaceholderImage = (filename, productName, color) => {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create a simple SVG placeholder image
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="${color}"/>
  <text x="200" y="140" font-size="24" font-family="Arial" fill="white" text-anchor="middle" font-weight="bold">
    ${productName}
  </text>
  <text x="200" y="170" font-size="16" font-family="Arial" fill="white" text-anchor="middle">
    Restaurant Foto
  </text>
</svg>`;

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, svg);
  console.log(`Created placeholder image: ${filename}`);
};

const dummyProducts = [
  {
    nama: "Nasi Goreng",
    harga: 25000,
    deskripsi: "Nasi goreng spesial dengan ayam dan sayuran",
    kategori: "Makanan Utama",
    gambar: "/uploads/nasi-goreng.svg",
  },
  {
    nama: "Ayam Bakar",
    harga: 30000,
    deskripsi: "Ayam bakar dengan bumbu rempah",
    kategori: "Makanan Utama",
    gambar: "/uploads/ayam-bakar.svg",
  },
  {
    nama: "Es Teh Manis",
    harga: 5000,
    deskripsi: "Teh manis dingin segar",
    kategori: "Minuman",
    gambar: "/uploads/es-teh.svg",
  },
  {
    nama: "Bakso",
    harga: 20000,
    deskripsi: "Bakso daging sapi dengan mie",
    kategori: "Makanan Utama",
    gambar: "/uploads/bakso.svg",
  },
  {
    nama: "Jus Jeruk",
    harga: 10000,
    deskripsi: "Jus jeruk segar tanpa gula",
    kategori: "Minuman",
    gambar: "/uploads/jus-jeruk.svg",
  },
];

const seedProducts = async () => {
  try {
    // Create placeholder images
    createPlaceholderImage("nasi-goreng.svg", "Nasi Goreng", "#FF6B6B");
    createPlaceholderImage("ayam-bakar.svg", "Ayam Bakar", "#FF8C42");
    createPlaceholderImage("es-teh.svg", "Es Teh Manis", "#4ECDC4");
    createPlaceholderImage("bakso.svg", "Bakso", "#FFB84D");
    createPlaceholderImage("jus-jeruk.svg", "Jus Jeruk", "#FFA500");

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
