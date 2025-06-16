// Copyright (C) 2025 Pickup Basketball
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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