const mongoose = require("mongoose");
const redis = require("redis");
const amqp = require("amqplib");

const ProductSchema = new mongoose.Schema({
  nama: String,
  harga: Number,
  deskripsi: String,
  kategori: String,
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

const resolvers = {
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
      if (product && redisClient) {
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
      const product = new Product(args);
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
      const product = await Product.findByIdAndUpdate(args.id, args, {
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
    await connectRedis();
    await connectRabbitMQ();
  } catch (error) {
    console.error("Initialization error:", error);
    throw error;
  }
};

module.exports = { resolvers, initConnections };
