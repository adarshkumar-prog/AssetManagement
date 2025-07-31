const express = require('express');
const assetRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const assetController = require('../controllers/assetController');



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
assetRouter.post('/assets', userAuth, assetController.createAsset);

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
assetRouter.get('/assets', userAuth, assetController.getAssetsWithFilterOptions);

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
assetRouter.get('/assets/:id', userAuth, assetController.getAssetById);

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
assetRouter.patch('/assets/:id', userAuth, assetController.updateAsset);

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
assetRouter.delete('/assets/:id', userAuth, assetController.deleteAsset);

module.exports = assetRouter;
