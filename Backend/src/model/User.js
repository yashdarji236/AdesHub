import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    default: undefined,
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  avatar: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', UserSchema);

// Automatically drop outdated or conflicting googleId index on DB startup
User.collection.dropIndex('googleId_1').catch(() => {
  // Index didn't exist or already dropped, safe to ignore
});

export default User;
