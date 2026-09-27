import Shoot from '../models/Shoot.js';

export const getShoots = async (req, res) => {
  try {
    const { studioId } = req.params;
    const shoots = await Shoot.find({ studioId }).sort({ date: -1 });
    res.status(200).json(shoots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShoot = async (req, res) => {
  try {
    const shoot = new Shoot(req.body);
    await shoot.save();
    res.status(201).json(shoot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateShoot = async (req, res) => {
  try {
    const { id } = req.params;
    const shoot = await Shoot.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(shoot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteShoot = async (req, res) => {
  try {
    const { id } = req.params;
    await Shoot.findByIdAndDelete(id);
    res.status(200).json({ message: 'Shoot deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
