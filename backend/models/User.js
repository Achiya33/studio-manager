import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true, // Firebase UID will be the unique identifier
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  photoURL: {
    type: String,
    default: '',
  }
}, {
  timestamps: true // This will automatically add createdAt and updatedAt fields
});

const User = mongoose.model('User', userSchema);

export default User;
