const express = require('express');
const User = require("../models/user");
const { userAuth } = require("../middleware/auth");
const profileRouter = express.Router();
const { validateUpdateProfileData }  = require("../utils/validation");

//Update user information
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
        res.status(400).send("Something went wrong: " + e.message);
    }
})


// Get user by ID
profileRouter.get("/api/users/:id", async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user){
            throw new Error("User not found");
        }
        res.status(200).send({
            "message":"User fetched successfully",
            "user": user
        });
    }catch(e){
        res.status(400).send("Something went wrong: " + e.message);
    }
})

// Get all users (admin only)
profileRouter.get("/api/users", userAuth, async (req, res) => {
    try{
        const userWantsToView = req.user;
        if(userWantsToView.role !== "admin"){
            throw new Error("Only admin can view all users");
        }
        const users = await User.find({});
        res.status(200).send(users);
    }catch(e){
        res.status(400).send("Something went wrong: " + e.message);
    }
})


// Delete user (admin only)
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
        res.status(200).send({
            "message":"User deleted successfully"
        });
    }catch(e){
        res.status(400).send("Something went wrong: " + e.message);
    }
});

module.exports = profileRouter;
// profileRouter is used to handle user profile related routes