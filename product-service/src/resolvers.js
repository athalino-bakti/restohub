const mongoose = require("mongoose");
const redis = require("redis");
const amqp = require("amqplib");
const fs = require("fs");
const path = require("path");
const { GraphQLUpload } = require("graphql-upload");

const ProductSchema = new mongoose.Schema({
  nama: String,
  harga: Number,
  deskripsi: String,
  kategori: String,
  gambar: String, // Path to the uploaded image
});

const Product = mongoose.model("Product", ProductSchema);

let redisClient;
let rabbitChannel;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Redis connection error:", error.message);
    redisClient = null;
  }
};

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    rabbitChannel = await connection.createChannel();
    await rabbitChannel.assertQueue("product_events");
    console.log("RabbitMQ connected successfully");
  } catch (error) {
    console.error("RabbitMQ connection error:", error.message);
    rabbitChannel = null;
  }
};

const saveImage = async (upload) => {
  const { createReadStream, filename } = await upload;
  const stream = createReadStream();
  const uploadsDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const uniqueFilename = `${Date.now()}-${filename}`;
  const filePath = path.join(uploadsDir, uniqueFilename);
  const writeStream = fs.createWriteStream(filePath);
  await new Promise((resolve, reject) => {
    stream.pipe(writeStream);
    stream.on("error", reject);
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
  return `/uploads/${uniqueFilename}`;
};

const resolvers = {
  Upload: GraphQLUpload,
  Product: {
    id: (parent) => parent._id.toString(),
  },
  Query: {
    produk: async (parent, args) => {
      const cacheKey = `produk:${args.id}`;
      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }
      const product = await Product.findById(args.id);
      if (!product) {
        throw new Error(`Product with id ${args.id} not found`);
      }
      if (redisClient) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(product));
      }
      return product;
    },
    daftarProduk: async () => {
      const cacheKey = "daftarProduk";
      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }
      const products = await Product.find();
      if (redisClient) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(products));
      }
      return products;
    },
  },
  Mutation: {
    buatProduk: async (parent, args) => {
      let gambarPath = null;
      if (args.gambar) {
        gambarPath = await saveImage(args.gambar);
      }
      const productData = { ...args };
      delete productData.gambar;
      if (gambarPath) {
        productData.gambar = gambarPath;
      }
      const product = new Product(productData);
      await product.save();
      if (redisClient) {
        await redisClient.del("daftarProduk");
      }
      if (rabbitChannel) {
        await rabbitChannel.sendToQueue(
          "product_events",
          Buffer.from(JSON.stringify({ event: "produk_dibuat", data: product }))
        );
      }
      return product;
    },
    updateProduk: async (parent, args) => {
      const updateData = { ...args };
      delete updateData.gambar;
      delete updateData.id;

      if (args.gambar) {
        const gambarPath = await saveImage(args.gambar);
        updateData.gambar = gambarPath;
      }

      const product = await Product.findByIdAndUpdate(args.id, updateData, {
        new: true,
      });
      if (product) {
        if (redisClient) {
          await redisClient.del(`produk:${args.id}`);
          await redisClient.del("daftarProduk");
        }
        if (rabbitChannel) {
          await rabbitChannel.sendToQueue(
            "product_events",
            Buffer.from(
              JSON.stringify({ event: "produk_diupdate", data: product })
            )
          );
        }
      }
      return product;
    },
    hapusProduk: async (parent, args) => {
      const product = await Product.findByIdAndDelete(args.id);
      if (product) {
        if (redisClient) {
          await redisClient.del(`produk:${args.id}`);
          await redisClient.del("daftarProduk");
        }
        if (rabbitChannel) {
          await rabbitChannel.sendToQueue(
            "product_events",
            Buffer.from(
              JSON.stringify({ event: "produk_dihapus", data: { id: args.id } })
            )
          );
        }
      }
      return !!product;
    },
  },
};

const initConnections = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");

    // Connect to Redis (optional)
    try {
      await connectRedis();
    } catch (error) {
      console.warn(
        "Redis connection failed, continuing without Redis:",
        error.message
      );
    }

    // Connect to RabbitMQ (optional)
    try {
      await connectRabbitMQ();
    } catch (error) {
      console.warn(
        "RabbitMQ connection failed, continuing without RabbitMQ:",
        error.message
      );
    }
  } catch (error) {
    console.error("MongoDB initialization error:", error);
    throw error;
  }
};

module.exports = { resolvers, initConnections };
