import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  studioId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Studio'
  },
  shootId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shoot',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  shootType: {
    type: String,
    required: true
  },
  shootDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal'
  },
  notes: {
    type: String,
    default: ''
  },
  stage: {
    type: String,
    default: 'to-design'
  },
  stageHistory: [{
    stage: String,
    movedAt: { type: Date, default: Date.now },
    movedBy: String // user ID of who moved it
  }]
}, { timestamps: true });

export default mongoose.model('Album', albumSchema);
