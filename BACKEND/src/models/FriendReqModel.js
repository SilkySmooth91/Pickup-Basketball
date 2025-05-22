import mongoose from "mongoose"

const friendRequestSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending"}
}, { timestamps: true })

const friendRequestModel = mongoose.model("FriendRequests", friendRequestSchema)
export default friendRequestModel
