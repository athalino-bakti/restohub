const mongoose = require("mongoose");
const redis = require("redis");
const amqp = require("amqplib");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PaymentSchema = new mongoose.Schema({
  pesananId: String,
  jumlah: Number,
  metode: String,
  status: { type: String, default: "pending" },
  tanggalDibuat: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", PaymentSchema);

let redisClient;
let rabbitChannel;

const connectRedis = async () => {
  redisClient = redis.createClient({ url: process.env.REDIS_URL });
  await redisClient.connect();
};

const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  rabbitChannel = await connection.createChannel();
  await rabbitChannel.assertQueue("payment_events");
};

const resolvers = {
  Pembayaran: {
    id: (parent) => parent._id.toString(),
  },
  Query: {
    pembayaran: async (parent, args) => {
      const cacheKey = `pembayaran:${args.id}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const payment = await Payment.findById(args.id);
      if (payment) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(payment));
      }
      return payment;
    },
    daftarPembayaran: async (parent, args) => {
      const query = args.pesananId ? { pesananId: args.pesananId } : {};
      const cacheKey = `daftarPembayaran:${args.pesananId || "all"}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const payments = await Payment.find(query);
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(payments));
      return payments;
    },
    pembayaranPesanan: async (parent, args) => {
      const payments = await Payment.find({ pesananId: args.pesananId });
      return payments;
    },
  },
  Mutation: {
    prosesPembayaran: async (parent, args) => {
      try {
        let paymentIntent;
        if (args.metode === "stripe") {
          paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(args.jumlah * 100),
            currency: "usd",
          });
        }
        const payment = new Payment({
          pesananId: args.pesananId,
          jumlah: args.jumlah,
          metode: args.metode,
          status: "processing",
        });
        await payment.save();
        console.log("Payment saved:", payment);

        if (redisClient) {
          console.log("Clearing Redis cache...");
          await redisClient.del("daftarPembayaran:all");
          await redisClient.del(`daftarPembayaran:${args.pesananId}`);
          await redisClient.del("daftarPembayaran");
        }
        if (rabbitChannel) {
          await rabbitChannel.sendToQueue(
            "payment_events",
            Buffer.from(
              JSON.stringify({ event: "pembayaran_diproses", data: payment })
            )
          );
        }
        return payment;
      } catch (error) {
        console.error("Error in prosesPembayaran:", error);
        throw new Error(`Failed to process payment: ${error.message}`);
      }
    },
    updateStatusPembayaran: async (parent, args) => {
      const payment = await Payment.findByIdAndUpdate(
        args.id,
        { status: args.status },
        { new: true }
      );
      if (payment) {
        await redisClient.del(`pembayaran:${args.id}`);
        await redisClient.del(`daftarPembayaran:${payment.pesananId}`);
        await redisClient.del("daftarPembayaran:all");
        await rabbitChannel.sendToQueue(
          "payment_events",
          Buffer.from(
            JSON.stringify({
              event: "status_pembayaran_diupdate",
              data: payment,
            })
          )
        );
      }
      return payment;
    },
    updatePembayaran: async (parent, args) => {
      try {
        const updateData = {};
        if (args.pesananId !== undefined && args.pesananId !== "") {
          updateData.pesananId = args.pesananId;
        }
        if (args.jumlah !== undefined && args.jumlah !== 0) {
          updateData.jumlah = parseFloat(args.jumlah);
        }
        if (args.metode !== undefined && args.metode !== "") {
          updateData.metode = args.metode;
        }
        if (args.status !== undefined && args.status !== "") {
          updateData.status = args.status;
        }
        if (args.tanggalDibuat !== undefined && args.tanggalDibuat !== "") {
          try {
            const dateVal = new Date(args.tanggalDibuat);
            if (!isNaN(dateVal.getTime())) {
              updateData.tanggalDibuat = dateVal;
            }
          } catch (dateError) {
            console.warn("Date parse error:", dateError);
          }
        }

        console.log("Updating payment with data:", updateData);
        const payment = await Payment.findByIdAndUpdate(args.id, updateData, {
          new: true,
        });

        if (payment) {
          if (redisClient) {
            await redisClient.del(`pembayaran:${args.id}`);
            await redisClient.del(`daftarPembayaran:${payment.pesananId}`);
            await redisClient.del("daftarPembayaran:all");
          }
          if (rabbitChannel) {
            await rabbitChannel.sendToQueue(
              "payment_events",
              Buffer.from(
                JSON.stringify({
                  event: "pembayaran_diupdate",
                  data: payment,
                })
              )
            );
          }
        }
        return payment;
      } catch (error) {
        console.error("Error in updatePembayaran:", error);
        throw new Error(`Failed to update payment: ${error.message}`);
      }
    },
    hapusPembayaran: async (parent, args) => {
      const payment = await Payment.findByIdAndDelete(args.id);
      if (payment) {
        await redisClient.del(`pembayaran:${args.id}`);
        await redisClient.del(`daftarPembayaran:${payment.pesananId}`);
        await redisClient.del("daftarPembayaran:all");
        await rabbitChannel.sendToQueue(
          "payment_events",
          Buffer.from(
            JSON.stringify({
              event: "pembayaran_dihapus",
              data: { id: args.id },
            })
          )
        );
      }
      return !!payment;
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
