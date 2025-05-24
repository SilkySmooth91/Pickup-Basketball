import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import "dotenv/config";
import usersModel from '../../models/UsersSchema.js';
import { generateTokens } from '../../utils/generateTokens.js';

const googleStrategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
},
  async function (req, accessToken, refreshToken, profile, done) {
    try {
      const { email, name, given_name, family_name, email_verified } = profile._json;

      const user = await usersModel.findOne({ email });

      if (user) {
        const tokens = await generateTokens({
          id: user.id,
          username: user.username,
          email: user.email
        });
        return done(null, tokens);
      } else {
        const newUser = new usersModel({
          username: `${given_name} ${family_name}` || name || email,
          email,
          password: "-", // campo obbligatorio, non usato con Google
          verified: email_verified,
          googleId: profile.id
        });

        const createdUser = await newUser.save();

        const tokens = await generateTokens({
          id: createdUser.id,
          username: createdUser.username,
          email: createdUser.email
        });

        return done(null, tokens);
      }
    } catch (err) {
      console.error("Errore nella GoogleStrategy:", err);
      return done(err, null);
    }
  }
);

export default googleStrategy;

