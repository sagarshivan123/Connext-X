import express from "express";
import multer from "multer";
import path from "path";
import { uploadAvatar ,uploadGroupPic} from "../controllers/uploadController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";


const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploaded = multer({ storage });

router.post(
  "/",
  uploaded.single("file"),
  (req, res) => {
    res.json({
      url: `/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith("video") ? "video" : "image",
    });
  }
);



router.put(
  "/update-avatar",
  isAuthenticated,
  uploaded.single("profilePic"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    req.user.profilePic = `/uploads/${req.file.filename}`;
    await req.user.save();

    res.json({ message: "Avatar updated", url: req.user.profilePic });
  }
);



router.put(
  "/update-group-pic",
  isAuthenticated,
  uploaded.single("groupPic"),
  uploadGroupPic
);

export default router;
