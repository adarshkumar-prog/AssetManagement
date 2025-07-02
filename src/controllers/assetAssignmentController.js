const Asset = require('../models/asset');
const User = require('../models/user');
const AssetAssignment = require('../models/assetAssignementModel');
const { assetToDTO } = require('../dto/asset.dto');
const { assetAssignmentToDTO }  = require('../dto/assetAssignment.dto');

exports.assignAsset = async(req, res) => {
  const assetId = req.params.id;
  const userId = req.body.userId;

  const userWantsToAssignId = req.user._id;
  const userWantsToAssign = await User.findById(userWantsToAssignId);
  if (userWantsToAssign.role !== "admin") {
    return res.status(403).json({ success: false, error: true, message: 'Only admin can assign assets' });
  }

  try {
    const asset = await Asset.findById(assetId);
    const user = await User.findById(userId);

    if (!asset || !user) {
      throw new Error({ message: 'Asset or User not found' });
    }
    if(asset.status !== 'Available') {
      return res.status(400).json({ success: false, error: true, message: 'Asset is not available for assignment' });
    }
    asset.status = 'Assigned';
    await asset.save();

    const assetAssignment = new AssetAssignment({
      assetId: asset._id,
      assignedTo: user._id,
      assignedAt: new Date(),
      status: 'Assigned'
    });
    await assetAssignment.save();

    res.status(200).json({ success: true, error: false, message: 'Asset assigned successfully', asset:assetToDTO(asset) });
  } catch (error) {
    console.error('Error assigning asset:', error);
    res.status(500).json({ success: false, error: true, message: 'Internal server error' });
  }
}

exports.assetUnassign = async(req, res) => {
  const assetId = req.params.id;

  try {
    const userWantsToUnassignId = req.user._id;
    const userWantsToUnassign = await User.findById(userWantsToUnassignId);
    if (userWantsToUnassign.role !== "admin") {
      return res.status(403).json({ success: false, error: true, message: 'Only admin can unassign assets' });
    }
    const asset = await Asset.findById(assetId);
    if (!asset) {
      throw new Error({ message: 'Asset not found' });
    }
    if( asset.status !== 'Assigned') {
      return res.status(400).json({ success: false, error: true, message: 'Asset is not currently assigned' });
    }
    asset.status = 'Available';
    const assetAssignment = await AssetAssignment.findOne({ assetId: asset._id, status: 'Assigned' });
    if (assetAssignment) {
      assetAssignment.status = 'Unassigned';
      assetAssignment.unassignedAt = new Date();
      await assetAssignment.save();
    }
    await asset.save();

    res.status(200).json({ success: true, error: false, message: 'Asset unassigned successfully', asset:assetToDTO(asset) });
  } catch (error) {
    console.error('Error unassigning asset:' + error);
    res.status(500).json({ success: false, error: true, message: 'Internal server error' });
  }
}

exports.getAllAssetAssignToSpecificUser = async(req, res) => {
    const userId = req.params.userId;
    try{
        const userWantsToViewId = req.user._id;
        const userWantsToView = await User.findById(userWantsToViewId);
        if(userWantsToView.role !== "admin"){
            return res.status(403).json({ success: false, error: true, message: 'Only admin can view assigned assets' });
        }
        const user = await User.findById(userId);
        if(!user){
            throw new Error({message: 'User not found'});
        }
        const assignedAsset = await AssetAssignment.find({ assignedTo: userId })
            .populate('assetId', 'name serialNumber status')
            .populate('assignedTo', 'firstName lastName email');
        if (assignedAsset.length === 0) {
            return res.status(404).json({ success: true, error: false, message: 'No assets assigned to this user' });
        }
        const assignedAssets = assignedAsset.map(assignment => ({
            asset: assignment.assetId,
            assignedAt: assignment.assignedAt,
            status: assignment.status,
            unassignedAt: assignment.unassignedAt,
            assignedTo: {
                firstName: assignment.assignedTo.firstName,
                lastName: assignment.assignedTo.lastName,
                email: assignment.assignedTo.email
            }
        }));
        res.status(200).json({ success: true, error: false, assignedAssets:assetAssignmentToDTO(assignedAssets) });
    }catch(error) {
        console.error('Error fetching assigned assets:', error);
        res.status(500).json({ success: false, error: true, message: 'Internal server error' });
    }
}

