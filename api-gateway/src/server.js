require("dotenv").config();
const { ApolloServer } = require("apollo-server");
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
  }),
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
});

async function startServer() {
  const PORT = process.env.PORT || 4000;
  server.listen({ port: PORT }).then(({ url }) => {
    console.log(`API Gateway running at ${url}`);
  });
}

startServer().catch(console.error);
