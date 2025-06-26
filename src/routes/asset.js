const express = require('express');
const assetRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const Asset = require('../models/asset');
const { validateAssetData } = require('../utils/validation');
const User = require('../models/user');
const AssetAssignment = require('../models/assetAssignementModel');



//Create new asset (admin only)
/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Create a new asset
 *     tags: [Asset Management]
 *     description: This endpoint allows an admin to create a new asset.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the asset
 *               serialNumber:
 *                 type: string
 *                 description: Serial number of the asset
 *               status:
 *                 type: string
 *                 enum: [Available, Assigned, Under Maintenance, Retired]
 *                 description: Status of the asset (default is 'Available')
 *               assignedTo:
 *                 type: string
 *                 description: User ID to whom the asset is assigned (optional)
 *     responses:
 *       201:
 *         description: Asset created successfully
 *       403:
 *         description: Forbidden - Only admin can create assets
 */
assetRouter.post('/api/assets', userAuth, async (req, res) => {
  try {
    const { name, serialNumber, status, assignedTo } = req.body;
    const userWantsToCreateId = req.user.id;
    const userWantsToCreate = await User.findById(userWantsToCreateId);
    if(userWantsToCreate.role !== "admin"){
        throw new Error("Only admin can create assets");
    }
    const isAlreadyExists = await Asset.findOne({ serialNumber });
    if (isAlreadyExists) {
      return res.status(400).json({
        success: false,
        message: 'Asset with this serial number already exists'
      });
    }

    await validateAssetData(req);

    // Create new asset
    const asset = new Asset({
      name,
      serialNumber,
      status: status || 'Available'
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
/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Get all assets with optional filters
 *     tags: [Asset Management]
 *     description: This endpoint allows an admin to view all assets with optional filters.
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter assets by name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, Assigned, Under Maintenance, Retired]
 *         description: Filter assets by status
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter assets by user ID to whom they are assigned (use 'null' for unassigned)
 *     responses:
 *       200:
 *         description: Successfully retrieved assets
 */
assetRouter.get('/api/assets', userAuth, async (req, res) => {
  try {
    const { name, status, assignedTo } = req.query;
    const userWantsToViewId = req.user._id;
    const userWantsToView = await User.findById(userWantsToViewId);
    if (userWantsToView.role !== "admin") {
      throw new Error("Only admin can view assets");
    }

    let assets = [];

    if (status === 'Assigned') {
      const assetFilter = {};
      if (name) assetFilter.name = name;
      const assetIds = await Asset.find(assetFilter).distinct('_id');

      const assignmentFilter = { assetId: { $in: assetIds }, status: 'Assigned' };
      if (assignedTo) assignmentFilter.assignedTo = assignedTo;

      assets = await AssetAssignment.find(assignmentFilter)
        .populate('assetId', 'name serialNumber status')
        .populate('assignedTo', 'firstName lastName email');
    } else {
      const assetFilter = {};
      if (name) assetFilter.name = name;
      if (status) assetFilter.status = status;
      assets = await Asset.find(assetFilter);
    }

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
/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Get asset by ID
 *     tags: [Asset Management]
 *     description: This endpoint allows an admin to view asset details by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved asset details
 *       403:
 *         description: Forbidden - Only admin can view asset details
 *       404:
 *         description: Not Found - Asset not found
 *       500:
 *         description: Internal server error
 */
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
    const asset = await Asset.findById(assetId);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    if(asset.status === 'Assigned') {
      const assignment = await AssetAssignment.findOne({ assetId: asset._id, status: 'Assigned' })
        .populate('assignedTo', 'firstName lastName email');
      return res.status(200).json({
        success: true,
        data: {
          ...asset.toObject(),
          assignedTo: assignment ? assignment.assignedTo : null
        }
      });
    }

    res.status(200).json({
      success: true,
      data: asset
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Update asset information (admin only)
/** * @swagger
 * /api/assets/{id}:
 *   patch:
 *     summary: Update asset information
 *     tags: [Asset Management]
 *     description: This endpoint allows an admin to update asset information by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the asset
 *               serialNumber:
 *                 type: string
 *                 description: Updated serial number of the asset
 *               status:
 *                 type: string
 *                 enum: [Available, Assigned, Under Maintenance, Retired]
 *                 description: Updated status of the asset
 *               assignedTo:
 *                 type: string
 *                 description: Updated user ID to whom the asset is assigned (use 'null' for unassigned)
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *       403:
 *         description: Forbidden - Only admin can update assets
 *       404:
 *         description: Not Found - Asset not found
 *       500:
 *         description: Internal server error
 */
assetRouter.patch('/api/assets/:id', userAuth, async (req, res) => {
    try{
        const assetId = req.params.id;
        const userWantsToUpdateId = req.user._id;
        const userWantsToUpdate = await User.findById(userWantsToUpdateId);
        if(userWantsToUpdate.role !== "admin"){
            throw new Error("Only admin can update assets");
        }
        const { name, serialNumber, status } = req.body;

        const asset = await Asset.findById(assetId);
        if (!asset) {
            throw new Error('Asset not found');
        }

        if(asset.status === 'Assigned' && status !== 'Assigned') {
          const assignment = await AssetAssignment.findOne({ assetId: asset._id, status: 'Assigned' });
          assignment.status = 'Unassigned';
          assignment.unassignedAt = new Date();
          await assignment.save();
        }

        if (name) asset.name = name;
        if (serialNumber) asset.serialNumber = serialNumber;
        if (status) asset.status = status;
        await asset.save();
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
/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     summary: Delete an asset
 *     tags: [Asset Management]
 *     description: This endpoint allows an admin to delete an asset by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to delete.
 *     responses:
 *       200:
 *         description: Asset deleted successfully
 *       403:
 *         description: Forbidden - Only admin can delete assets
 *       404:
 *         description: Not Found - Asset not found
 */
assetRouter.delete('/api/assets/:id', userAuth, async (req, res) => {
    try{
        const assetId = req.params.id;

        const asset = await Asset.findById(assetId);
        const userWantsToDeleteId = req.user._id;
        const userWantsToDelete = await User.findById(userWantsToDeleteId);
        if(userWantsToDelete.role !== "admin"){
            throw new Error("Only admin can delete assets");
        }
        if (!asset) {
            throw new Error('Asset already not present');
        }
        await Asset.findByIdAndDelete(assetId);
        await AssetAssignment.deleteMany({ assetId: assetId });
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
