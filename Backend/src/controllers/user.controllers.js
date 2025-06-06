import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Conversation } from "../models/conversation.model.js";

const cookieOptions = {
  httpOnly: true,
  secure: true, // set to true in production (with HTTPS)
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const existing = await User.findOne({
    username: username.trim().toLowerCase(),
  });

  if (existing) {
    throw new ApiError(400, "Username already exists");
  }

  const user = await User.create({ username, password });

  res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

// Since no password/email, login might be just username-based (adjust accordingly)
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400, "Username & passsword is required");
  }

  const user = await User.findOne({ username: username?.trim().toLowerCase() });

  if (!user) {
    throw new ApiError(401, "Invalid username");
  }

  if (user?.password != password) {
    throw new ApiError(401, "Invalid password");
  }

  // Set cookie or token as needed, here setting userId cookie
  res
    .status(200)
    .cookie("userId", user._id.toString(), cookieOptions)
    .json(new ApiResponse(200, user, "Login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
  res
    .clearCookie("userId", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getUserBySearch = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const currentUserID = req.user?._id;

  if (!search?.trim()) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Search results fetched successfully"));
  }

  const users = await User.find({
    username: { $regex: `.*${search}.*`, $options: "i" },
    _id: { $ne: currentUserID },
  }).select("-__v");

  res
    .status(200)
    .json(new ApiResponse(200, users, "Search results fetched successfully"));
});

// GET /api/users/chatters
const getCurrentChatters = asyncHandler(async (req, res) => {
  const currentUserID = req.user?._id;

  const currenTChatters = await Conversation.find({
    participants: currentUserID,
  }).sort({ updatedAt: -1 });

  if (!currenTChatters || currenTChatters.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No chat participants found"));
  }

  const partcipantsIDS = currenTChatters.reduce((ids, conversation) => {
    const others = conversation.participants.filter(
      (id) => id.toString() !== currentUserID.toString()
    );
    return [...ids, ...others];
  }, []);

  // Remove duplicates
  const uniqueParticipantIds = [
    ...new Set(partcipantsIDS.map((id) => id.toString())),
  ];

  const users = await User.find({ _id: { $in: uniqueParticipantIds } }).select(
    "-__v"
  );

  // Ensure return order matches conversation order
  const orderedUsers = uniqueParticipantIds.map((id) =>
    users.find((u) => u._id.toString() === id)
  );

  res
    .status(200)
    .json(new ApiResponse(200, orderedUsers, "Chat participants fetched"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req?.user;

  res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
  let { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

export {
  getCurrentUser,
  registerUser,
  loginUser,
  logoutUser,
  getUserBySearch,
  getCurrentChatters,
  getUserById,
};
