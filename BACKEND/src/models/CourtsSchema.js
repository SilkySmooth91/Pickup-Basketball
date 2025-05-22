import mongoose  from "mongoose"

const courtsSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    coordinates: { type: GeoJSON, required: true }, // al posto di GeoJSON, implementare libreria mappe.
    baskets: { type: Number, required: true, min: 1 },
    officialsize: { type: Boolean, required: true, default: false },
    nightlights: { type: Boolean, required: true, default: false },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }]
})

const courtModel = mongoose.model("Courts", courtsSchema)
export default courtModel