require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { buildSubgraphSchema } = require("@apollo/subgraph");
const { gql } = require("apollo-server-express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { resolvers, initConnections } = require("./resolvers");

const typeDefsString = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);
const typeDefs = gql(typeDefsString);

const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

const server = new ApolloServer({ schema });

const app = express();

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

async function startServer() {
  await initConnections();
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4003;
  const HOST = process.env.HOST || "localhost";
  app.listen(PORT, HOST, () => {
    console.log(
      `Order service running at http://${HOST}:${PORT}${server.graphqlPath}`
    );
  });
}

startServer().catch(console.error);
