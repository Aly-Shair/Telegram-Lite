import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
// // Fix __dirname in ES module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Load .env from project root
// dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({
    path: "../.env"
})
// console.log("this is cors origin in index", process.env.CORS_ORIGIN);
// a
import { io, server } from "./app.js";
import dbConnect from "./DB/dbConnect.js";

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

const port = process.env.PORT

dbConnect()
  .then((res) => {
    if (res) {
      server.listen(port, () => {
        console.log(
          `server is listening a port: http://localhost:${port}`
        );
      });
    } else {
      console.error(`Local Err --> db connection failed`);
    }
  })
  .catch((error) => {
    console.error(`Local Err --> ${error}`);
  });
