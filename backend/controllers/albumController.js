import Album from '../models/Album.js';

export const getAlbums = async (req, res) => {
  try {
    const { studioId } = req.params;
    const albums = await Album.find({ studioId }).populate('shootId').sort({ createdAt: -1 });
    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAlbum = async (req, res) => {
  try {
    const album = new Album(req.body);
    album.stageHistory.push({ stage: album.stage, movedBy: req.body.createdBy || 'system' });
    await album.save();
    res.status(201).json(album);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if stage is changing to update history
    if (req.body.stage) {
      const currentAlbum = await Album.findById(id);
      if (currentAlbum && currentAlbum.stage !== req.body.stage) {
        req.body.$push = {
          stageHistory: {
            stage: req.body.stage,
            movedBy: req.body.updatedBy || 'system'
          }
        };
      }
    }

    const album = await Album.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(album);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    await Album.findByIdAndDelete(id);
    res.status(200).json({ message: 'Album deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
