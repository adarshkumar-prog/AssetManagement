const { validateAssetData } = require('../middleware/validation');
const User = require('../models/user');
const Asset = require('../models/asset');
const AssetAssignment = require('../models/assetAssignementModel');
const { assetToDTO } = require('../dto/asset.dto');
const { assetAssignmentToDTO } = require('../dto/assetAssignment.dto');

exports.createAsset = async (req, res) => {
  try {
    const { name, serialNumber, status } = req.body;
    const userWantsToCreateId = req.user.id;
    const userWantsToCreate = await User.findById(userWantsToCreateId);
    if(userWantsToCreate.role !== "admin"){
        throw new Error("Only admin can create assets");
    }
    const isAlreadyExists = await Asset.findOne({ serialNumber });
    if (isAlreadyExists) {
      return res.status(400).json({
        success: false,
        error: true,
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
      error: false,
      message: 'Asset created successfully',
      savedAsset: assetToDTO(savedAsset)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true + " , " + error.message,
      message: 'Server Error'
    });
  }
}

exports.getAssetsWithFilterOptions = async (req, res) => {
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
      error: false,
      message: 'Assets fetched successfully',
      count: assets.length,
      assets: assets.map((asset) => assetToDTO(asset))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true + " , " + error.message,
      message: 'Server Error'
    });
  }
}

exports.getAssetById = async (req, res) => {
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
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Asset not found'
      });
    }

    if(asset.status === 'Assigned') {
      const assignment = await AssetAssignment.findOne({ assetId: asset._id, status: 'Assigned' })
        .populate('assignedTo', 'firstName lastName email');
      return res.status(200).json({
        success: true,
        error: false,
        message: 'Asset fetched successfully',
        data: {
          ...assetAssignmentToDTO(assignment),
          ...assetToDTO(asset),
          ...asset.toObject(),
          assignedTo: assignment ? assignment.assignedTo : null
        }
      });
    }

    res.status(200).json({
      success: true,
      error: false,
      message: 'Asset fetched successfully',
      data: asset
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      error: true + " , " + error.message,
      message: 'Server Error'
    });
  }
}

exports.updateAsset = async (req, res) => {
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
            error: false,
            message: 'Asset updated successfully',
            asset: assetToDTO(asset)
        });
    }catch(err) {
        res.status(500).json({
            success: false,
            error: true + " , " + err.message,
            message: 'Server Error'
        });
    }
}

exports.deleteAsset = async (req, res) => {
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
            error: false,
            message: 'Asset deleted successfully'
        });
    }catch(err){
        res.status(500).json({
            success: false,
            error: true + " , " + err.message,
            message: 'Server Error'
        });
    }
}