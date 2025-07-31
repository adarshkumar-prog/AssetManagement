const express = require('express');
const assetReportingRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const assetReportingController = require('../controllers/assetReportingController');


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
assetReportingRouter.get('/reports/assets-by-status', userAuth, assetReportingController.getCountOfAssetByStatus);

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
assetReportingRouter.get('/reports/assets-by-type', userAuth, assetReportingController.getCountOfAssetByType);

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
assetReportingRouter.get('/reports/assignment-summary', userAuth, assetReportingController.assignmentSummary);

module.exports = assetReportingRouter;