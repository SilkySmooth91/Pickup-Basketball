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
    leftParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }], // Traccia utenti che hanno lasciato l'evento
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],
    reminderSent: { type: Boolean, default: false }
})

const eventModel = mongoose.model("Events", eventsSchema)
export default eventModel