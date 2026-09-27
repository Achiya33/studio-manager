import User from '../models/User.js';

// Get or Create a User (Called when they login via Google Firebase Auth)
export const syncUser = async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ message: 'UID and Email are required' });
    }

    // Check if user exists
    let user = await User.findOne({ uid });

    if (!user) {
      // If user doesn't exist, create a new one
      user = new User({
        uid,
        email,
        displayName: displayName || email.split('@')[0], // Fallback if no name
        photoURL: photoURL || '',
      });
      await user.save();
    } else if (photoURL && user.photoURL !== photoURL) {
      // Update photoURL if it has changed (e.g. user updated their Google profile)
      user.photoURL = photoURL;
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
    const { displayName } = req.body;

    const user = await User.findOneAndUpdate(
      { uid },
      { displayName },
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
