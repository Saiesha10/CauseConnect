import express from "express";
import {ApolloServer} from "apollo-server-express";
import {typeDefs} from "./typeDefs.js";
import {resolvers} from "./resolvers.js";
import {PrismaClient} from "../generated/prisma/index.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const prisma=new PrismaClient();
const app=express();

app.use(cors());
app.use(express.json());
const server=new ApolloServer({
    typeDefs,
    resolvers,
    context:()=>({prisma}),

});
async function startServer(){
    await server.start();
    server.applyMiddleware({app,path:"/graphql"});
    const PORT=process.env.PORT|| 4000;
    app.listen(PORT,()=>{
        console.log(`Server ready at http://localhost:${PORT}/graphql`);
    });
}

startServer();