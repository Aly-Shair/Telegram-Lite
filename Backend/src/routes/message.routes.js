import { Router } from "express";
import {sendMessage, getMessages, unreadMessagesCount, markMessageAsRead, markMultipleMessagesAsRead} from "../controllers/message.controllers.js"
import { jwtAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(jwtAuth)

router.route('/unreadcount/:sender').get(unreadMessagesCount)
router.route('/:id').post(sendMessage).get(getMessages)
router.route('/m/r/:id').post(markMessageAsRead)
router.route('/mark-as-read').post(markMultipleMessagesAsRead)

export default router;