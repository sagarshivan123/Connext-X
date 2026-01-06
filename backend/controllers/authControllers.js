import User from "../models/userModel.js";
import jwt from "jsonwebtoken";


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
const isProd = process.env.NODE_ENV === "production";



export const register = async (req, res) => {
  const {name,email,password} = req.body;
  let profilePic = "";
if (req.file) {
  profilePic = `/uploads/${req.file.filename}`;
}

  if(!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const isRegistered=await User.findOne({email});

  if(isRegistered){
  return res.status(400).json(("User already registered, please login"));
  }
  const user = await User.create({ name, email, password, profilePic,
  });
  const token = generateToken(user._id);
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,                 // ✅ true on Render
    sameSite: isProd ? "none" : "lax", // ✅ cross-site
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    profilePic: user.profilePic,
  });
  
}

export const login = async (req, res) => {
  const {email,password} = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }  
  const token = generateToken(user._id);
  if (user && (await user.matchPassword(password))) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,                 // ✅ true on Render
      sameSite: isProd ? "none" : "lax", // ✅ cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
}

export const logOut = async (req, res) => {
  res.
  cookie("token", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  .json({ message: "Logged out successfully" });
}

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("friends", "name email profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
  
};

export const addFriend = async (req, res) => {
  const { email } = req.body;
  const myId = req.user._id;

  const otherUser = await User.findOne({ email });
  if (!otherUser) return res.status(404).json({ message: "User not found" });

  if (otherUser._id.toString() === myId.toString())
    return res.status(400).json({ message: "You cannot add yourself" });

  const me = await User.findById(myId);

  // FIX: initialize missing field (prevents crash)
  if (!me.friends) me.friends = [];
  if (!otherUser.friends) otherUser.friends = [];

  if (me.friends.includes(otherUser._id))
    return res.json({ message: "Already connected" });

  me.friends.push(otherUser._id);
  otherUser.friends.push(myId);

  await me.save();
  await otherUser.save();

  res.json({ message: "User added successfully", friend: otherUser });
};

export const findUser=async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select("_id name email");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ user });
};
