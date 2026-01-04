const mongoose = require("mongoose");
const redis = require("redis");
const amqp = require("amqplib");

const OrderSchema = new mongoose.Schema({
  penggunaId: String,
  produk: [
    {
      produkId: String,
      jumlah: Number,
      harga: Number,
    },
  ],
  total: Number,
  status: { type: String, default: "pending" },
  tanggalDibuat: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

let redisClient;
let rabbitChannel;

const connectRedis = async () => {
  redisClient = redis.createClient({ url: process.env.REDIS_URL });
  await redisClient.connect();
};

const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  rabbitChannel = await connection.createChannel();
  await rabbitChannel.assertQueue("order_events");
};

const resolvers = {
  Order: {
    id: (parent) => parent._id.toString(),
  },
  Query: {
    pesanan: async (parent, args) => {
      const cacheKey = `pesanan:${args.id}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const order = await Order.findById(args.id);
      if (order) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(order));
      }
      return order;
    },
    daftarPesanan: async (parent, args) => {
      const query = args.penggunaId ? { penggunaId: args.penggunaId } : {};
      const cacheKey = `daftarPesanan:${args.penggunaId || "all"}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const orders = await Order.find(query);
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(orders));
      return orders;
    },
  },
  Mutation: {
    buatPesanan: async (parent, args) => {
      const total = args.produk.reduce(
        (sum, item) => sum + item.jumlah * item.harga,
        0
      );
      const order = new Order({
        penggunaId: args.penggunaId,
        produk: args.produk,
        total,
      });
      await order.save();
      await redisClient.del(`daftarPesanan:${args.penggunaId}`);
      await redisClient.del("daftarPesanan:all");
      await rabbitChannel.sendToQueue(
        "order_events",
        Buffer.from(JSON.stringify({ event: "pesanan_dibuat", data: order }))
      );
      return order;
    },
    updatePesanan: async (parent, args) => {
      const updateData = {};
      if (args.penggunaId !== undefined)
        updateData.penggunaId = args.penggunaId;
      if (args.produk !== undefined) updateData.produk = args.produk;
      if (args.total !== undefined) updateData.total = args.total;
      if (args.status !== undefined) updateData.status = args.status;

      const order = await Order.findByIdAndUpdate(args.id, updateData, {
        new: true,
      });
      if (order) {
        await redisClient.del(`pesanan:${args.id}`);
        await redisClient.del(`daftarPesanan:${order.penggunaId}`);
        await redisClient.del("daftarPesanan:all");
        await rabbitChannel.sendToQueue(
          "order_events",
          Buffer.from(
            JSON.stringify({ event: "pesanan_diupdate", data: order })
          )
        );
      }
      return order;
    },
    updateStatusPesanan: async (parent, args) => {
      const order = await Order.findByIdAndUpdate(
        args.id,
        { status: args.status },
        { new: true }
      );
      if (order) {
        await redisClient.del(`pesanan:${args.id}`);
        await redisClient.del(`daftarPesanan:${order.penggunaId}`);
        await redisClient.del("daftarPesanan:all");
        await rabbitChannel.sendToQueue(
          "order_events",
          Buffer.from(
            JSON.stringify({ event: "status_pesanan_diupdate", data: order })
          )
        );
      }
      return order;
    },
    batalkanPesanan: async (parent, args) => {
      const order = await Order.findByIdAndUpdate(
        args.id,
        { status: "cancelled" },
        { new: true }
      );
      if (order) {
        await redisClient.del(`pesanan:${args.id}`);
        await redisClient.del(`daftarPesanan:${order.penggunaId}`);
        await redisClient.del("daftarPesanan:all");
        await rabbitChannel.sendToQueue(
          "order_events",
          Buffer.from(
            JSON.stringify({
              event: "pesanan_dibatalkan",
              data: { id: args.id },
            })
          )
        );
      }
      return !!order;
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
