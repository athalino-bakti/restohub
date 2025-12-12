const mongoose = require("mongoose");
const redis = require("redis");
const amqp = require("amqplib");

const InventorySchema = new mongoose.Schema({
  produkId: String,
  stok: Number,
  lokasi: String,
});

const Inventory = mongoose.model("Inventory", InventorySchema);

let redisClient;
let rabbitChannel;

const connectRedis = async () => {
  redisClient = redis.createClient({ url: process.env.REDIS_URL });
  await redisClient.connect();
};

const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  rabbitChannel = await connection.createChannel();
  await rabbitChannel.assertQueue("inventory_events");
};

const resolvers = {
  Query: {
    inventori: async (parent, args) => {
      const cacheKey = `inventori:${args.id}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const inventory = await Inventory.findById(args.id);
      if (inventory) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(inventory));
      }
      return inventory;
    },
    daftarInventori: async () => {
      const cacheKey = "daftarInventori";
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const inventories = await Inventory.find();
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(inventories));
      return inventories;
    },
  },
  Mutation: {
    updateStok: async (parent, args) => {
      const inventory = await Inventory.findByIdAndUpdate(
        args.id,
        { stok: args.stok },
        { new: true }
      );
      if (inventory) {
        await redisClient.del(`inventori:${args.id}`);
        await redisClient.del("daftarInventori");
        await rabbitChannel.sendToQueue(
          "inventory_events",
          Buffer.from(
            JSON.stringify({ event: "stok_diupdate", data: inventory })
          )
        );
      }
      return inventory;
    },
    buatInventori: async (parent, args) => {
      const inventory = new Inventory(args);
      await inventory.save();
      await redisClient.del("daftarInventori");
      await rabbitChannel.sendToQueue(
        "inventory_events",
        Buffer.from(
          JSON.stringify({ event: "inventori_dibuat", data: inventory })
        )
      );
      return inventory;
    },
    hapusInventori: async (parent, args) => {
      const inventory = await Inventory.findByIdAndDelete(args.id);
      if (inventory) {
        await redisClient.del(`inventori:${args.id}`);
        await redisClient.del("daftarInventori");
        await rabbitChannel.sendToQueue(
          "inventory_events",
          Buffer.from(
            JSON.stringify({
              event: "inventori_dihapus",
              data: { id: args.id },
            })
          )
        );
      }
      return !!inventory;
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
      console.log("Redis connected successfully");
    } catch (error) {
      console.warn(
        "Redis connection failed, continuing without Redis:",
        error.message
      );
      redisClient = null;
    }

    // Connect to RabbitMQ (optional)
    try {
      await connectRabbitMQ();
      console.log("RabbitMQ connected successfully");
    } catch (error) {
      console.warn(
        "RabbitMQ connection failed, continuing without RabbitMQ:",
        error.message
      );
      rabbitChannel = null;
    }
  } catch (error) {
    console.error("MongoDB initialization error:", error);
    throw error;
  }
};

module.exports = { resolvers, initConnections };
