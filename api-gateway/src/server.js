require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const { ApolloGateway, IntrospectAndCompose } = require("@apollo/gateway");

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "product-service", url: process.env.PRODUCT_SERVICE_URL },
      { name: "user-service", url: process.env.USER_SERVICE_URL },
      { name: "order-service", url: process.env.ORDER_SERVICE_URL },
      { name: "payment-service", url: process.env.PAYMENT_SERVICE_URL },
      { name: "inventory-service", url: process.env.INVENTORY_SERVICE_URL },
    ],
    introspectionHeaders: async () => {
      return {};
    },
    pollIntervalInMs: 30000,
  }),
  debug: true,
  serviceHealthCheck: true,
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
  formatError: (err) => {
    console.error("Gateway Error:", err);
    return {
      message: err.message,
      code: err.extensions?.code || "INTERNAL_SERVER_ERROR",
    };
  },
  debug: true,
});

async function startServer() {
  const app = express();
  
  // Enable CORS
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  try {
    await server.start();
    server.applyMiddleware({ app });

    const PORT = process.env.PORT || 4000;
    app.listen({ port: PORT }, () => {
      console.log(`API Gateway running at http://localhost:${PORT}${server.graphqlPath}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    // Retry after 5 seconds
    setTimeout(() => {
      console.log("Retrying server start...");
      startServer();
    }, 5000);
  }
}

startServer().catch(console.error);
