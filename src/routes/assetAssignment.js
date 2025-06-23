const express = require('express');
const assetAssignmentRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const Asset = require('../models/asset');
const User = require('../models/user');


// Assign asset to a user(admin only)
assetAssignmentRouter.post('/api/assets/:id/assign', userAuth, async(req, res) => {
  const assetId = req.params.id;
  const userId = req.body.userId;

  const userWantsToAssignId = req.user._id;
  const userWantsToAssign = await User.findById(userWantsToAssignId);
  if (userWantsToAssign.role !== "admin") {
    return res.status(403).json({ message: 'Only admin can assign assets' });
  }

  try {
    const asset = await Asset.findById(assetId);
    const user = await User.findById(userId);

    if (!asset || !user) {
      throw new Error({ message: 'Asset or User not found' });
    }

    asset.assignedTo = userId;
    asset.status = 'Assigned';
    await asset.save();

    res.status(200).json({ message: 'Asset assigned successfully', asset });
  } catch (error) {
    console.error('Error assigning asset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unassign asset from a user(admin only)
assetAssignmentRouter.post('/api/assets/:id/unassign', userAuth, async(req, res) => {
  const assetId = req.params.id;

  try {
    const userWantsToUnassignId = req.user._id;
    const userWantsToUnassign = await User.findById(userWantsToUnassignId);
    if (userWantsToUnassign.role !== "admin") {
      return res.status(403).json({ message: 'Only admin can unassign assets' });
    }
    const asset = await Asset.findById(assetId);
    if (!asset) {
      throw new Error({ message: 'Asset not found' });
    }

    asset.assignedTo = null;
    asset.status = 'Available';
    await asset.save();

    res.status(200).json({ message: 'Asset unassigned successfully', asset });
  } catch (error) {
    console.error('Error unassigning asset:' + error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all assets assigned to a specific user(admin only)
assetAssignmentRouter.get('/api/assets/assigned/:userId', userAuth, async(req, res) => {
    const userId = req.params.userId;
    try{
        const userWantsToViewId = req.user._id;
        const userWantsToView = await User.findById(userWantsToViewId);
        if(userWantsToView.role !== "admin"){
            return res.status(403).json({ message: 'Only admin can view assigned assets' });
        }
        const user = await User.findById(userId);
        if(!user){
            throw new Error({message: 'User not found'});
        }
        const assignedAssets = await Asset.find({ assignedTo: userId }).populate('assignedTo', 'firstName lastName email');
        res.status(200).json({ assignedAssets });
    }catch(error) {
        console.error('Error fetching assigned assets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// Get all available (unassigned) assets
assetAssignmentRouter.get('/api/assetsIsAvailable', userAuth, async(req, res) => {
    try {
        const availableAssets = await Asset.find({ status: 'Available' });
        if (availableAssets.length === 0) {
            return res.status(404).json({ message: 'No available assets found' });
        }
        
         // Return the list of available assets
        res.status(200).json({ availableAssets });
    } catch (error) {
        console.error('Error fetching available assets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = assetAssignmentRouter;