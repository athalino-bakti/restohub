require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { buildSubgraphSchema } = require("@apollo/subgraph");
const { gql } = require("apollo-server-express");
const fs = require("fs");
const path = require("path");
const { graphqlUploadExpress } = require("graphql-upload");
const { resolvers, initConnections } = require("./resolvers");

const typeDefsString = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);
const typeDefs = gql(typeDefsString);

const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

const server = new ApolloServer({
  schema,
  uploads: false, // handled by graphql-upload middleware
});

const app = express();

// Middleware untuk menangani multipart/form-data upload file
app.use(graphqlUploadExpress());

// Serve uploaded images (stored in the parent "uploads" directory)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

async function startServer() {
  await initConnections();
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    console.log(
      `Product service running at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer().catch(console.error);
