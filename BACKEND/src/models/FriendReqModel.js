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

import mongoose from "mongoose"

const friendRequestSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending"}
}, { timestamps: true })

const friendRequestModel = mongoose.model("FriendRequests", friendRequestSchema)
export default friendRequestModel
