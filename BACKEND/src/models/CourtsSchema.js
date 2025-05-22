import mongoose  from "mongoose"

const courtsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: { type: GeoJSON, required: true },
    baskets: { type: Number, required: true, min: 1 },
    officialsize: { type: Boolean, required: true, default: false },
    nightlights: { type: Boolean, required: true, default: false },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }]
})

const courtModel = mongoose.model("Courts", courtsSchema)