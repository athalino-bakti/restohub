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
  redisClient = redis.createClient({ url: process.env.REDIS_URL });
  await redisClient.connect();
};

const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  rabbitChannel = await connection.createChannel();
  await rabbitChannel.assertQueue("product_events");
};

const resolvers = {
  Query: {
    produk: async (parent, args) => {
      const cacheKey = `produk:${args.id}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const product = await Product.findById(args.id);
      if (product) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(product));
      }
      return product;
    },
    daftarProduk: async () => {
      const cacheKey = "daftarProduk";
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const products = await Product.find();
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(products));
      return products;
    },
  },
  Mutation: {
    buatProduk: async (parent, args) => {
      const product = new Product(args);
      await product.save();
      await redisClient.del("daftarProduk");
      await rabbitChannel.sendToQueue(
        "product_events",
        Buffer.from(JSON.stringify({ event: "produk_dibuat", data: product }))
      );
      return product;
    },
    updateProduk: async (parent, args) => {
      const product = await Product.findByIdAndUpdate(args.id, args, {
        new: true,
      });
      if (product) {
        await redisClient.del(`produk:${args.id}`);
        await redisClient.del("daftarProduk");
        await rabbitChannel.sendToQueue(
          "product_events",
          Buffer.from(
            JSON.stringify({ event: "produk_diupdate", data: product })
          )
        );
      }
      return product;
    },
    hapusProduk: async (parent, args) => {
      const product = await Product.findByIdAndDelete(args.id);
      if (product) {
        await redisClient.del(`produk:${args.id}`);
        await redisClient.del("daftarProduk");
        await rabbitChannel.sendToQueue(
          "product_events",
          Buffer.from(
            JSON.stringify({ event: "produk_dihapus", data: { id: args.id } })
          )
        );
      }
      return !!product;
    },
  },
};

const initConnections = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await connectRedis();
  await connectRabbitMQ();
};

module.exports = { resolvers, initConnections };
