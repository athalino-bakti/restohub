const redis = require("redis");

let redisClient;

const connectRedis = async () => {
  redisClient = redis.createClient({ url: process.env.REDIS_URL });
  redisClient.on("error", (err) => console.error("Redis Client Error", err));
  await redisClient.connect();
  console.log("Redis connected");
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
