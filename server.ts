require('dotenv').config();
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/schema";

const PORT = process.env.PORT || 5050;

const server = new ApolloServer({typeDefs, resolvers});

const app = express();

server.start().then(() => {
  server.applyMiddleware({ app })
  
  app.listen({ port: PORT }, () => {
    console.log(`Server running @ localhost:${PORT}${server.graphqlPath}`);
  })
})

