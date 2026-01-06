export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    // If user is logged in → update profile picture
    if (req.user) {
      req.user.profilePic = `/uploads/${req.file.filename}`;
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      avatar: avatarPath,
      message: "Profile picture uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};
import Group from "../models/groupModel.js";

export const uploadGroupPic = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // 1. Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // 2. Permission Check: Only the admin can change the group picture
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: "Access denied. Only the group admin can update the group picture." 
      });
    }

    // 3. Update the path (using groupPic to match your model)
    const imagePath = `/uploads/${req.file.filename}`;
    group.groupPic = imagePath;
    await group.save();

    res.status(200).json({
      message: "Group picture updated successfully",
      groupPic: imagePath,
      group
    });
  } catch (error) {
    console.error("Error in uploadGroupPic:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};