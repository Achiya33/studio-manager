import Shoot from '../models/Shoot.js';

export const getShoots = async (req, res) => {
  try {
    const { studioId } = req.params;
    const shoots = await Shoot.find({ studioId }).sort({ date: -1 });
    res.status(200).json(shoots);
  } catch (error) {
    console.error('Error fetching shoots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createShoot = async (req, res) => {
  try {
    // Only allow whitelisted fields (prevent mass assignment / NoSQL injection)
    const { studioId, clientName, type, date, location, amount, paid, status, notes, clientId } = req.body;

    if (!studioId || !clientName || !type || !date || amount === undefined) {
      return res.status(400).json({ message: 'Missing required fields: studioId, clientName, type, date, amount' });
    }

    const shoot = new Shoot({
      studioId,
      clientId: String(clientId || 'new').slice(0, 100),
      clientName: String(clientName).trim().slice(0, 200),
      type: String(type).trim().slice(0, 100),
      date: new Date(date),
      location: String(location || '').trim().slice(0, 500),
      amount: Number(amount) || 0,
      paid: Number(paid) || 0,
      status: ['upcoming', 'completed'].includes(status) ? status : 'upcoming',
      notes: String(notes || '').trim().slice(0, 2000)
    });

    await shoot.save();
    res.status(201).json(shoot);
  } catch (error) {
    console.error('Error creating shoot:', error);
    res.status(400).json({ message: 'Server error' });
  }
};

export const updateShoot = async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow whitelisted fields
    const allowedFields = ['clientName', 'type', 'date', 'location', 'amount', 'paid', 'status', 'notes', 'clientId'];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'status') {
          updateData[field] = ['upcoming', 'completed'].includes(req.body[field]) ? req.body[field] : 'upcoming';
        } else if (field === 'amount' || field === 'paid') {
          updateData[field] = Number(req.body[field]) || 0;
        } else if (field === 'date') {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = String(req.body[field]).trim().slice(0, 2000);
        }
      }
    }

    const shoot = await Shoot.findByIdAndUpdate(id, updateData, { new: true });
    if (!shoot) return res.status(404).json({ message: 'Shoot not found' });
    res.status(200).json(shoot);
  } catch (error) {
    console.error('Error updating shoot:', error);
    res.status(400).json({ message: 'Server error' });
  }
};

export const deleteShoot = async (req, res) => {
  try {
    const { id } = req.params;
    const shoot = await Shoot.findByIdAndDelete(id);
    if (!shoot) return res.status(404).json({ message: 'Shoot not found' });
    res.status(200).json({ message: 'Shoot deleted' });
  } catch (error) {
    console.error('Error deleting shoot:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
