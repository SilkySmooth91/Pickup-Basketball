import mongoose from "mongoose";

const eventsSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String },
    court:  { type: mongoose.Schema.Types.ObjectId, ref: "Courts", required: true },
    datetime: { type: Date, required: true },
    maxplayers: { type: Number },
    isprivate: { type: Boolean, required: true, default: false },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }]
})

const eventModel = mongoose.model("Events", eventsSchema)
export default eventModel