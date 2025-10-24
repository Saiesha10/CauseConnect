import "./instrument.js"; // import Sentry first
import express from "express";
import { readFileSync } from "fs";
import path from "path";
import { ApolloServer } from "apollo-server-express";
import { resolvers } from "./resolvers/resolvers.js";
import { PrismaClient } from "../generated/prisma/index.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const typeDefs = readFileSync(path.join(process.cwd(), "src/schema/schema.graphql"), "utf-8");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    let user = null;
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.log("Invalid token:", err.message);
      }
    }
    return { prisma, user };
  },
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  // Sentry error handler (after all routes/controllers)
  const Sentry = await import("@sentry/node");
  Sentry.setupExpressErrorHandler(app);

  // Optional fallback error handler
  app.use((err, req, res, next) => {
    res.status(500).end(res.sentry + "\n");
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
