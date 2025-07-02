const Asset = require('../models/asset');
const User = require('../models/user');
const AssetAssignment = require('../models/assetAssignementModel');

exports.getCountOfAssetByStatus = async (req, res) => {

    try {
        const userWantsToViewId = req.user._id;
        const userWantsToView = await User.findById(userWantsToViewId);
        if (userWantsToView.role !== "admin") {
            return res.status(403).json({ success: false, error: true, message: 'Only admin can view asset counts by status' });
        }
        const assetCounts = await Asset.aggregate([
        {
            $group: {
            _id: '$status',
            count: { $sum: 1 }
            }
        },
        {
            $project: {
            _id: 0,
            status: '$_id',
            count: 1
            }
        }
        ]);
        assetCounts.sort((a, b) => b.count - a.count);

        res.status(200).json({
        success: true,
        error: false,
        data: assetCounts
        });
    } catch (error) {
        console.error('Error fetching asset counts:', error);
        res.status(500).json({
        success: false,
        error: true,
        message: 'Internal server error'
        });
    }
}

exports.getCountOfAssetByType = async (req, res) => {
    try {
        const userWantsToViewId = req.user._id;
        const userWantsToView = await User.findById(userWantsToViewId);
        // Check if user is admin
        if (userWantsToView.role !== "admin") {
            return res.status(403).json({ success: false, error: true, message: 'Only admin can view asset counts by type' });
        }
        const assetCounts = await Asset.aggregate([
        {
            $group: {
            _id: '$name',
            // Assuming 'name' is the field that represents the type of asset
            count: { $sum: 1 }
            }
        },
        {
            $project: {
            _id: 0,
            type: '$_id',
            count: 1
            }
        }
        ]);
        //sort by count in descending order
        assetCounts.sort((a, b) => b.count - a.count);
    
        res.status(200).json({
        success: true,
        error: false,
        data: assetCounts
        });
    } catch (error) {
        console.error('Error fetching asset counts by type:', error);
        res.status(500).json({
        success: false,
        error: true,
        message: 'Internal server error'
        });
    }
}

exports.assignmentSummary = async (req, res) => {
    try {
        const userWantsToViewId = req.user._id;
        const userWantsToView = await User.findById(userWantsToViewId);
        // Check if user is admin
        if (userWantsToView.role !== "admin") {
            return res.status(403).json({ success: false, error: true, message: 'Only admin can view assignment summary' });
        }
        const assignmentSummary = await AssetAssignment.aggregate([
            {
                $group: {
                    _id: {
                        user: '$assignedTo',
                        unassignedAt: '$unassignedAt'
                    },
                    assignedAssets: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    user: '$_id.user',
                    assignedAssets: 1,
                    unassignedAt: '$_id.unassignedAt'
                }
            }
        ]);
        res.status(200).json({
            success: true,
            error: false,
            data: assignmentSummary
        });
    } catch (error) {
        console.error('Error fetching assignment summary:', error);
        res.status(500).json({
            success: false,
            error: true,
            message: 'Internal server error'
        });
    }
};