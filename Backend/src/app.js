import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("this is cors origin in index", process.env.CORS_ORIGIN);


import cors from "cors";
import {Server} from "socket.io"
import http from 'http'
import express from "express";
import cookieParser from "cookie-parser";

const app = express();  
const server = http.createServer(app)
const origin = process.env.CORS_ORIGIN
//  || "http://localhost:5173"
console.log("this is cors origin in app", origin, process.env.CORS_ORIGIN);

const io = new Server(server, {
  cors:{
        // origin: ["http://localhost:5173"],
        // origin: ["*"],
        // origin: origin,
        origin: 'https://telelite-ivory.vercel.app',
        methods:["GET","POST"],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      } 
    })
    
    app.use(
      cors({
        // origin: "http://localhost:5173",
        // origin: "*",
        // origin: origin,
        origin: 'https://telelite-ivory.vercel.app',
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

import messageRouter from "./routes/message.routes.js";
app.use("/api/v1/messages", messageRouter);

export { app, io, server };
