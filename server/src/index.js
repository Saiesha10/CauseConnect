import "./instrument.js"; 
import express from "express";
import { readFileSync } from "fs";
import path from "path";
import { ApolloServer } from "apollo-server-express";
import { PrismaClient } from "../generated/prisma/index.js";
import { resolvers } from "./resolvers/resolvers.js";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
import cors from "cors";

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


  app.get("/favicon.ico", (req, res) => res.status(204).end());

  const Sentry = await import("@sentry/node");
  Sentry.init({ dsn: process.env.SENTRY_DSN || "" });

  app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).send("Internal Server Error");
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(` CauseConnect GraphQL Server is running!`);
    console.log(` GraphQL endpoint: /graphql`);
    console.log(` Apollo Sandbox is available automatically in dev or via /graphql endpoint`);
  });
}
if (process.env.NODE_ENV !== "test") {
  startServer().catch((err) => {
    console.error(" Failed to start server:", err);
  });
}
startServer().catch((err) => {
  console.error(" Failed to start server:", err);
});
