import express from "express";
import { ApolloServer } from "apollo-server-express";
import { readFileSync } from "fs";
import { resolvers } from "./resolvers/resolvers.js";
import { PrismaClient } from "../generated/prisma/index.js";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import jwt from "jsonwebtoken";

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());
const typeDefs = readFileSync(path.join(process.cwd(), "src/schema/schema.graphql"), "utf-8");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req})=>{
    const authHeader=req.headers.authorization||"";
    const token=authHeader.replace("Bearer","");
    let user=null;
    if (token){
        try{
            user=jwt.verify(token,process.env.JWT_SECRET);
        }catch(err){
            console.log("Invalid token:, err.message");
        }
    }
    return {prisma,user};
  }, 
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
