import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const jwtAuth = asyncHandler(async (req, res, next) => {
  const userId = req.cookies?.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: No user ID found in cookies");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(401, "Unauthorized: Invalid user");
  }

  req.user = user;
  next();
});
