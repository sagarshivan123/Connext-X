import Message from "../models/messageModel.js";
import {io} from "../server.js"

// Send message
// In your message controller
const getMediaType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'document';
};

export const sendMessage = async (req, res) => {
  try {
    const { message, chatType, receiverId, groupId } = req.body;
    const sender = req.user._id;

    const messageData = {
      sender,
      message: message || null,
      mediaUrl: req.file ? `/uploads/${req.file.filename}` : null,
      mediaType: req.file ? getMediaType(req.file.mimetype) : null,
      fileName: req.file ? req.file.originalname : null,
      fileSize: req.file ? req.file.size : null,
    };

    // For group messages
    if (chatType === 'group') {
      messageData.group = groupId;  // Use 'group' field (not 'groupId')
      messageData.receiver = null;
    } 
    // For private messages
    else {
      messageData.receiver = receiverId;
      messageData.group = null;
    }
    const newMessage = await Message.create(messageData);
    
    // Populate sender info for response
    await newMessage.populate('sender', 'name email avatar');

    // Socket emissions
    if (chatType === 'group') {
      // Emit to all group members
      io.to(groupId).emit("receiveGroupMessage", newMessage);
    } else {
      // Emit to private chat participants
      io.to(receiverId).emit("receivePrivateMessage", newMessage);
      io.to(sender.toString()).emit("receivePrivateMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Private chat history
export const getPrivateMessages = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Group chat history
export const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;

  const messages = await Message.find({
    group: groupId,               // ✅ ONLY this
  })
    .populate("sender", "name email avatar")
    .sort({ createdAt: 1 });

  res.json(messages);
};
// Delete message
export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check user permission — only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await message.deleteOne();
    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Mark messages as seen
export const seenMessage = async (req, res) => {
  const {user1,user2}= req.params;
  try{
    await Message.updateMany(
      {sender:user2, receiver:user1, isSeen:false},
      {$set:{isSeen:true}}
    );
    res.json({success:true, message:"Messages marked as seen"});
  } catch(error){
    res.status(500).json({error:error.message});
  }
}