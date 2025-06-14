import mongoose  from "mongoose"

const courtsSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // Array di numeri [longitudine, latitudine]
            required: true
        }
    },
    baskets: { type: Number, required: true, min: 1 },
    officialsize: { type: Boolean, required: true, default: false },
    nightlights: { type: Boolean, required: true, default: false },
    images: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
})

// Creiamo un indice geospaziale per abilitare query geografiche
courtsSchema.index({ coordinates: '2dsphere' });

const courtModel = mongoose.model("Courts", courtsSchema)
export default courtModel