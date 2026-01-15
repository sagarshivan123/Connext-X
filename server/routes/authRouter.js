import express from 'express';
import {login, register,logOut,getUser,addFriend,findUser,getAllUsers} from '../controllers/authControllers.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { upload } from "../middleware/upload.js";


const router = express.Router();
router.post('/register', upload.single("avatar"),register);
router.post('/login', login);
router.post('/logout', logOut);
router.get('/me',isAuthenticated, getUser);
router.post('/add-friend',isAuthenticated, addFriend);
router.post("/find-user",findUser);
router.get("/all", isAuthenticated, getAllUsers);



export default router;