import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import {Server} from "socket.io"
import http from 'http'

const app = express();  
const server = http.createServer(app)
const origin = process.env.CORS_ORIGIN
const io = new Server(server, {
  cors:{
        origin: ["http://localhost:5173"],
        // origin: ["*"],
        methods:["GET","POST"],
        credentials: true
      } 
    })
    
    app.use(
      cors({
        origin: "http://localhost:5173",
        // origin: "*",
        credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
app.use("/users", userRouter);

import messageRouter from "./routes/message.routes.js";
app.use("/messages", messageRouter);

export { app, io, server };
