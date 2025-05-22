import mongoose from "mongoose";

const teamsSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    members: [{type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true}],
    description: { type: String }
})

const teamModel = mongoose.model("Teams", teamsSchema)
export default teamModel