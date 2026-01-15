import express from 'express';
import Message from '../models/messageModel.js';
import { sendMessage, getPrivateMessages, getGroupMessages,deleteMessage,seenMessage} from '../controllers/messageControllers.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/send",isAuthenticated,sendMessage);
router.get("/private/:user1/:user2",isAuthenticated, getPrivateMessages);
router.get("/group/:groupId", isAuthenticated,getGroupMessages);
router.delete("/delete/:messageId", isAuthenticated,deleteMessage);
router.post("/seen/private/:user1/:user2", isAuthenticated,seenMessage);
export default router;