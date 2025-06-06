import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getUserBySearch,
  getCurrentChatters,
  getCurrentUser,
  getUserById
} from "../controllers/user.controllers.js";
import { jwtAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.use(jwtAuth)



router.route('/current').get(jwtAuth, getCurrentUser)

router.route('/chatters').get(jwtAuth, getCurrentChatters)
router.route('/').get(jwtAuth, getUserBySearch)

router.route('/:id').get(jwtAuth, getUserById)


export default router;