exports.getAllAvailableAsset = async(req, res) => {
    try {
        const availableAssets = await Asset.find({ status: 'Available' });
        if (availableAssets.length === 0) {
            return res.status(404).json({ success: false, error: true, message: 'No available assets found' });
        }
        
         // Return the list of available assets
        res.status(200).json({ success: true, error: false, count: availableAssets.length, message: 'Available assets fetched successfully', availableAssets:assetToDTO(availableAssets) });
    } catch (error) {
        console.error('Error fetching available assets:', error);
        res.status(500).json({ success: false, error: true, message: 'Internal server error' });
    }
}

exports.getAllPreviouslyAssignedAsset = async(req, res) => {
    const userId = req.params.userId;
    try{
        const userWantsToViewId = req.user._id;
        const userWantsToView = await User.findById(userWantsToViewId);
        if(userWantsToView.role !== "admin"){
            return res.status(403).json({ success: false, error: true, message: 'Only admin can view previously assigned assets' });
        }
        const user = await User.findById(userId);
        if(!user){
            throw new Error({message: 'User not found'});
        }
        const previouslyAssignedAsset = await AssetAssignment.find({ assignedTo: userId, status: 'Unassigned' })
            .populate('assetId', 'name serialNumber status')
            .populate('assignedTo', 'firstName lastName email');
        if (previouslyAssignedAsset.length === 0) {
            return res.status(404).json({ success: true, error: false, message: 'No previously assigned assets found for this user' });
        }
        const previouslyAssignedAssets = previouslyAssignedAsset.map(assignment => ({
            asset: assignment.assetId,
            assignedAt: assignment.assignedAt,
            unassignedAt: assignment.unassignedAt,
            assignedTo: {
                firstName: assignment.assignedTo.firstName,
                lastName: assignment.assignedTo.lastName,
                email: assignment.assignedTo.email
            }
        }));
        res.status(200).json({ success: true, error: false, previouslyAssignedAssets:assetAssignmentToDTO(previouslyAssignedAssets) });
    }catch(error) {
        console.error('Error fetching previously assigned assets:', error);
        res.status(500).json({ success: false, error: true, message: 'Internal server error' });
    }
}

exports.userWantsToReturn = async(req, res) => {
  const assetId = req.params.id;
  const userId = req.user._id;
  try{
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, error: true, message: 'Asset not found' });
    }
    if (asset.status !== 'Assigned') {
      return res.status(400).json({ success: false, error: true, message: 'Asset is not currently assigned' });
    }
    const assetAssignment = await AssetAssignment.findOne({ assetId: asset._id, assignedTo: userId, status: 'Assigned' });
    if (!assetAssignment) {
      return res.status(403).json({ success: false, error: true, message: 'You are not authorized to return this asset' });
    }
    asset.status = 'Available';
    assetAssignment.status = 'Unassigned';
    assetAssignment.unassignedAt = new Date();
    
    await asset.save();
    await assetAssignment.save();

    res.status(200).json({ success: true, error: false, message: 'Asset returned successfully', asset:assetToDTO(asset) });
  }catch(error) {
    console.error('Error returning asset:', error);
    res.status(500).json({ success: false, error: true, message: 'Internal server error' });
  }
}

exports.getAllAssetAssignedBetweenDates = async(req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const userWantsToViewId = req.user._id;
    const userWantsToView = await User.findById(userWantsToViewId);
    if (userWantsToView.role !== "admin") {
      return res.status(403).json({ success: false, error: true, message: 'Only admin can view assigned assets between dates' });
    }

    const assignedAssets = await AssetAssignment.find({
      $or: [
        { assignedAt: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { unassignedAt: { $gte: new Date(startDate), $lte: new Date(endDate) } }
      ]
    })
      .populate('assignedTo', 'firstName lastName email')
      .populate('assetId', 'name serialNumber status')
      .exec();

    assignedAssets.forEach(assignment => {
      if (assignment.assignedAt) assignment.assignedAt = assignment.assignedAt.toISOString();
      if (assignment.unassignedAt) assignment.unassignedAt = assignment.unassignedAt.toISOString();
    });
    if (assignedAssets.length === 0) {
      return res.status(404).json({ success: true, error: false, message: 'No assets assigned between the given dates' });
    }
    res.status(200).json({
      success: true,
      error: false,
      assignedAssets:assetAssignmentToDTO(assignedAssets)
    })
  } catch (error) {
    console.error('Error fetching assets assigned between dates:', error);
    res.status(500).json({ success: false, error: true, message: 'Internal server error' });
  }
}
