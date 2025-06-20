const express = require('express');
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require('bcrypt');
const User = require("../models/user");
const authRouter = express.Router();

//Register a new user
authRouter.post("/api/auth/register", async (req, res) => {

    try{
        //Validate the request body
        validateSignUpData(req);

        const { firstName, lastName, email, role, department, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        // Creating a new instance of User model
        // and saving it to the database
        const user = new User({firstName, lastName, email, role, department, password: passwordHash});
       
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
            const token = await user.getJWT();
            res.cookie("token", token, {
                expires: new Date(Date.now() + 3600000), // 1 hour
            });
            res.status(200).json({ message: "Login successful", user });
        }
    }catch(err) {
        res.status(400).json({ message: "Something went wrong", error: err.message });
    }
})

//Logout user
authRouter.post("/logout", (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    }).status(200).json("Logout successful");
})

module.exports = authRouter;