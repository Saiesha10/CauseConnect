import "./instrument.js"; // Sentry or monitoring
import express from "express";
import { readFileSync } from "fs";
import path from "path";
import { ApolloServer } from "apollo-server-express";
import { PrismaClient } from "../generated/prisma/index.js";
import { resolvers } from "./resolvers/resolvers.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import { default as expressPlayground } from "graphql-playground-middleware-express";

dotenv.config();

const prisma = new PrismaClient();
const app = express();

// ✅ CORS setup for both Vercel frontend and local dev
app.use(
  cors({
    origin: [
      "https://causeconnect-zeta.vercel.app", // deployed frontend
      "http://localhost:5173",                // local frontend
    ],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
  introspection: true, // enables sandbox / Playground in prod
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

  // ✅ Legacy Playground route (optional)
  app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

  // ✅ Favicon fix
  app.get("/favicon.ico", (req, res) => res.status(204).end());

  // ✅ Sentry setup
  const Sentry = await import("@sentry/node");
  Sentry.setupExpressErrorHandler(app);

  // ✅ Error handler
  app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).send("Internal Server Error");
  });

  // ✅ Use Render-provided PORT
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ CauseConnect GraphQL Server is running!`);
    console.log(`🌐 GraphQL endpoint: /graphql`);
    console.log(`🎮 Playground available at /playground`);
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
});
