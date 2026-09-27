import Album from '../models/Album.js';

export const getAlbums = async (req, res) => {
  try {
    const { studioId } = req.params;
    const albums = await Album.find({ studioId }).populate('shootId').sort({ createdAt: -1 });
    res.status(200).json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAlbum = async (req, res) => {
  try {
    // Only allow whitelisted fields
    const { studioId, shootId, clientName, shootType, shootDate, priority, notes, stage, createdBy } = req.body;

    if (!studioId || !shootId || !clientName || !shootType || !shootDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const album = new Album({
      studioId,
      shootId,
      clientName: String(clientName).trim().slice(0, 200),
      shootType: String(shootType).trim().slice(0, 100),
      shootDate: new Date(shootDate),
      priority: ['normal', 'high', 'urgent'].includes(priority) ? priority : 'normal',
      notes: String(notes || '').trim().slice(0, 2000),
      stage: String(stage || 'to-design').trim().slice(0, 50)
    });

    album.stageHistory.push({ stage: album.stage, movedBy: createdBy || req.user.uid });
    await album.save();
    res.status(201).json(album);
  } catch (error) {
    console.error('Error creating album:', error);
    res.status(400).json({ message: 'Server error' });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow whitelisted fields
    const allowedFields = ['clientName', 'shootType', 'shootDate', 'priority', 'notes', 'stage'];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'priority') {
          updateData[field] = ['normal', 'high', 'urgent'].includes(req.body[field]) ? req.body[field] : 'normal';
        } else if (field === 'shootDate') {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = String(req.body[field]).trim().slice(0, 2000);
        }
      }
    }

    // Check if stage is changing to update history
    if (req.body.stage) {
      const currentAlbum = await Album.findById(id);
      if (currentAlbum && currentAlbum.stage !== req.body.stage) {
        updateData.$push = {
          stageHistory: {
            stage: req.body.stage,
            movedBy: req.body.updatedBy || req.user.uid
          }
        };
      }
    }

    const album = await Album.findByIdAndUpdate(id, updateData, { new: true });
    if (!album) return res.status(404).json({ message: 'Album not found' });
    res.status(200).json(album);
  } catch (error) {
    console.error('Error updating album:', error);
    res.status(400).json({ message: 'Server error' });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const album = await Album.findByIdAndDelete(id);
    if (!album) return res.status(404).json({ message: 'Album not found' });
    res.status(200).json({ message: 'Album deleted' });
  } catch (error) {
    console.error('Error deleting album:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
