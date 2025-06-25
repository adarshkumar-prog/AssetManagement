const express = require('express');
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require('bcrypt');
const User = require("../models/user");
const authRouter = express.Router();
const { userAuth } = require("../middleware/auth");

///Register a new user
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: This endpoint allows a new user to register.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 */
authRouter.post("/api/auth/register", async (req, res) => {

    try{
        //Validate the request body
        validateSignUpData(req);

        const { firstName, lastName, email, password, department, role } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        // Creating a new instance of User model
        // and saving it to the database
        const user = new User({firstName, lastName, email, role, department, password: passwordHash, assignedAssets: [], previouslyAssignedAssets: []});
       
        await user.save();
        res.status(201).json({
            "message":"User registered successfully"
        });
    }catch(e){
        if (e.code === 11000) {
            // Duplicate key error
            res.status(400).json({ message: "Email already exists" });
        } else {
            res.status(400).json({ message: e.message });
        }
    }
})

// User login (returns JWT token)
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to get JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 */

authRouter.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email : email});

        if(!user){
            throw new Error("User not found");
        }

        const isPasswordValid = await user.ValidatePassword(password);
        
        if(!isPasswordValid){
            throw new Error("Invalid password");
        }
        else {
            user.password = undefined;
            const token = await user.getJWT();
            res.status(200).json({ 
    message: "Login successful", 
    token,
    user 
});

        }
    }catch(err) {
        res.status(400).json({ message: "Something went wrong", error: err.message });
    }
})

//Logout user
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
authRouter.post("/logout", userAuth, (req, res) => {
    
    res.cookie("token", null, {
        expires: new Date(Date.now())
    }).status(200).json("Logout successful");
})

module.exports = authRouter;
