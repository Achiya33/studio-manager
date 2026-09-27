import mongoose from 'mongoose';

const studioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['photographer', 'videographer'],
    default: 'photographer',
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  logoUrl: {
    type: String,
    default: '',
  },
  members: [
    {
      uid: {
        type: String, // Firebase UID of the user
        required: true,
      },
      role: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'staff',
      }
    }
  ],
}, { timestamps: true });

export default mongoose.model('Studio', studioSchema);
