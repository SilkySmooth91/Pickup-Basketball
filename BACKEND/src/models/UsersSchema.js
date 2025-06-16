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

import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema(
  {
    refreshToken: { type: String, default: null },
    username: { type: String, required: true, trim: true },
    age: { type: Number, min: 13 },
    city: { type: String, trim: true }, 
    height: { type: Number, default: null },
    basketrole: {type: String, default: null, enum: ['Playmaker', 'Guard', 'Forward', 'Center']},
    bestskill: { type: String, default: null},    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,64}$/, 'Il formato email non è valido']
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    googleId: { type: String, index: true },
    avatar: { type: String, default: null },
    verified: { type: Boolean, default: false },
    role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    commentsOnProfile: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }],
    commentsByUser: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate: tutti gli eventi in cui l'utente compare come partecipante
usersSchema.virtual('userEvents', {
  ref: 'Events',
  localField: '_id',
  foreignField: 'participants',
});

// Virtual populate: richieste di amicizia in entrata (pendenti)
usersSchema.virtual('incomingRequests', {
  ref: 'FriendRequests',
  localField: '_id',
  foreignField: 'to',
  justOne: false,
  options: { match: { status: 'pending' } },
});

// Virtual populate: richieste di amicizia in uscita (pendenti)
usersSchema.virtual('outgoingRequests', {
  ref: 'FriendRequests',
  localField: '_id',
  foreignField: 'from',
  justOne: false,
  options: { match: { status: 'pending' } },
});

const usersModel = mongoose.model('Users', usersSchema);
export default usersModel;

