require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { buildSubgraphSchema } = require("@apollo/subgraph");
const fs = require("fs");
const path = require("path");
const { resolvers, initConnections } = require("./resolvers");

const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

const server = new ApolloServer({ schema });

const app = express();

async function startServer() {
  await initConnections();
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4003;
  app.listen(PORT, () => {
    console.log(
      `Order service running at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer().catch(console.error);
