import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { getReciverSocketId } from "../index.js";
import { io } from "../app.js";
import mongoose from "mongoose";

// Send a message
export const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user?._id;

  if (!message?.trim()) {
    throw new ApiError(400, "Message cannot be empty");
  }

  let chats = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!chats) {
    chats = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const newMessage = new Message({
    sender: senderId,
    receiver: receiverId,
    message,
    conversation: chats?._id,
  });

  // Assuming Conversation schema has messages array
  chats.messages.push(newMessage._id);

  await Promise.all([chats.save(), newMessage.save()]);

  const reciverSocketId = getReciverSocketId(receiverId);
  console.log(reciverSocketId, "this is reie;asdjf[ajdk;");

  if (reciverSocketId) {
    io.to(reciverSocketId).emit("newMessage", newMessage);
  }

  res
    .status(201)
    .json(new ApiResponse(201, newMessage, "Message sent successfully"));
});

// Get all messages in a conversation
export const getMessages = asyncHandler(async (req, res) => {
  const { id: receiverId } = req.params;
  const senderId = req.user?._id;

  const chats = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate("messages"); // make sure Conversation schema has `messages` field

  if (!chats) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No conversation found"));
  }

  await Message.updateMany(
    { 
      sender: receiverId,
      receiver: senderId,
      conversation: chats?._id,
      status: "unread",
    },
    { $set: { status: "read" } }
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, chats.messages, "Messages fetched successfully")
    );

  

  
});

export const unreadMessagesCount = asyncHandler(async (req, res) => {
  const { sender } = req.params;
  const receiver = req.user?._id;

  const unreadCount = await Message.aggregate([
    {
      $match: {
        sender: new mongoose.Types.ObjectId(sender),
        receiver: new mongoose.Types.ObjectId(receiver),
        status: "unread"
      }
    },
    {
      $count: "unreadMessages"
    }
  ]);

  const count = unreadCount[0]?.unreadMessages || 0;

  res.status(200).json(new ApiResponse(200,{ unreadCount: count }, 'count fetched successfully'));
});
