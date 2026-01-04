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
    await rabbitChannel.assertQueue("user_events");
    console.log("RabbitMQ connected successfully");
  } catch (error) {
    console.error("RabbitMQ connection error:", error.message);
    rabbitChannel = null;
  }
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1h" }
  );
};

const resolvers = {
  User: {
    id: (parent) => {
      if (parent._id) {
        return parent._id.toString();
      }
      return parent.id;
    },
  },
  Query: {
    pengguna: async (parent, args, context) => {
      if (!context.user) throw new Error("Unauthorized");
      const cacheKey = `pengguna:${args.id}`;
      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }
      const user = await User.findById(args.id).select("-password");
      if (user && redisClient) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(user));
      }
      return user;
    },
    daftarPengguna: async (parent, args, context) => {
      if (!context.user || context.user.role !== "admin")
        throw new Error("Unauthorized");
      const cacheKey = "daftarPengguna";
      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }
      const users = await User.find().select("-password");
      if (redisClient) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(users));
      }
      return users;
    },
    saya: async (parent, args, context) => {
      if (!context.user) throw new Error("Unauthorized");
      return await User.findById(context.user.id).select("-password");
    },
  },
  Mutation: {
    daftar: async (parent, args) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: args.email });
        if (existingUser) {
          throw new Error("Email already registered");
        }

        const hashedPassword = await bcrypt.hash(args.password, 10);
        const user = new User({
          nama: args.nama,
          email: args.email,
          password: hashedPassword,
        });
        await user.save();
        const token = generateToken(user);

        if (redisClient) {
          try {
            await redisClient.del("daftarPengguna");
          } catch (redisError) {
            console.error("Redis error:", redisError.message);
          }
        }

        if (rabbitChannel) {
          try {
            await rabbitChannel.sendToQueue(
              "user_events",
              Buffer.from(
                JSON.stringify({
                  event: "pengguna_didaftarkan",
                  data: { id: user._id, email: user.email },
                })
              )
            );
          } catch (rabbitError) {
            console.error("RabbitMQ error:", rabbitError.message);
          }
        }

        return {
          token,
          user: {
            id: user._id,
            nama: user.nama,
            email: user.email,
            role: user.role,
          },
        };
      } catch (error) {
        console.error("Register error:", error);
        throw new Error(error.message || "Registration failed");
      }
    },
    masuk: async (parent, args) => {
      try {
        const user = await User.findOne({ email: args.email });
        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isValidPassword = await bcrypt.compare(
          args.password,
          user.password
        );
        if (!isValidPassword) {
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
      } catch (error) {
        console.error("Login error:", error);
        throw new Error(error.message || "Login failed");
      }
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
        if (redisClient) {
          await redisClient.del(`pengguna:${args.id}`);
          await redisClient.del("daftarPengguna");
        }
        if (rabbitChannel) {
          await rabbitChannel.sendToQueue(
            "user_events",
            Buffer.from(
              JSON.stringify({ event: "pengguna_diupdate", data: user })
            )
          );
        }
      }
      return user;
    },
    hapusPengguna: async (parent, args, context) => {
      if (!context.user || context.user.role !== "admin")
        throw new Error("Unauthorized");
      const user = await User.findByIdAndDelete(args.id);
      if (user) {
        if (redisClient) {
          await redisClient.del(`pengguna:${args.id}`);
          await redisClient.del("daftarPengguna");
        }
        if (rabbitChannel) {
          await rabbitChannel.sendToQueue(
            "user_events",
            Buffer.from(
              JSON.stringify({
                event: "pengguna_dihapus",
                data: { id: args.id },
              })
            )
          );
        }
      }
      return !!user;
    },
  },
};

const initConnections = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");

    // Seed default admin user
    try {
      const existingUser = await User.findOne({ email: "admin@restohub.com" });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const defaultUser = new User({
          nama: "Admin",
          email: "admin@restohub.com",
          password: hashedPassword,
          role: "admin",
        });
        await defaultUser.save();
        console.log("Default admin user created");
      }
    } catch (seedError) {
      console.error("Error seeding admin user:", seedError.message);
    }

    await connectRedis();
    await connectRabbitMQ();
  } catch (error) {
    console.error("Initialization error:", error);
    throw error;
  }
};

module.exports = { resolvers, initConnections };
