import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema(
  {
    refreshToken: { type: String, default: null },
    username: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 13 },
    city: { type: String, required: true, trim: true },
    height: { type: Number, default: null },
    basketrole: {type: String, default: null, enum: ['playmaker', 'guard', 'forward', 'center']},
    bestskill: { type: String, default: null},
    email: { type: String, required: true, unique: true },
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

