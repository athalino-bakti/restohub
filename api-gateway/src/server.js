require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const { ApolloGateway, IntrospectAndCompose } = require("@apollo/gateway");
const { graphqlUploadExpress } = require("graphql-upload");

async function startServer() {
  const app = express();

  // Enable CORS
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Enable file uploads
  app.use(graphqlUploadExpress());

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  try {
    // Create a new server instance to avoid state issues
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

    const apolloServer = new ApolloServer({
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

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    const PORT = process.env.PORT || 4000;
    const HOST = process.env.HOST || "0.0.0.0";
    app.listen({ port: PORT, host: HOST }, () => {
      console.log(
        `API Gateway running at http://${HOST}:${PORT}${apolloServer.graphqlPath}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    throw error;
  }
}

startServer().catch(console.error);
