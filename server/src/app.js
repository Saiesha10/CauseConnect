import "./instrument.js";
import { readFileSync } from "fs";
import path from "path";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import { PrismaClient } from "../generated/prisma/index.js";
import { resolvers } from "./resolvers/resolvers.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(
  cors({
    origin: [
      "https://causeconnect-zeta.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const typeDefs = readFileSync(
  path.join(process.cwd(), "src/schema/schema.graphql"),
  "utf-8"
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  formatError: (err) => ({
    message: err.message,
    path: err.path,
    code: err.extensions?.code || "INTERNAL_SERVER_ERROR",
  }),
  context: ({ req }) => {
    const authHeader = req?.headers?.authorization;


    if (!authHeader) {
      return { prisma };
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return { prisma };
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "test-secret");

      return {
        prisma,
        user: {
          userId: decoded.id || decoded.userId,
          email: decoded.email,
          role: decoded.role || "user",
        },
      };
    } catch (err) {
      return { prisma };
    }
  },
});


await server.start();
server.applyMiddleware({ app, path: "/graphql" });


app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: err.message });
});

export { app, prisma, server };
