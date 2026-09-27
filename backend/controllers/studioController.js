import Studio from '../models/Studio.js';
import User from '../models/User.js';

// Create a new studio and add creator as admin
export const createStudio = async (req, res) => {
  try {
    // Only allow whitelisted fields (prevent mass assignment)
    const { name, type, phone, address, logoUrl } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Studio name is required' });
    }

    const newStudio = new Studio({
      name: String(name).trim().slice(0, 200),
      type: ['photographer', 'videographer'].includes(type) ? type : 'photographer',
      phone: String(phone || '').trim().slice(0, 20),
      address: String(address || '').trim().slice(0, 500),
      logoUrl: String(logoUrl || '').slice(0, 500000), // base64 can be large
      // SECURITY: Always use the authenticated user's UID, not from request body
      members: [{ uid: req.user.uid, role: 'admin' }]
    });

    const savedStudio = await newStudio.save();
    res.status(201).json(savedStudio);
  } catch (error) {
    console.error('Error creating studio:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all studios where user is a member
export const getUserStudios = async (req, res) => {
  try {
    const { uid } = req.params;

    // SECURITY: Users can only fetch their own studios
    if (req.user.uid !== uid) {
      return res.status(403).json({ message: 'Forbidden: You can only access your own studios' });
    }

    const studios = await Studio.find({ 'members.uid': uid });
    res.status(200).json(studios);
  } catch (error) {
    console.error('Error fetching studios:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get studio by ID
// Authorization is handled by verifyStudioMember middleware
export const getStudioById = async (req, res) => {
  try {
    // req.studio is already loaded by the middleware
    res.status(200).json(req.studio);
  } catch (error) {
    console.error('Error fetching studio:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update studio profile
// Authorization (admin only) is handled by verifyStudioMember('admin') middleware
export const updateStudio = async (req, res) => {
  try {
    // Only allow whitelisted fields
    const { name, type, phone, address, logoUrl } = req.body;

    const updateData = {};
    if (name) updateData.name = String(name).trim().slice(0, 200);
    if (type && ['photographer', 'videographer'].includes(type)) updateData.type = type;
    if (phone !== undefined) updateData.phone = String(phone).trim().slice(0, 20);
    if (address !== undefined) updateData.address = String(address).trim().slice(0, 500);
    if (logoUrl !== undefined) updateData.logoUrl = String(logoUrl).slice(0, 500000);

    const studio = await Studio.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.status(200).json(studio);
  } catch (error) {
    console.error('Error updating studio:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a member (Invite)
// Authorization (admin only) is handled by verifyStudioMember('admin') middleware
export const addStudioMember = async (req, res) => {
  try {
    const { uid, role } = req.body;
    if (!uid) return res.status(400).json({ message: 'UID required to add member' });

    // SECURITY: Validate role — only allow 'staff', never allow adding another 'admin' via API
    const safeRole = role === 'admin' ? 'staff' : (role || 'staff');

    const studio = req.studio; // Already loaded by middleware

    // Check if member already exists
    const existing = studio.members.find(m => m.uid === uid);
    if (existing) return res.status(400).json({ message: 'User is already a member' });

    studio.members.push({ uid, role: safeRole });
    await studio.save();
    
    res.status(200).json(studio);
  } catch (error) {
    console.error('Error adding studio member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove a member
// Authorization (admin only) is handled by verifyStudioMember('admin') middleware
export const removeStudioMember = async (req, res) => {
  try {
    const { id, uid } = req.params;

    // SECURITY: Prevent admin from removing themselves (last admin protection)
    if (uid === req.user.uid) {
      return res.status(400).json({ message: 'You cannot remove yourself from the studio' });
    }

    const studio = req.studio; // Already loaded by middleware

    studio.members = studio.members.filter(m => m.uid !== uid);
    await studio.save();

    res.status(200).json(studio);
  } catch (error) {
    console.error('Error removing studio member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get members (with User details)
export const getStudioMembers = async (req, res) => {
  try {
    const studio = req.studio; // Already loaded by middleware

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
    console.error('Error fetching studio members:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
