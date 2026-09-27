import mongoose from 'mongoose';

const shootSchema = new mongoose.Schema({
  studioId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Studio'
  },
  clientId: {
    type: String,
    default: 'new'
  },
  clientName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true
  },
  paid: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed'],
    default: 'upcoming'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Shoot', shootSchema);
