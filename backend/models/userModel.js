import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
  },
  friends: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    default: [], 
  },
  email: {
    type: String,
    required: true,
    lowercase:true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  profilePic: {
    type: String,
    default:
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  status: {
    type: String,
    default: "offline",
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
},
{
  timestamps: true,
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
