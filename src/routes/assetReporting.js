const express = require('express');
const assetReportingRouter = express.Router();
const Asset = require('../models/asset');
const User = require('../models/user');
const { userAuth } = require('../middleware/auth');


// Get count of assets by status(admin only)
/**
 * @swagger
 * /api/reports/assets-by-status:
 *   get:
 *     summary: Get count of assets by status
 *     tags: [Asset Reporting]
 *     description: This endpoint allows an admin to view the count of assets grouped by their status.
 *     responses:
 *       200:
 *         description: Successfully retrieved asset counts by status
 *       403:
 *         description: Forbidden - Only admin can view asset counts by status
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
assetReportingRouter.get('/api/reports/assets-by-status', userAuth, async (req, res) => {

    try {
        const userWantsToViewId = req.user._id;
        const userWantsToView = await User.findById(userWantsToViewId);
        // Check if user is admin
        if (userWantsToView.role !== "admin") {
            return res.status(403).json({ message: 'Only admin can view asset counts by status' });
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
        data: assetCounts
        });
    } catch (error) {
        console.error('Error fetching asset counts:', error);
        res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
        });
    }
})

//Get count of assets by type(admin only)
/**
 * @swagger
 * /api/reports/assets-by-type:
 *   get:
 *     summary: Get count of assets by type
 *     tags: [Asset Reporting]
 *     description: This endpoint allows an admin to view the count of assets grouped by their type.
 *     responses:
 *       200:
 *         description: Successfully retrieved asset counts by type
 *       403:
 *         description: Forbidden - Only admin can view asset counts by type
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
assetReportingRouter.get('/api/reports/assets-by-type', userAuth, async (req, res) => {
    try {
        const userWantsToViewId = req.user._id;
        const userWantsToView = await User.findById(userWantsToViewId);
        // Check if user is admin
        if (userWantsToView.role !== "admin") {
            return res.status(403).json({ message: 'Only admin can view asset counts by type' });
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
        data: assetCounts
        });
    } catch (error) {
        console.error('Error fetching asset counts by type:', error);
        res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
        });
    }
});

//Get assignment summary for all users(admin only)
/**
 * @swagger
 * /api/reports/assignment-summary:
 *   get:
 *     summary: Get assignment summary for all users
 *     tags: [Asset Reporting]
 *     description: This endpoint allows an admin to view a summary of asset assignments for all users.
 *     responses:
 *       200:
 *         description: Successfully retrieved assignment summary
 *       403:
 *         description: Forbidden - Only admin can view assignment summary
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
assetReportingRouter.get('/api/reports/assignment-summary', userAuth, async (req, res) => {
    try {
        const userWantsToViewId = req.user._id;
        const userWantsToView = await User.findById(userWantsToViewId);
        // Check if user is admin
        if (userWantsToView.role !== "admin") {
            return res.status(403).json({ message: 'Only admin can view assignment summary' });
        }
        const assetCounts = await Asset.aggregate([
            {
                $match: {
                    assignedTo: { $ne: null } // Exclude unassigned assets
                }
            },
        {
            $group: {
            _id: '$assignedTo',
            count: { $sum: 1 },
            name : { $push: '$name' } // Collect asset names assigned to each user
            }
        },
        {
            $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
            }
        },
         {
                $match: {
                    user: { $ne: [] } // Exclude if no matching user found
                }
            },
        {
            $project: {
            _id: 0,
            user: { $arrayElemAt: ['$user', 0] },
            assignedAssets: '$name'
            }
        }
        ]);
        // Sort by count in descending order
        assetCounts.sort((a, b) => b.count - a.count);

        res.status(200).json({
        success: true,
        data: assetCounts
        });
    } catch (error) {
        console.error('Error fetching assignment summary:', error);
        res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
        });
    }
});

module.exports = assetReportingRouter;