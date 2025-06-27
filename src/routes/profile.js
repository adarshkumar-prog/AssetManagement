const express = require('express');
const User = require("../models/user");
const { userAuth } = require("../middleware/auth");
const profileRouter = express.Router();
const { updateUser, getUserById, getAllUsers, deleteUser } = require("../middleware/profile");


//Update user information
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     description: This endpoint allows a user to update their profile information.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User profile updated successfully
 */
profileRouter.put("/api/users/:id",userAuth, updateUser);


// Get user by ID(admin only)
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Profile]
 *     description: This endpoint allows an admin to view a user's details by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve.
 *     responses:
 *       200:
 *         description: User fetched successfully
 */
profileRouter.get("/api/users/:id", userAuth, getUserById)

// Get all users (admin only)
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Profile]
 *     description: This endpoint allows an admin to view all users.
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */
profileRouter.get("/api/users", userAuth, getAllUsers)


// Delete user (admin only)
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Profile]
 *     description: This endpoint allows an admin to delete a user by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete.
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
profileRouter.delete("/api/users/:id",userAuth, deleteUser);

module.exports = profileRouter;