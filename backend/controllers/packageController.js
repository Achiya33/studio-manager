import Package from '../models/Package.js';

export const getPackages = async (req, res) => {
  try {
    const { studioId } = req.params;
    const packages = await Package.find({ studioId }).sort({ price: 1 });
    res.status(200).json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createPackage = async (req, res) => {
  try {
    // Only allow whitelisted fields
    const { studioId, name, price, description } = req.body;

    if (!studioId || !name || price === undefined) {
      return res.status(400).json({ message: 'Missing required fields: studioId, name, price' });
    }

    const pkg = new Package({
      studioId,
      name: String(name).trim().slice(0, 200),
      price: Number(price) || 0,
      description: String(description || '').trim().slice(0, 2000)
    });

    await pkg.save();
    res.status(201).json(pkg);
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(400).json({ message: 'Server error' });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow whitelisted fields
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = String(req.body.name).trim().slice(0, 200);
    if (req.body.price !== undefined) updateData.price = Number(req.body.price) || 0;
    if (req.body.description !== undefined) updateData.description = String(req.body.description).trim().slice(0, 2000);

    const pkg = await Package.findByIdAndUpdate(id, updateData, { new: true });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.status(200).json(pkg);
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(400).json({ message: 'Server error' });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByIdAndDelete(id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.status(200).json({ message: 'Package deleted' });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
