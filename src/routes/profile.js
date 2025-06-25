const express = require('express');
const User = require("../models/user");
const { userAuth } = require("../middleware/auth");
const profileRouter = express.Router();
const { validateUpdateProfileData }  = require("../utils/validation");


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
profileRouter.put("/api/users/:id",userAuth, async (req, res) => {
    try{
        if(!validateUpdateProfileData(req)){
            throw new Error("Invalid update fields");
        }

        const loggedInUserId = req.params.id;
        const loggedInUser = await User.findById(loggedInUserId);
        if(!loggedInUser){
            throw new Error("User not found");
        }
        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key]);
        await loggedInUser.save();

        res.status(200).json({ message: `${loggedInUser.firstName} ${loggedInUser.lastName} your profile updated successfully` });

    }catch(e){
        res.status(400).json({ message: "Something went wrong", error: e.message });
    }
})


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
profileRouter.get("/api/users/:id", userAuth, async (req, res) => {
    try{
        const userWantsToView = req.user;
        if(userWantsToView.role !== "admin"){
            throw new Error("Only admin can view user details");
        }
        const user = await User.findById(req.params.id);
        if(!user){
            throw new Error("User not found");
        }
        user.password = undefined;
        res.status(200).json({
            "message":"User fetched successfully",
            "user": user
        });
    }catch(e){
        res.status(400).json({ message: "Something went wrong", error: e.message });
    }
})

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
profileRouter.get("/api/users", userAuth, async (req, res) => {
    try{
        const userWantsToView = req.user;
        if(userWantsToView.role !== "admin"){
            throw new Error("Only admin can view all users");
        }
        const users = await User.find({});
        users.forEach(user => {
            user.password = undefined; // Hide password from response
        });
        res.status(200).json(users);
    }catch(e){
        res.status(400).json({ message: "Something went wrong", error: e.message });
    }
})


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
profileRouter.delete("/api/users/:id",userAuth, async (req, res) => {
    const userId = req.params.id;
    const userWantsToDelete = req.user;
    try{
        if(userWantsToDelete.role !== "admin"){
        throw new Error("Only admin can delete users");
    }
        const user = await User.findByIdAndDelete(userId);
        if(!user){
            throw new Error("User not found!!");
        }
        res.status(200).json({
            "message":"User deleted successfully"
        });
    }catch(e){
        res.status(400).json({ message: "Something went wrong", error: e.message });
    }
});

module.exports = profileRouter;