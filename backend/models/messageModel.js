import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    message: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: "",
    },    
    mediaUrl: {
      type: String,
      default: null,
    },

    mediaType: {
      type: String,
      enum: ["image", "video", "audio", "document", null],
      default: null,
    },
    fileName: { type: String },
    fileSize: { type: Number },
    isSeen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ SAFE VALIDATION
messageSchema.pre("validate", function () {
  if (!this.message && !this.mediaUrl) {
    this.invalidate("message", "Message must contain text or media");
  }

  if (!this.receiver && !this.group) {
    this.invalidate("receiver", "Message must belong to a user or a group");
  }
});


export default mongoose.model("Message", messageSchema);
