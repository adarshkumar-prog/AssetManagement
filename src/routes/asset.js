const express = require('express');
const assetRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const Asset = require('../models/asset');
const { validateAssetData } = require('../utils/validation');
const User = require('../models/user');



//Create new asset (admin only)
assetRouter.post('/api/assets', userAuth, async (req, res) => {
  try {
    const { name, serialNumber, status, assignedTo } = req.body;
    const userWantsToCreateId = req.user.id;
    const userWantsToCreate = await User.findById(userWantsToCreateId);
    if(userWantsToCreate.role !== "admin"){
        throw new Error("Only admin can create assets");
    }

    await validateAssetData(req);

    // Create new asset
    const asset = new Asset({
      name,
      serialNumber,
      status: status || 'Available',
      assignedTo: assignedTo || null
    });

    const savedAsset = await asset.save();

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: savedAsset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

//Get all assets with filtering options (admin only)
assetRouter.get('/api/assets', userAuth, async (req, res) => {
  try {
    const { name, status, assignedTo } = req.query;
    const userWantsToViewId = req.user._id;
    const userWantsToView = await User.findById(userWantsToViewId);
    // Check if user is admin
    if (userWantsToView.role !== "admin") {
      throw new Error("Only admin can view assets");
    }

    const filters = {};

    // Optional filters from query params
    if (name) filters.name = name;
    if (status) filters.status = status;
    if (assignedTo === 'null') {
      filters.assignedTo = null;
    } else if (assignedTo) {
      filters.assignedTo = assignedTo;
    }

    // Fetch assets from DB with filters and populate assignedTo user
    const assets = await Asset.find(filters).populate('assignedTo', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

//Get asset by ID (admin only)
assetRouter.get('/api/assets/:id', userAuth, async (req, res) => {
  try {
    const assetId = req.params.id;

    const userWantsToViewId = req.user._id;
    const userWantsToView = await User.findById(userWantsToViewId);
    // Check if user is admin
    if (userWantsToView.role !== "admin") {
      throw new Error("Only admin can view asset details");
    }

    // Find asset by ID and populate assignedTo user
    const asset = await Asset.findById(assetId).populate('assignedTo', 'firstName lastName emailId');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(200).json({
      success: true,
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Update asset information (admin only)
assetRouter.patch('/api/assets/:id', userAuth, async (req, res) => {
    try{
        const assetId = req.params.id;
        const userWantsToUpdateId = req.user._id;
        const userWantsToUpdate = await User.findById(userWantsToUpdateId);
        if(userWantsToUpdate.role !== "admin"){
            throw new Error("Only admin can update assets");
        }
        const { name, serialNumber, status, assignedTo } = req.body;

        // Find asset by ID
        const asset = await Asset.findById(assetId);
        if (!asset) {
            throw new Error('Asset not found');
        }

        // Update asset fields
        if (name) asset.name = name;
        if (serialNumber) asset.serialNumber = serialNumber;
        if (status) asset.status = status;
        if (assignedTo) {
            // If assignedTo is null, set it to null
            if (assignedTo === 'null') {
                asset.assignedTo = null;
            } else {
                asset.assignedTo = assignedTo;
            }
        }
        await asset.save();
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Asset updated successfully',
            data: asset
        });
    }catch(err) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message
        });
    }
})

//Delete asset (admin only)
assetRouter.delete('/api/assets/:id', userAuth, async (req, res) => {
    try{
        const assetId = req.params.id;

        // Find asset by ID
        const asset = await Asset.findById(assetId);
        const userWantsToDeleteId = req.user._id;
        const userWantsToDelete = await User.findById(userWantsToDeleteId);
        // Check if user is admin
        if(userWantsToDelete.role !== "admin"){
            throw new Error("Only admin can delete assets");
        }
        if (!asset) {
            throw new Error('Asset already not present');
        }
        // Delete asset
        await Asset.findByIdAndDelete(assetId);
        res.status(200).json({
            success: true,
            message: 'Asset deleted successfully'
        });
    }catch(err){
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message
        });
    }
})
module.exports = assetRouter;
