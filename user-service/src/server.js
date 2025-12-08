require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { makeExecutableSchema } = require("@graphql-tools/schema");
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

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    const token = req.headers.authorization || "";
    if (token) {
      try {
        const user = jwt.verify(
          token.replace("Bearer ", ""),
          process.env.JWT_SECRET || "secret"
        );
        return { user };
      } catch (e) {
        console.error("Invalid token");
      }
    }
    return {};
  },
  formatError: (err) => {
    console.error("GraphQL Error:", err);
    return {
      message: err.message,
      code: err.extensions?.code || "INTERNAL_SERVER_ERROR",
    };
  },
  debug: true,
});

const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

async function startServer() {
  await initConnections();
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4002;
  app.listen(PORT, () => {
    console.log(
      `User service running at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer().catch(console.error);
