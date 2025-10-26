import "./instrument.js"; // optional Sentry integration
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

// ✅ CORS setup — allow your frontend domain
app.use(
  cors({
    origin: [
      "https://causeconnect-zeta.vercel.app", // frontend
      "http://localhost:5173", // dev
    ],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Load GraphQL schema
const typeDefs = readFileSync(
  path.join(process.cwd(), "src/schema/schema.graphql"),
  "utf-8"
);

// ✅ Apollo Server setup
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

  // ✅ Root route just for testing Render connection
  app.get("/", (req, res) => {
    res.send("✅ CauseConnect GraphQL Server is running!");
  });

  // ✅ Dynamic PORT — Render sets it automatically
  const PORT = process.env.PORT || 4000;

  // ✅ Use 0.0.0.0 for Render
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server ready at port ${PORT}`);
    console.log(`🚀 GraphQL endpoint: /graphql`);
  });
}

startServer().catch((err) => {
  console.error("❌ Server startup error:", err);
});
