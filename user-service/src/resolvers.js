const mongoose = require("mongoose");
const redis = require("redis");
const amqp = require("amqplib");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  nama: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "customer" },
});

const User = mongoose.model("User", UserSchema);

let redisClient;
let rabbitChannel;

const connectRedis = async () => {
  redisClient = redis.createClient({ url: process.env.REDIS_URL });
  await redisClient.connect();
};

const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  rabbitChannel = await connection.createChannel();
  await rabbitChannel.assertQueue("user_events");
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1h" }
  );
};

const resolvers = {
  Query: {
    pengguna: async (parent, args, context) => {
      if (!context.user) throw new Error("Unauthorized");
      const cacheKey = `pengguna:${args.id}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const user = await User.findById(args.id).select("-password");
      if (user) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(user));
      }
      return user;
    },
    daftarPengguna: async (parent, args, context) => {
      if (!context.user || context.user.role !== "admin")
        throw new Error("Unauthorized");
      const cacheKey = "daftarPengguna";
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const users = await User.find().select("-password");
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(users));
      return users;
    },
    saya: async (parent, args, context) => {
      if (!context.user) throw new Error("Unauthorized");
      return await User.findById(context.user.id).select("-password");
    },
  },
  Mutation: {
    daftar: async (parent, args) => {
      const hashedPassword = await bcrypt.hash(args.password, 10);
      const user = new User({
        nama: args.nama,
        email: args.email,
        password: hashedPassword,
      });
      await user.save();
      const token = generateToken(user);
      await redisClient.del("daftarPengguna");
      await rabbitChannel.sendToQueue(
        "user_events",
        Buffer.from(
          JSON.stringify({
            event: "pengguna_didaftarkan",
            data: { id: user._id, email: user.email },
          })
        )
      );
      return {
        token,
        user: {
          id: user._id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      };
    },
    masuk: async (parent, args) => {
      const user = await User.findOne({ email: args.email });
      if (!user || !(await bcrypt.compare(args.password, user.password))) {
        throw new Error("Invalid credentials");
      }
      const token = generateToken(user);
      return {
        token,
        user: {
          id: user._id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      };
    },
    updatePengguna: async (parent, args, context) => {
      if (
        !context.user ||
        (context.user.id !== args.id && context.user.role !== "admin")
      )
        throw new Error("Unauthorized");
      const user = await User.findByIdAndUpdate(args.id, args, {
        new: true,
      }).select("-password");
      if (user) {
        await redisClient.del(`pengguna:${args.id}`);
        await redisClient.del("daftarPengguna");
        await rabbitChannel.sendToQueue(
          "user_events",
          Buffer.from(
            JSON.stringify({ event: "pengguna_diupdate", data: user })
          )
        );
      }
      return user;
    },
    hapusPengguna: async (parent, args, context) => {
      if (!context.user || context.user.role !== "admin")
        throw new Error("Unauthorized");
      const user = await User.findByIdAndDelete(args.id);
      if (user) {
        await redisClient.del(`pengguna:${args.id}`);
        await redisClient.del("daftarPengguna");
        await rabbitChannel.sendToQueue(
          "user_events",
          Buffer.from(
            JSON.stringify({ event: "pengguna_dihapus", data: { id: args.id } })
          )
        );
      }
      return !!user;
    },
  },
};

const initConnections = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await connectRedis();
  await connectRabbitMQ();
};

module.exports = { resolvers, initConnections };
