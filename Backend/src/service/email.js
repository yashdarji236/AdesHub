import dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../model/User.js';

dotenv.config();

const app = express();

app.use(passport.initialize());

// Configure Passport to use Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SEC,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create user in MongoDB
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
      });
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Route to initiate Google OAuth flow
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route that Google will redirect to after authentication
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate a JWT for the authenticated user
    const token = jwt.sign(
      { id: req.user._id, displayName: req.user.displayName, email: req.user.email }, 
      process.env.JWT_SECRET || 'your_jwt_secret_key_here', 
      { expiresIn: '1h' }
    );
    // Redirect to the frontend Home page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/home?token=${token}`);
  }
);

export default app;
