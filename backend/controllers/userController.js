import User from '../models/User.js';

// Get or Create a User (Called when they login via Google Firebase Auth)
export const syncUser = async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    // SECURITY: Ensure the authenticated user can only sync their own data
    if (req.user.uid !== uid) {
      return res.status(403).json({ message: 'Forbidden: You can only sync your own account' });
    }

    if (!uid || !email) {
      return res.status(400).json({ message: 'UID and Email are required' });
    }

    // Sanitize inputs — only allow expected fields
    const sanitizedDisplayName = String(displayName || email.split('@')[0]).slice(0, 100);
    const sanitizedPhotoURL = String(photoURL || '').slice(0, 500);
    const sanitizedEmail = String(email).toLowerCase().slice(0, 254);

    // Check if user exists
    let user = await User.findOne({ uid });

    if (!user) {
      // If user doesn't exist, create a new one
      user = new User({
        uid,
        email: sanitizedEmail,
        displayName: sanitizedDisplayName,
        photoURL: sanitizedPhotoURL,
      });
      await user.save();
    } else if (sanitizedPhotoURL && user.photoURL !== sanitizedPhotoURL) {
      // Update photoURL if it has changed (e.g. user updated their Google profile)
      user.photoURL = sanitizedPhotoURL;
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update User Profile (Called when they finish the Setup stage)
export const updateUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;

    // SECURITY: Users can only update their own profile
    if (req.user.uid !== uid) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
    }

    // Only allow whitelisted fields to be updated (prevent mass assignment)
    const { displayName } = req.body;

    if (!displayName || typeof displayName !== 'string') {
      return res.status(400).json({ message: 'Valid display name is required' });
    }

    const sanitizedName = displayName.trim().slice(0, 100);

    const user = await User.findOneAndUpdate(
      { uid },
      { displayName: sanitizedName },
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
