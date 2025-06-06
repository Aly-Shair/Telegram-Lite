import dotenv from "dotenv";
import dbConnect from "./DB/dbConnect.js";
import { io, server } from "./app.js";
// dotenv.config({
//     path: "../.env"
// })
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("process.env.PORT-->", process.env.PORT);

const userSocketmap = {}; //{userId,socketId}

export const getReciverSocketId = (receverId) => {
  return userSocketmap[receverId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(userId, "connected", socket.id);

  if (userId) userSocketmap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketmap));

  socket.on("disconnect", () => {
    console.log(userId, "disconnected", socket.id);
    delete userSocketmap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketmap));
  });
});

dbConnect()
  .then((res) => {
    if (res) {
      server.listen(process.env.PORT, () => {
        console.log(
          `server is listening a port: http://localhost:${process.env.PORT}`
        );
      });
    } else {
      console.error(`Local Err --> db connection failed`);
    }
  })
  .catch((error) => {
    console.error(`Local Err --> ${error}`);
  });
