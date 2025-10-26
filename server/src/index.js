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

// ✅ CORS fix for frontend (Render + Vercel)
app.use(
  cors({
    origin: [
      "https://causeconnect-zeta.vercel.app", // your frontend domain
      "http://localhost:5173",                // for local dev
    ],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Read GraphQL Schema
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

// ✅ Start Apollo + Express
async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  // Sentry handler (optional)
  const Sentry = await import("@sentry/node");
  Sentry.setupExpressErrorHandler(app);

  // Optional fallback error handler
  app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).send("Internal Server Error");
  });

  // ✅ Render assigns PORT dynamically (don’t hardcode 4000)
  const PORT = process.env.PORT || 4000;

  // ✅ Use 0.0.0.0 so Render can expose it externally
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
