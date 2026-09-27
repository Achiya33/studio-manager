import Studio from '../models/Studio.js';
import User from '../models/User.js';

// Create a new studio and add creator as admin
export const createStudio = async (req, res) => {
  try {
    const { name, type, phone, address, logoUrl, uid } = req.body;
    
    const newStudio = new Studio({
      name,
      type,
      phone,
      address,
      logoUrl,
      members: [{ uid, role: 'admin' }]
    });

    const savedStudio = await newStudio.save();
    res.status(201).json(savedStudio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all studios where user is a member
export const getUserStudios = async (req, res) => {
  try {
    const { uid } = req.params;
    const studios = await Studio.find({ 'members.uid': uid });
    res.status(200).json(studios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get studio by ID
export const getStudioById = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    if (!studio) return res.status(404).json({ message: 'Studio not found' });
    res.status(200).json(studio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update studio profile
export const updateStudio = async (req, res) => {
  try {
    const { name, type, phone, address, logoUrl } = req.body;
    const studio = await Studio.findByIdAndUpdate(
      req.params.id,
      { name, type, phone, address, logoUrl },
      { new: true }
    );
    res.status(200).json(studio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a member (Invite)
export const addStudioMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    // We expect the frontend to create the Firebase user and get their uid.
    // Wait, the frontend shouldn't create the user directly for security unless they are an admin.
    // For now, we will assume we pass uid if the user exists, or we handle it later.
    // Actually, to make it simple, we just add the uid if known.
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: 'UID required to add member' });

    const studio = await Studio.findById(req.params.id);
    if (!studio) return res.status(404).json({ message: 'Studio not found' });

    // Check if member already exists
    const existing = studio.members.find(m => m.uid === uid);
    if (existing) return res.status(400).json({ message: 'User is already a member' });

    studio.members.push({ uid, role });
    await studio.save();
    
    res.status(200).json(studio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a member
export const removeStudioMember = async (req, res) => {
  try {
    const { id, uid } = req.params;
    const studio = await Studio.findById(id);
    if (!studio) return res.status(404).json({ message: 'Studio not found' });

    studio.members = studio.members.filter(m => m.uid !== uid);
    await studio.save();

    res.status(200).json(studio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get members (with User details)
export const getStudioMembers = async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    if (!studio) return res.status(404).json({ message: 'Studio not found' });

    const uids = studio.members.map(m => m.uid);
    const users = await User.find({ uid: { $in: uids } });

    // Combine user details with role
    const members = users.map(user => {
      const memberData = studio.members.find(m => m.uid === user.uid);
      return {
        ...user.toObject(),
        role: memberData?.role || 'staff',
        addedAt: memberData?.addedAt
      };
    });

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
