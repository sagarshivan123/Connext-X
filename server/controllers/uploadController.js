export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files allowed" });
    }

    req.user.profilePic = `/uploads/${req.file.filename}`;
    await req.user.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profilePic: req.user.profilePic,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
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

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files allowed" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isAdmin =
      group.admin?.toString() === userId.toString() ||
      group.creator?.toString() === userId.toString();

    if (!isAdmin) {
      return res.status(403).json({
        message: "Only admin or creator can update group picture",
      });
    }

    group.groupPic = `/uploads/${req.file.filename}`;
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "name email profilePic")
      .populate("admin", "name profilePic");

    res.status(200).json({
      message: "Group picture updated successfully",
      groupPic: updatedGroup.groupPic,
      group: updatedGroup,
    });
  } catch (error) {
    console.error("Error in uploadGroupPic:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
