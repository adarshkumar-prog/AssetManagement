const express = require('express');
const assetAssignmentRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const Asset = require('../models/asset');
const User = require('../models/user');
const AssetAssignment = require('../models/assetAssignementModel');


// Assign asset to a user(admin only)
/**
 * @swagger
 * /api/assets/{id}/assign:
 *   post:
 *     summary: Assign asset to a user
 *     tags: [Asset Assignment]
 *     description: This endpoint allows an admin to assign an asset to a user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to assign.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to whom the asset will be assigned.
 *     responses:
 *       200:
 *         description: Asset assigned successfully
 *       403:
 *         description: Forbidden - Only admin can assign assets
 *       404:
 *         description: Not Found - Asset or User not found
 *       500:
 *         description: Internal server error
 *     security:  
 *       - bearerAuth: [] 
 */
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
    if(asset.status !== 'Available') {
      return res.status(400).json({ message: 'Asset is not available for assignment' });
    }

    asset.assignedTo = userId;
    asset.status = 'Assigned';
    await asset.save();

    const assetAssignment = new AssetAssignment({
      assetId: asset._id,
      assignedTo: user._id,
      assignedAt: new Date(),
      status: 'Assigned'
    });
    await assetAssignment.save();

    res.status(200).json({ message: 'Asset assigned successfully', asset });
  } catch (error) {
    console.error('Error assigning asset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unassign asset from a user(admin only)
/**
 * @swagger
 * /api/assets/{id}/unassign:
 *   post:
 *     summary: Unassign asset from a user
 *     tags: [Asset Assignment]
 *     description: This endpoint allows an admin to unassign an asset from a user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to unassign.
 *     responses:
 *       200:
 *         description: Asset unassigned successfully
 *       403:
 *         description: Forbidden - Only admin can unassign assets
 *       404:
 *         description: Not Found - Asset not found
 *       500:
 *         description: Internal server error
 *     security:  
 *       - bearerAuth: []
 */
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
    if( asset.status !== 'Assigned') {
      return res.status(400).json({ message: 'Asset is not currently assigned' });
    }
    asset.status = 'Available';
    const assetAssignment = await AssetAssignment.findOne({ assetId: asset._id, status: 'Assigned' });
    if (assetAssignment) {
      assetAssignment.status = 'Unassigned';
      assetAssignment.unassignedAt = new Date();
      await assetAssignment.save();
    }
    await asset.save();

    res.status(200).json({ message: 'Asset unassigned successfully', asset });
  } catch (error) {
    console.error('Error unassigning asset:' + error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all assets assigned to a specific user(admin only)
/**
 * @swagger
 * /api/assets/assigned/{userId}:
 *   get:
 *     summary: Get all assets assigned to a specific user
 *     tags: [Asset Assignment]
 *     description: This endpoint allows an admin to view all assets assigned to a specific user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose assigned assets are to be retrieved.
 *     responses:
 *       200:
 *         description: Successfully retrieved assigned assets
 *       403:
 *         description: Forbidden - Only admin can view assigned assets
 *       404:
 *         description: Not Found - User not found
 *       500:
 *         description: Internal server error
 */
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
/**
 * @swagger
 * /api/assetsIsAvailable:
 *   get:
 *     summary: Get all available (unassigned) assets
 *     tags: [Asset Assignment]
 *     description: This endpoint allows users to view all assets that are currently available (unassigned).
 *     responses:
 *       200:
 *         description: Successfully retrieved available assets
 *       404:
 *         description: No available assets found
 *       500:
 *         description: Internal server error
 */
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

// Get all previously assigned assets of a user (admin only)
assetAssignmentRouter.get('/api/assets/previouslyAssigned/:userId', userAuth, async(req, res) => {
    const userId = req.params.userId;
    try{
        const userWantsToViewId = req.user._id;
        const userWantsToView = await User.findById(userWantsToViewId);
        if(userWantsToView.role !== "admin"){
            return res.status(403).json({ message: 'Only admin can view previously assigned assets' });
        }
        const user = await User.findById(userId);
        if(!user){
            throw new Error({message: 'User not found'});
        }
        const previouslyAssignedAssets = await Asset.find({ 'previouslyAssignedTo.userId': userId }).populate('previouslyAssignedTo.userId', 'firstName lastName email');
        res.status(200).json({ previouslyAssignedAssets });
    }catch(error) {
        console.error('Error fetching previously assigned assets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// user wants to return an asset
assetAssignmentRouter.post('/api/assets/:id/return', userAuth, async(req, res) => {
  const assetId = req.params.id;
  const userId = req.user._id;
  try{
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    if (asset.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to return this asset' });
    }
    if (asset.status !== 'Assigned') {
      return res.status(400).json({ message: 'Asset is not currently assigned' });
    }

    // Unassign the asset
    asset.previouslyAssignedTo.push({
      userId: asset.assignedTo,
      assignedAt: asset.assignedAt,
      unassignedAt: new Date()
    });
    const user = await User.findById(userId);
    user.assignedAssets.pull(assetId);
    user.previouslyAssignedAssets.push({
      assetId: asset._id,
      assignedAt: asset.assignedAt,
      unassignedAt: new Date()
    });
    asset.assignedTo = null;
    asset.assignedAt = null;
    asset.status = 'Available';

    await asset.save();
    await user.save();
    res.status(200).json({ message: 'Asset returned successfully' });
  }catch(error) {
    console.error('Error returning asset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

// Get all asset assigned between certain time period (admin only)
assetAssignmentRouter.get('/api/asset/assignedBetween', userAuth, async(req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const userWantsToViewId = req.user._id;
    const userWantsToView = await User.findById(userWantsToViewId);
    if (userWantsToView.role !== "admin") {
      return res.status(403).json({ message: 'Only admin can view assets assigned between certain time period' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const assets = await Asset.find({
  $or: [
    {
      assignedAt: { $ne: null, $lte: new Date(endDate) },
      $or: [
        { assignedAt: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { assignedAt: { $lte: new Date(startDate) }, status: 'Assigned' }
      ]
    },
    {
      previouslyAssignedTo: {
        $elemMatch: {
          assignedAt: { $lte: new Date(endDate) },
          unassignedAt: { $gte: new Date(startDate) }
        }
      }
    }
  ]
}).populate('assignedTo', 'firstName lastName email');

    res.status(200).json({ assets});
  } catch (error) {
    console.error('Error fetching assets assigned between dates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

module.exports = assetAssignmentRouter;