import express from "express";
import {isAuthenticated} from "../middleware/authMiddleware.js";
import {
  createGroup,
  addMember,
  removeMember,
  getMyGroups,
} from "../controllers/groupControllers.js";

const router = express.Router();

router.post("/create", isAuthenticated, createGroup);
router.put("/add-member/:groupId",isAuthenticated, addMember);
router.put("/remove-member/:groupId", isAuthenticated, removeMember);
router.get("/my-groups", isAuthenticated, getMyGroups);

export default router;
