const express = require('express');
const assetAssignmentRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const assetAssignmentController = require('../controllers/assetAssignmentController');  


//get all asset assigned currently
assetAssignmentRouter.get('/api/getAllCurrentlyAssigned', userAuth, assetAssignmentController.getAllCurrentlyAssignedAssets);

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
assetAssignmentRouter.post('/api/assets/:id/assign', userAuth, assetAssignmentController.assignAsset);

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
assetAssignmentRouter.post('/api/assets/:id/unassign', userAuth, assetAssignmentController.assetUnassign);

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
assetAssignmentRouter.get('/api/assets/assigned/:userId', userAuth, assetAssignmentController.getAllAssetAssignToSpecificUser);

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
assetAssignmentRouter.get('/api/assetsIsAvailable', userAuth, assetAssignmentController.getAllAvailableAsset);

// Get all previously assigned assets of a user (admin only)
assetAssignmentRouter.get('/api/assets/previouslyAssigned/:userId', userAuth, assetAssignmentController.getAllPreviouslyAssignedAsset);

// user wants to return an asset
assetAssignmentRouter.post('/api/assets/:id/return', userAuth, assetAssignmentController.userWantsToReturn);

// Get all asset assigned and unassigned between certain time period (admin only)
assetAssignmentRouter.get('/api/asset/assignedBetween', userAuth, assetAssignmentController.getAllAssetAssignedBetweenDates);

module.exports = assetAssignmentRouter;