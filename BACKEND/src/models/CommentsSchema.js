import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    target: { type: String, required: true, enum: ["Users", "Courts", "Events"] },
    targetid: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        refPath: "target" 
    }
}, { timestamps: true })

const commentModel = mongoose.model("Comments", commentsSchema)
export default commentModel