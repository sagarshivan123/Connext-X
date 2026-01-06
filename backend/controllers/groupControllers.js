import Group from "../models/groupModel.js";
import User from "../models/userModel.js";


export const createGroup = async (req, res) => {
  try{
    const { name, members } = req.body;
    const admin = req.user._id;
    const membersList = Array.isArray(members) ? members : [];
    const group= await Group.create({
      name,
      members: [admin, ...membersList],
      admin:admin,
      createdBy:admin
    });

    res.status(201).json({ success: true, group });
  }catch(error){
    res.status(500).json({ success: false, error: error.message });
  }
}

export const addMember=async(req,res)=>{
  try{
    const {groupId}= req.params;
    const {userId}= req.body;
    

    const group= await Group.findById(groupId);
    if(!group){
      return res.status(404).json({ success: false, message: "Group not found" });
    }
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Auth user missing" });
    }
    if (!group.admin) {
      return res.status(400).json({ success: false, message: "Group admin not found" });
    }
    if(group.admin.toString()!==req.user._id.toString()){
      return res.status(403).json({ success: false, message: "Only admin can add members" });
    }
    if(group.members.includes(userId)){
      return res.status(400).json({ success: false, message: "User is already a member" });
    }
    group.members.push(userId);
    await group.save();
    res.status(200).json({ success: true,message:"member added", group });
  }catch(err){
    res.status(500).json({ success: false, error: err.message });
  }
}

export const removeMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only admin can remove members" });

    group.members = group.members.filter(
      (member) => member.toString() !== userId
    );
    await group.save();

    res.json({ message: "Member removed", group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId }).populate("members", "name")
    .populate("admin", "name");
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
