import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
name:{
    type: String,
    required: true,
},
members:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
}],
createdBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
},
admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
description:{
    type: String,
    default: "",
},
groupPic:{
    type: String,
    default: "https://icon-library.com/images/group-icon-png/group-icon-png-29.jpg",
},
},
{
    timestamps: true,
}
)
const Group = mongoose.model("Group", groupSchema);
export default Group;