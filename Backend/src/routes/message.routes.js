import { Router } from "express";
import {sendMessage, getMessages, unreadMessagesCount} from "../controllers/message.controllers.js"
import { jwtAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(jwtAuth)

router.route('/unreadcount/:sender').get(unreadMessagesCount)
router.route('/:id').post(sendMessage).get(getMessages)

export default router;